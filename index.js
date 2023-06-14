const Footprint = require('./models/footprintModel');
const { docToObject, getUser, findDifferenceInObjects } = require('./utils');

const plugin = (schema, options = {}) => {
  // TODO: Refine how array changes are logged using hashing
  // TODO: Extra test cases to check nested fieldToRemove
  // TODO: Log changes in array up to a certain length, otherwise show generic message

  if (!options?.operations) options.operations = ['update'];
  if (options?.storeDocuments !== false) options.storeDocuments = true;

  // adding findById* operations is redundant because it already
  // uses findOne* query internally by default
  const updateOperations = ['findOneAndUpdate'];
  const deleteOperations = ['findOneAndDelete', 'findOneAndRemove'];

  // Updates
  schema.pre(updateOperations, generatePreUpdateHook(options));
  schema.post(updateOperations, generatePostUpdateHook(options));
  // schema.pre('updateMany', generatePreUpdateManyHook(options));
  // schema.post('updateMany', generatePostUpdateManyHook(options));

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
      queryObject?.options?.footprint !== true
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
      queryObject?.options?.footprint !== true
    ) {
      return next();
    }

    await createFootprint(
      generateFootprintObject(
        options,
        queryObject?.model?.modelName,
        [],
        null,
        docToObject(doc),
        getUser(queryObject?.options, options),
        'Delete'
      ),
      queryObject?.options?.session
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

    if (saveOptions?.footprint !== true) return next();

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
    if (saveOptions?.footprint !== true) return next();

    if (document._wasNew) {
      if (!options?.operations?.includes('create')) {
        return next();
      }

      await createFootprint(
        generateFootprintObject(
          options,
          document?.constructor?.modelName,
          [],
          docToObject(doc),
          null,
          getUser(saveOptions, options),
          'Create'
        ),
        saveOptions?.session
      );
    } else {
      if (!options?.operations?.includes('update')) {
        return next();
      }

      const oldDocument = document?.$__?.oldDocument;
      let changesArray = [];

      findDifferenceInObjects(
        changesArray,
        docToObject(doc),
        docToObject(oldDocument)
      );

      await createFootprint(
        generateFootprintObject(
          options,
          document?.constructor?.modelName,
          changesArray,
          docToObject(doc),
          docToObject(oldDocument),
          getUser(saveOptions, options),
          'Update'
        ),
        saveOptions?.session
      );
    }

    next();
  };
}

// function generatePreUpdateManyHook(options) {
//   return async function (next) {
//     // 'this' refers to Query object
//     // https://mongoosejs.com/docs/middleware.html#types-of-middleware
//     const queryObject = this;
//     if (queryObject?.options?.footprint == null)
//       queryObject.options.footprint = true;

//     if (
//       !options?.operations?.includes('update') ||
//       queryObject?.options?.footprint !== true
//     ) {
//       return next();
//     }

//     queryObject.oldDocuments = await queryObject
//       .clone()
//       .find(queryObject.getFilter());

//     next();
//   };
// }

// function generatePostUpdateManyHook(options) {
//   return async function (doc, next) {
//     const queryObject = this;
//     if (queryObject?.options?.footprint == null)
//       queryObject.options.footprint = true;

//     if (
//       !options?.operations?.includes('update') ||
//       queryObject?.options?.footprint !== true
//     ) {
//       return next();
//     }

//     const updatedDocuments = await queryObject
//       .clone()
//       .find(queryObject.getFilter());

//     const footprints = [];

//     for (let i = 0; i < updatedDocuments.length; i++) {
//       let changesArray = [];

//       findDifferenceInObjects(
//         changesArray,
//         docToObject(updatedDocuments[i]),
//         docToObject(queryObject.oldDocuments[i])
//       );

//       footprints.push(
//         generateFootprintObject(
//           options,
//           queryObject?.model?.modelName,
//           changesArray,
//           docToObject(updatedDocuments[i]),
//           docToObject(queryObject.oldDocuments[i]),
//           getUser(queryObject?.options, options),
//           'Update'
//         )
//       );
//     }

//     await createFootprint(footprints, queryObject?.options?.session);

//     next();
//   };
// }

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
      queryObject?.options?.footprint !== true
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
      queryObject?.options?.footprint !== true
    ) {
      return next();
    }

    let changesArray = [];

    findDifferenceInObjects(
      changesArray,
      docToObject(doc),
      docToObject(queryObject.oldDocument)
    );

    await createFootprint(
      generateFootprintObject(
        options,
        queryObject?.model?.modelName,
        changesArray,
        docToObject(doc),
        docToObject(queryObject.oldDocument),
        getUser(queryObject?.options, options),
        'Update'
      ),
      queryObject?.options?.session
    );

    next();
  };
}

function generateFootprintObject(
  options,
  modelName,
  changesArray,
  newDocument,
  oldDocument,
  user,
  type = 'Update'
) {
  if (
    // if no changes made in an update operation
    (changesArray?.length === 0 && type === 'Update') ||
    // or if delete/create was not successful, don't create footprint
    (type === 'Delete' && !oldDocument) ||
    (type === 'Create' && !newDocument)
  )
    return null;

  const documentId = newDocument?._id ?? oldDocument?._id ?? null;

  return {
    modelName,
    documentId,
    oldDocument: options?.storeDocuments ? oldDocument : {},
    newDocument: options?.storeDocuments ? newDocument : {},
    user,
    changes: changesArray,
    typeOfChange: type,
  };
}

async function createFootprint(footprintObject, session) {
  if (!footprintObject) return;
  else if (!Array.isArray(footprintObject)) footprintObject = [footprintObject];

  await Footprint.create(footprintObject, session ? { session } : null);
}

module.exports = {
  plugin,
  ...require('./utils/finders'),
};
