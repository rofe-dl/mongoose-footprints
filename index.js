const Footprint = require('./models/footprintModel');
const { docToObject, getUser, recursiveLogObjectChanges } = require('./utils');

const plugin = (schema, options = {}) => {
  // TODO: Replace findByIdAndUpdate operations in codebase as they don't work with the middleware
  // TODO: Handle reference changes separately by checking objectID
  // TODO: Work on error handling
  // TODO: Write unit test cases for the plugin, test case if document not found
  // TODO: Test out all data types
  // TODO: Work with logging array changes

  if (!options?.operations) options.operations = ['update'];

  // store documents in footprint by default, if set to false by user manually, don't store
  if (options?.storeDocuments !== false) options.storeDocuments = true;

  const updateOperations = ['findOneAndUpdate', 'findByIdAndUpdate'];
  const deleteOperations = [
    'findOneAndDelete',
    'findOneAndRemove',
    'findByIdAndDelete',
    'findByIdAndRemove',
  ];

  // Updates
  schema.pre(updateOperations, generatePreUpdateHook(options));
  schema.post(updateOperations, generatePostUpdateHook(options));

  // Creates (when isNew == true) and Updates (when isNew == false)
  schema.pre('save', generatePreSaveHook(options));
  schema.post('save', generatePostSaveHook(options));

  // Deletes
  schema.pre(deleteOperations, generatePreDeleteHook(options));
  schema.post(deleteOperations, generatePostDeleteHook(options));
};

function generatePreDeleteHook(options) {
  return async function (next) {
    const queryObject = this;
    if (queryObject?.options?.footprint == null)
      queryObject.options.footprint = true;

    if (
      !options?.operations?.includes('delete') ||
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

function generatePostDeleteHook(options) {
  return async function (doc, next) {
    const queryObject = this;
    if (queryObject?.options?.footprint == null)
      queryObject.options.footprint = true;

    if (
      !options?.operations?.includes('delete') ||
      !queryObject?.options?.footprint
    ) {
      return next();
    }

    await createFootprint(
      options,
      queryObject?.model?.modelName,
      [],
      null,
      docToObject(doc),
      queryObject?.options?.session,
      getUser(queryObject?.options, options),
      'Delete'
    );

    next();
  };
}

function generatePreSaveHook(options) {
  return async function (next) {
    // 'this' refers to Document
    // https://mongoosejs.com/docs/middleware.html#types-of-middleware
    const document = this;

    // save options can be accessed with this.$__.saveOptions
    // https://github.com/Automattic/mongoose/issues/7457#issuecomment-620610979
    const saveOptions = document.$__?.saveOptions;
    if (saveOptions?.footprint == null) saveOptions.footprint = true;

    if (!saveOptions?.footprint) return next();

    if (document.isNew) {
      if (!options?.operations?.includes('create')) {
        return next();
      }

      document._wasNew = true;
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

    if (saveOptions?.footprint == null) saveOptions.footprint = true;
    if (!saveOptions?.footprint) return next();

    if (document._wasNew) {
      if (!options?.operations?.includes('create')) {
        return next();
      }

      await createFootprint(
        options,
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
        options,
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
    if (queryObject?.options?.footprint == null)
      queryObject.options.footprint = true;

    // needed to get the updated doc instead of old one in post hook
    queryObject.options.new = true;

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
    if (queryObject?.options?.footprint == null)
      queryObject.options.footprint = true;

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

    await createFootprint(
      options,
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
  options,
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

  const previous = await Footprint.findOne({ documentId, modelName }).sort(
    '-version'
  );

  let newFootprint = {
    modelName,
    documentId,
    oldDocument: options?.storeDocuments ? oldDocument : {},
    updatedDocument: options?.storeDocuments ? updatedDocument : {},
    user,
    changes: changesArray,
    typeOfChange: type,
    version: previous ? previous.version + 1 : 1,
  };

  // if using options, we have to pass document in an array
  // look at https://mongoosejs.com/docs/api.html#model_Model-create
  if (session) newFootprint = [newFootprint];

  await Footprint.create(newFootprint, session ? { session } : null);
}

module.exports = {
  plugin,
  ...require('./utils/finders'),
};
