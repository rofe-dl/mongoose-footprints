const footprints = require('../../index');
const TestModel = require('../testModel');
const mongoose = require('mongoose');
const db = require('../db');
require('dotenv').config({ path: 'config.env' });

(async () => {
  // if using mongodb-memory-server
  // await db.connect();

  // if using persistent MongoDB
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGODB_URI);

  // const doc = await TestModel.create({ stringField: 'woah' });

  // const doc = new TestModel({ stringField: 'woah' });
  // await doc.save();

  // await TestModel.findOneAndUpdate(
  //   { stringField: 'woa' },
  //   { stringField: 'woah' }
  // );

  // await TestModel.findByIdAndUpdate(doc._id, {
  //   subDocumentField: {
  //     subDocumentNumber: 14,
  //   },
  //   nestedField: {
  //     nestedObjects: [12, 13, 20],
  //     nestedObject: {
  //       nestedNumber: 100,
  //     },
  //   },
  //   objectIdField: '63f922f77800ea7bc335fe4b',
  // });

  // const doc = await TestModel.findOne({ stringField: 'woa' });
  // doc.stringField = 'woah';
  // await doc.save();

  // await TestModel.findOneAndDelete({ stringField: 'woa' });

  await TestModel.findByIdAndDelete('63f9019ef8cc5fc56b63605a');

  // await TestModel.findOneAndRemove({ stringField: 'woah' });

  // await TestModel.findByIdAndRemove('63f915d16dd625bd89b6c147');

  // let wa = await footprints.getFootprints();

  await mongoose?.connection?.close();
  await db?.close();
})();
