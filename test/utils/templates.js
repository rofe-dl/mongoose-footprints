/**
 * Template objects for use by unit tests to create and update
 * documents of the TestModel.
 */
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
    fieldToRemove: 'Goodbye!',
    fieldToRemove2: 'Bye Bye!',
    unchangedField: 'Wont be edited',
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
    mapField: {
      key1: 'value1',
      key2: 'value2',
      keyToRemove: 'Bye have a great time!',
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
    newFieldToAdd: "Hey I'm new here",
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
    mapField: {
      key1: 'value1 updated',
      key2: 'value2 updated',
    },
    $unset: { fieldToRemove: '', fieldToRemove2: '' },
  };
};

module.exports.getUpdatedDocument = () => {
  return {
    _id: expect.anything(),
    __v: expect.anything(),
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
    unchangedField: 'Wont be edited',
    newFieldToAdd: "Hey I'm new here",
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
      _id: expect.anything(),
      subDocumentString: 'What am I doing here',
      subDocumentNumber: 1001,
    },
    mapField: {
      key1: 'value1 updated',
      key2: 'value2 updated',
    },
  };
};

module.exports.getCreateFootprint = (modelName = 'TestModel') => {
  return {
    _id: expect.anything(),
    modelName: modelName,
    documentId: expect.anything(),
    oldDocument: null,
    newDocument: {
      nestedField: {
        nestedObject: {
          nestedNumber: 100,
        },
        nestedName: 'What',
        nestedNumbers: [20, 30, 40],
        nestedObjects: [
          {
            doubleNestedNum: 50,
            doubleNestedString: 'How are you',
          },
        ],
      },
      _id: expect.anything(),
      stringField: 'Hello',
      numberField: 10,
      dateField: exports.DEFAULT_DATE,
      bufferField: expect.anything(),
      bufferField2: expect.anything(),
      booleanField: true,
      objectIdField: new mongoose.Types.ObjectId('63f922f77800ea7bc335fe4a'),
      arrayField: ['hello', 'world'],
      arrayField2: ['hello', 'what', 'is', 'up'],
      fieldToRemove: 'Goodbye!',
      fieldToRemove2: 'Bye Bye!',
      unchangedField: 'Wont be edited',
      subDocumentField: {
        subDocumentString: "I'm in a subdocument",
        subDocumentNumber: 1000,
        _id: expect.anything(),
      },
      mapField: {
        key1: 'value1',
        key2: 'value2',
        keyToRemove: 'Bye have a great time!',
      },
      __v: expect.anything(),
    },
    user: 'System',
    changes: [],
    typeOfChange: 'Create',
    createdAt: expect.anything(),
  };
};

