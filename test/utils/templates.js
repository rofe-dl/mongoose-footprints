const mongoose = require('mongoose');

module.exports.DEFAULT_DATE = new Date(Date.now());
// updated date is the date of the day after
module.exports.UPDATED_DATE = new Date(Date.now() + 86400 * 1000);

module.exports.getSampleDocument = () => {
  return {
    stringField: 'Hello',
    numberField: 10,
    dateField: exports.DEFAULT_DATE,
    bufferField: [116, 101, 115, 116],
    bufferField2: 'buffer string',
    booleanField: true,
    objectIdField: new mongoose.Types.ObjectId('63f922f77800ea7bc335fe4a'),
    arrayField: ['hello', 'world'],
    arrayField2: ['hello', 'what', 'is', 'up'],
    nestedField: {
      nestedName: 'What',
      nestedObject: {
        nestedNumber: 100,
      },
      nestedNumbers: [20, 30, 40],
      nestedObjects: [
        {
          doubleNestedNum: 50,
          doubleNestedString: 'How are you',
        },
      ],
    },
    subDocumentField: {
      subDocumentString: "I'm in a subdocument",
      subDocumentNumber: 1000,
    },
  };
};

module.exports.getUpdateToApply = () => {
  return {
    stringField: 'Updated Hello',
    numberField: 11,
    dateField: exports.UPDATED_DATE,
    bufferField: [116, 101],
    bufferField2: 'buffer string updated',
    booleanField: false,
    objectIdField: new mongoose.Types.ObjectId('63f922f77800ea7bc335fe4b'),
    arrayField: ['hello', 'world', 'extra', 'word'],
    nestedField: {
      nestedName: 'Why',
      nestedObject: {
        nestedNumber: 101,
      },
      nestedNumbers: [21, 31, 41],
      nestedObjects: [
        {
          doubleNestedNum: 60,
          doubleNestedString: 'How are you',
        },
        {
          doubleNestedNum: 50,
          doubleNestedString: 'Why are you',
        },
      ],
    },
    subDocumentField: {
      subDocumentString: 'What am I doing here',
      subDocumentNumber: 1001,
    },
    $push: {
      arrayField2: 'you',
    },
  };
};

module.exports.getUpdatedDocument = () => {
  return {
    _id: expect.anything(),
    stringField: 'Updated Hello',
    numberField: 11,
    dateField: exports.UPDATED_DATE,
    bufferField: {
      data: [116, 101],
      type: 'Buffer',
    },
    bufferField2: {
      data: [
        98, 117, 102, 102, 101, 114, 32, 115, 116, 114, 105, 110, 103, 32, 117,
        112, 100, 97, 116, 101, 100,
      ],
      type: 'Buffer',
    },
    booleanField: false,
    objectIdField: new mongoose.Types.ObjectId('63f922f77800ea7bc335fe4b'),
    arrayField: ['hello', 'world', 'extra', 'word'],
    arrayField2: ['hello', 'what', 'is', 'up', 'you'],
    nestedField: {
      nestedName: 'Why',
      nestedObject: {
        nestedNumber: 101,
      },
      nestedNumbers: [21, 31, 41],
      nestedObjects: [
        {
          doubleNestedNum: 60,
          doubleNestedString: 'How are you',
        },
        {
          doubleNestedNum: 50,
          doubleNestedString: 'Why are you',
        },
      ],
    },
    subDocumentField: {
      subDocumentString: 'What am I doing here',
      subDocumentNumber: 1001,
    },
  };
};

module.exports.getCreateFootprint = () => {};

module.exports.getUpdateFootprint = () => {};

module.exports.getDeleteFootprint = () => {};
