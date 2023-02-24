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

testSchema.plugin(footprints.plugin);

module.exports = mongoose.model('TestModel', testSchema);
