const _Footprint = require('./models/footprintModel');
const { docToObject, getUser, recursiveLogObjectChanges } = require('./utils');

module.exports.plugin = (schema, options = {}) => {
  // TODO: Replace findByIdAndUpdate operations in codebase as they don't work with the middleware
  // TODO: Delete many and Update many should be handled separately because they're multiple updates
  // TODO: Support logging document deletes
  // TODO: Non existing fields will either say new field or not say anything
  // TODO: Handle reference changes separately by checking objectID
  // TODO: Error handle the whole thing so server doesn't crash
  // TODO: Write get methods by version, document ID, model names, type
  // TODO: Comment out console logs, write test cases for the plugin

  if (!options?.operations) options.operations = ['update'];

  const updateOperations = ['findOneAndUpdate', 'update', 'updateOne'];
  const deleteOperations = ['findOneAndDelete', 'deleteOne'];

  // Updates
  schema.pre(updateOperations, generatePreUpdateHook(options));
  schema.post(updateOperations, generatePostUpdateHook(options));

  // Create (isNew == true) and Updates (isNew == false)
  schema.pre('save', generatePreSaveHook(options));
  schema.post('save', generatePostSaveHook(options));
};

function generatePreSaveHook(options) {
  return async function (next) {
    // 'this' refers to Document
    // https://mongoosejs.com/docs/middleware.html#types-of-middleware
    const document = this;

    // save options can be accessed with this.$__.saveOptions
    // https://github.com/Automattic/mongoose/issues/7457#issuecomment-620610979
    const saveOptions = document.$__?.saveOptions;
    if (!saveOptions?.footprint) return next();

    if (document.isNew) {
      if (!options?.operations?.includes('create')) {
        return next();
      }

      document.wasNew = true;
    } else {
      if (!options?.operations?.includes('update')) {
        return next();
      }

      document.$__.oldDocument = await document.constructor.findOne({
        _id: document._id,
      });
    }

    next();
  };
}

function generatePostSaveHook(options) {
  return async function (doc, next) {
    const document = this;
    const saveOptions = document?.$__?.saveOptions;

    if (!saveOptions?.footprint) return next();

    if (document.wasNew) {
      if (!options?.operations?.includes('create')) {
        return next();
      }

      await createFootprint(
        document?.constructor?.modelName,
        [],
        docToObject(doc),
        null,
        saveOptions?.session,
        getUser(saveOptions, options),
        'Create'
      );
    } else {
      if (!options?.operations?.includes('update')) {
        return next();
      }

      const oldDocument = document?.$__?.oldDocument;
      let changesArray = [];

      recursiveLogObjectChanges(
        changesArray,
        docToObject(doc),
        docToObject(oldDocument)
      );

      await createFootprint(
        document?.constructor?.modelName,
        changesArray,
        docToObject(doc),
        docToObject(oldDocument),
        saveOptions?.session,
        getUser(saveOptions, options)
      );
    }

    next();
  };
}

function generatePreUpdateHook(options) {
  return async function (next) {
    // 'this' refers to Query object
    // https://mongoosejs.com/docs/middleware.html#types-of-middleware
    const queryObject = this;

    if (
      !options?.operations?.includes('update') ||
      !queryObject?.options?.footprint
    ) {
      return next();
    }

    await queryObject
      .find(queryObject.getFilter())
      .cursor()
      .eachAsync((oldDocument) => {
        // attaching the old version to queryObject for use in post hook
        queryObject.oldDocument = oldDocument;
      });

    next();
  };
}

function generatePostUpdateHook(options) {
  return async function (doc, next) {
    const queryObject = this;

    if (
      !options?.operations?.includes('update') ||
      !queryObject?.options?.footprint
    ) {
      return next();
    }

    let changesArray = [];

    recursiveLogObjectChanges(
      changesArray,
      docToObject(doc),
      docToObject(queryObject.oldDocument)
    );

    // console.log(changesArray);

    await createFootprint(
      queryObject?.model?.modelName,
      changesArray,
      docToObject(doc),
      docToObject(queryObject.oldDocument),
      queryObject?.options?.session,
      getUser(queryObject?.options, options)
    );

    next();
  };
}

async function createFootprint(
  modelName,
  changesArray,
  updatedDocument,
  oldDocument,
  session,
  user,
  type = 'Update'
) {
  if (changesArray?.length === 0 && type === 'Update') return;

  const documentId = updatedDocument?._id;

  const previous = await _Footprint
    .findOne({ documentId, modelName })
    .sort('-version');

  let newFootprint = {
    modelName,
    documentId,
    oldDocument,
    updatedDocument,
    user,
    changes: changesArray,
    typeOfChange: type,
    version: previous ? previous.version + 1 : 1,
  };

  // if using options, we have to pass document in an array
  // look at https://mongoosejs.com/docs/api.html#model_Model-create
  if (session) newFootprint = [newFootprint];

  await _Footprint.create(newFootprint, session ? { session } : null);
}
