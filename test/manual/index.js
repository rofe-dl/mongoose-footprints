const footprints = require('../../index');
const TestModel = require('../models/testModel').getModel('TestModel', {
  operations: ['create', 'update', 'delete'],
});
const mongoose = require('mongoose');
const db = require('../utils/db');
const { getSampleDocument, getUpdateToApply } = require('../utils/templates');
const prompt = require('prompt-sync')();
require('dotenv').config({ path: 'config.env' });

(async () => {
  const PERSISTENT_DATABASE = 0;

  if (PERSISTENT_DATABASE) {
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGODB_URI);
  } else {
    await db.connect();
  }

  let doc;

  let sample1 = getSampleDocument(),
    sample2 = getSampleDocument();
  sample2.stringField = 'Hey there whats up';

  doc = await TestModel.create([sample1, sample2]);
  await TestModel.updateMany({}, { stringField: 'Updated Hello' });
  // const doc = new TestModel({ stringField: 'woah' });
  // await doc.save();

  // await TestModel.findOneAndUpdate(
  //   { stringField: 'woa' },
  //   { stringField: 'woah' }
  // );

  // const fp = await TestModel.findByIdAndUpdate(doc._id, getUpdateToApply());

  // doc = await TestModel.findById(doc._id);
  // doc.set('mapField.key1', 'value1 updated');
  // await doc.save();

  // const doc = await TestModel.findOne({ stringField: 'woa' });
  // doc.stringField = 'woah';
  // await doc.save();

  // await TestModel.findOneAndDelete({ stringField: 'woa' });

  // await TestModel.findByIdAndDelete('63f9019ef8cc5fc56b63605a');

  // await TestModel.findOneAndRemove({ stringField: 'woah' });

  // await TestModel.findByIdAndRemove('63f915d16dd625bd89b6c147');

  let x = await footprints.getFootprints({
    typeOfChange: 'Update',
  });

  // Clearing the DB or not

  const input = prompt('Enter 1 to clear the DB, or ENTER to skip: ');

  if (input == 1) {
    if (PERSISTENT_DATABASE) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany();
      }
    } else {
      await db?.clear();
    }

    console.log('Cleared database!');
  }

  await mongoose?.connection?.close();
  await db?.close();
})();