module.exports.getUpdateFootprint = (modelName = 'TestModel') => {
  return {
    _id: expect.anything(),
    modelName,
    documentId: expect.anything(),
    oldDocument: {
      nestedField: {
        nestedObject: {
          nestedNumber: 100,
        },
        nestedName: 'What',
        nestedNumbers: [20, 30, 40],
        nestedObjects: [
          {
            doubleNestedNum: 50,
            doubleNestedString: 'How are you',
          },
        ],
      },
      _id: expect.anything(),
      stringField: 'Hello',
      numberField: 10,
      dateField: exports.DEFAULT_DATE,
      bufferField: expect.anything(),
      bufferField2: expect.anything(),
      booleanField: true,
      objectIdField: new mongoose.Types.ObjectId('63f922f77800ea7bc335fe4a'),
      arrayField: ['hello', 'world'],
      arrayField2: ['hello', 'what', 'is', 'up'],
      fieldToRemove: 'Goodbye!',
      fieldToRemove2: 'Bye Bye!',
      unchangedField: 'Wont be edited',
      subDocumentField: {
        subDocumentString: "I'm in a subdocument",
        subDocumentNumber: 1000,
        _id: expect.anything(),
      },
      mapField: {
        key1: 'value1',
        key2: 'value2',
        keyToRemove: 'Bye have a great time!',
      },
      __v: expect.anything(),
    },
    newDocument: {
      nestedField: {
        nestedObject: {
          nestedNumber: 101,
        },
        nestedName: 'Why',
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
      _id: expect.anything(),
      stringField: 'Updated Hello',
      numberField: 11,
      dateField: exports.UPDATED_DATE,
      bufferField: expect.anything(),
      bufferField2: expect.anything(),
      booleanField: false,
      objectIdField: new mongoose.Types.ObjectId('63f922f77800ea7bc335fe4b'),
      arrayField: ['hello', 'world', 'extra', 'word'],
      arrayField2: ['hello', 'what', 'is', 'up', 'you'],
      unchangedField: 'Wont be edited',
      subDocumentField: {
        subDocumentString: 'What am I doing here',
        subDocumentNumber: 1001,
        _id: expect.anything(),
      },
      mapField: { key1: 'value1 updated', key2: 'value2 updated' },
      __v: expect.anything(),
      newFieldToAdd: "Hey I'm new here",
    },
    user: 'System',
    changes: [
      "Updated nestedField.nestedObject.nestedNumber from '100' to '101'",
      "Updated nestedField.nestedName from 'What' to 'Why'",
      "Updated nestedField.nestedNumbers from '[20,30,40]' to '[21,31,41]'",
      `Updated nestedField.nestedObjects from '[{"doubleNestedNum":50,"doubleNestedString":"How are you"}]' to '[{"doubleNestedNum":60,"doubleNestedString":"How are you"},{"doubleNestedNum":50,"doubleNestedString":"Why are you"}]'`,
      "Updated stringField from 'Hello' to 'Updated Hello'",
      "Updated numberField from '10' to '11'",
      "Updated dateField from '" +
        exports.DEFAULT_DATE.toString() +
        "' to '" +
        exports.UPDATED_DATE.toString() +
        "'",
      "Updated bufferField.buffer from 'test' to 'te'",
      "Updated bufferField.position from '4' to '2'",
      "Updated bufferField2.buffer from 'buffer string' to 'buffer string updated'",
      "Updated bufferField2.position from '13' to '21'",
      "Updated booleanField from 'true' to 'false'",
      "Updated objectIdField from '63f922f77800ea7bc335fe4a' to '63f922f77800ea7bc335fe4b'",
      `Updated arrayField from '["hello","world"]' to '["hello","world","extra","word"]'`,
      `Updated arrayField2 from '["hello","what","is","up"]' to '["hello","what","is","up","you"]'`,
      "Updated subDocumentField.subDocumentString from 'I'm in a subdocument' to 'What am I doing here'",
      "Updated subDocumentField.subDocumentNumber from '1000' to '1001'",
      "Updated mapField.key1 from 'value1' to 'value1 updated'",
      "Updated mapField.key2 from 'value2' to 'value2 updated'",
      'Removed the field mapField.keyToRemove',
      "Added a new field at newFieldToAdd with value 'Hey I'm new here'",
      'Removed the field fieldToRemove',
      'Removed the field fieldToRemove2',
    ],
    typeOfChange: 'Update',
    createdAt: expect.anything(),
  };
};

module.exports.getDeleteFootprint = (modelName = 'TestModel') => {
  return {
    _id: expect.anything(),
    modelName,
    documentId: expect.anything(),
    oldDocument: {
      nestedField: {
        nestedObject: {
          nestedNumber: 100,
        },
        nestedName: 'What',
        nestedNumbers: [20, 30, 40],
        nestedObjects: [
          {
            doubleNestedNum: 50,
            doubleNestedString: 'How are you',
          },
        ],
      },
      _id: expect.anything(),
      stringField: 'Hello',
      numberField: 10,
      dateField: exports.DEFAULT_DATE,
      bufferField: expect.anything(),
      bufferField2: expect.anything(),
      booleanField: true,
      objectIdField: new mongoose.Types.ObjectId('63f922f77800ea7bc335fe4a'),
      arrayField: ['hello', 'world'],
      arrayField2: ['hello', 'what', 'is', 'up'],
      fieldToRemove: 'Goodbye!',
      fieldToRemove2: 'Bye Bye!',
      unchangedField: 'Wont be edited',
      subDocumentField: {
        subDocumentString: "I'm in a subdocument",
        subDocumentNumber: 1000,
        _id: expect.anything(),
      },
      mapField: {
        key1: 'value1',
        key2: 'value2',
        keyToRemove: 'Bye have a great time!',
      },
      __v: expect.anything(),
    },
    newDocument: null,
    user: 'System',
    changes: [],
    typeOfChange: 'Delete',
    createdAt: expect.anything(),
  };
};
