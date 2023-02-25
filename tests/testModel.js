const footprints = require('../index');
const { Schema, default: mongoose } = require('mongoose');

const testSchema = new Schema({
  // https://mongoosejs.com/docs/schematypes.html
  // should cover all types
  stringField: {
    type: String,
    default: 'hello world',
  },
  numberField: {
    type: Number,
    default: 10,
  },
  dateField: {
    type: Date,
    default: Date.now(),
  },
  bufferField: {
    type: Buffer,
    default: [116, 101, 115, 116],
  },
  booleanField: {
    type: Boolean,
    default: true,
  },
  objectIdField: {
    type: Schema.Types.ObjectId,
    default: new mongoose.Types.ObjectId('63f922f77800ea7bc335fe4a'),
  },
  arrayField: {
    type: [String],
    default: ['hello', 'world'],
  },
  nestedField: {
    nestedName: {
      type: String,
      default: 'hey world',
    },
    nestedObject: {
      nestedNumber: {
        type: Number,
        default: 10,
      },
    },
    nestedObjects: [
      {
        type: Number,
      },
    ],
  },
  subDocumentField: new Schema({
    subDocumentString: {
      type: String,
      default: "I'm in a subdocument",
    },
    subDocumentNumber: {
      type: Number,
      default: 10,
    },
  }),
});

testSchema.plugin(footprints.plugin, {
  operations: ['update', 'create', 'delete'],
});

module.exports = mongoose.model('TestModel', testSchema);
