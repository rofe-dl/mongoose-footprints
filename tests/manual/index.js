const footprints = require('../../index');
const TestModel = require('../testModel');
const db = require('../db');

(async () => {
  await db.connect();

  const doc = await TestModel.create({ stringField: 'woah' });
  console.log(doc);

  await db.close();
})();

// TestModel.create((err, doc) => {
//   console.log(doc);
// });
