const footprints = require('../../index');
const TestModel = require('../models/testModel');
const mongoose = require('mongoose');
const db = require('../utils/db');
const { getSampleDocument, getUpdateToApply } = require('../utils/templates');
require('dotenv').config({ path: 'config.env' });

(async () => {
  // if using mongodb-memory-server
  // await db.connect();

  // if using persistent MongoDB
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGODB_URI);

  const doc = await TestModel.create(getSampleDocument());

  // const doc = new TestModel({ stringField: 'woah' });
  // await doc.save();

  // await TestModel.findOneAndUpdate(
  //   { stringField: 'woa' },
  //   { stringField: 'woah' }
  // );

  const fp = await TestModel.findByIdAndUpdate(doc._id, getUpdateToApply());

  // const doc = await TestModel.findOne({ stringField: 'woa' });
  // doc.stringField = 'woah';
  // await doc.save();

  // await TestModel.findOneAndDelete({ stringField: 'woa' });

  // await TestModel.findByIdAndDelete('63f9019ef8cc5fc56b63605a');

  // await TestModel.findOneAndRemove({ stringField: 'woah' });

  // await TestModel.findByIdAndRemove('63f915d16dd625bd89b6c147');

  let x = await footprints.getFootprints({
    documentId: fp._id,
    typeOfChange: 'Update',
  });

  console.log(x[0].toJSON());

  // await mongoose?.connection?.close();

  // await db?.clear();
  // await db?.close();
})();
