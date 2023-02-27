const footprints = require('../../index');
const { Schema, default: mongoose } = require('mongoose');

const testSchema = new Schema({
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
});

testSchema.plugin(footprints.plugin, {
  operations: ['update', 'create', 'delete'],
});

module.exports = mongoose.model('TestModel', testSchema);
