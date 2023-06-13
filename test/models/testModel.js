const footprints = require('../../index');
const { Schema, default: mongoose } = require('mongoose');

function getSchema() {
  return new Schema({
    // https://mongoosejs.com/docs/schematypes.html
    // should cover all types
    stringField: {
      type: String,
    },
    numberField: {
      type: Number,
    },
    dateField: {
      type: Date,
    },
    bufferField: {
      type: Buffer,
    },
    bufferField2: {
      type: Buffer,
    },
    booleanField: {
      type: Boolean,
    },
    objectIdField: {
      type: Schema.Types.ObjectId,
    },
    arrayField: {
      type: [String],
    },
    arrayField2: {
      type: [String],
    },
    fieldToRemove: {
      type: String,
    },
    fieldToRemove2: {
      type: String,
    },
    newFieldToAdd: {
      type: String,
    },
    nestedField: {
      nestedName: {
        type: String,
      },
      nestedObject: {
        nestedNumber: {
          type: Number,
        },
      },
      nestedNumbers: {
        type: [Number],
      },
      nestedObjects: [
        {
          _id: { id: false }, // prevents giving inner id
          doubleNestedNum: Number,
          doubleNestedString: String,
        },
      ],
    },
    subDocumentField: new Schema({
      subDocumentString: {
        type: String,
      },
      subDocumentNumber: {
        type: Number,
      },
    }),
    mapField: {
      type: Map,
      of: String,
    },
    unchangedField: {
      type: String,
    },
  });
}

module.exports.getModel = (modelName, options) => {
  if (!modelName) throw Error('No model name passed');

  const schema = getSchema();
  schema.plugin(footprints.plugin, options);

  return mongoose.model(modelName, schema);
};
