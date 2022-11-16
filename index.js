const isEqual = require('lodash.isequal');
const AuditLog = require('./auditLogModel');

module.exports.plugin = (schema, options = {}) => {
  // TODO: Replace findByIdAndUpdate operations in codebase as they don't work with the middleware
  // TODO: Delete many and Update many should be handled separately because the're multiple updates
  // TODO: Support logging document deletes, creates
  // TODO: Non existing fields will either say new field or not say anything
  // TODO: Handle reference changes separately by checking objectID
  // TODO: Error handle the whole thing so server doesn't crash
  // TODO: Say it supports sessions and deletes if session not committed

  const operations = ['findOneAndUpdate', 'update', 'updateOne'];

  schema.pre(operations, generatePreHook(options));
  schema.post(operations, generatePostHook());
};

function generatePreHook(options) {
  return async function (next) {
    // 'this' refers to Query object
    // https://mongoosejs.com/docs/middleware.html#types-of-middleware
    const queryObject = this;

    // saveEdits(this, options).then(next).catch(next); // TODO: handle errors?

    if (queryObject?.options?.disableLogging) next();

    await queryObject
      .find(queryObject.getFilter())
      .cursor()
      .eachAsync((oldDocument) => {
        // attaching the old version to queryObject for use in post hook
        queryObject.oldDocument = oldDocument;
      });

    queryObject.user = getUser(queryObject, options);

    next();
  };
}

function generatePostHook() {
  return async function (doc, next) {
    // 'this' refers to Query object
    // https://mongoosejs.com/docs/middleware.html#types-of-middleware
    const queryObject = this;

    if (queryObject?.options?.disableLogging) next();

    let changesArray = [];

    recursiveLogObjectChanges(
      changesArray,
      doc.toObject(),
      queryObject.oldDocument.toObject()
    );

    console.log(changesArray);

    await createAuditLog(
      queryObject,
      changesArray,
      queryObject.oldDocument.toObject(),
      doc.toObject()
    );

    next();
  };
}

function recursiveLogObjectChanges(
  changesArray,
  updatedObject,
  originalObject,
  message = 'Updated '
) {
  for (let [key, value] of Object.entries(updatedObject)) {
    if (key in originalObject) {
      const originalValue = originalObject[key];

      if (isObject(value)) {
        recursiveLogObjectChanges(
          changesArray,
          value,
          originalValue,
          message + `${key}.`
        );
      } else if (!isEqual(value, originalValue)) {
        changesArray.push(
          message + `${key} from '${originalValue}' to '${value}'`
        );
      }
    } else {
      // TODO: what to do if key not in old document
    }
  }
}

function getUser(queryObject, options) {
  // if User is required to log but not given, 'Unknown' is default
  // if not required to log, return 'System'
  if (options?.logUser) return queryObject?.options?.user || 'Unknown';
  else return 'System';
}

async function createAuditLog(
  queryObject,
  changesArray,
  oldDocument,
  updatedDocument,
  type = 'Update'
) {
  if (changesArray.length === 0 && type === 'Update') return;

  const documentId = updatedDocument?._id;
  const modelName = queryObject?.model?.modelName;
  const session = queryObject?.options?.session;

  const previous = await AuditLog.findOne({ documentId, modelName }).sort(
    '-version'
  );

  let newAuditLog = {
    modelName,
    documentId,
    oldDocument,
    updatedDocument,
    user: queryObject.user,
    changes: changesArray,
    typeOfChange: type,
    version: previous ? previous.version + 1 : 1,
  };

  // if passing sessions in options, we have to pass document in an array
  // look at https://mongoosejs.com/docs/api.html#model_Model-create
  if (session) newAuditLog = [newAuditLog];

  await AuditLog.create(newAuditLog, session ? { session } : null);
}

function isObject(object) {
  return object && !Array.isArray(object) && typeof object === 'object';
}
