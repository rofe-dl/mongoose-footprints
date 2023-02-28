const db = require('./utils/db');
const { getModel } = require('./models/testModel');
const TestModel = getModel('TestModel', {
  operations: ['update', 'create', 'delete'],
});
const footprint = require('../index');
const autocatch = require('./utils/autocatch');
const {
  getSampleDocument,
  getUpdateToApply,
  getUpdatedDocument,
  getUpdateFootprint,
  getCreateFootprint,
  getDeleteFootprint,
} = require('./utils/templates');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Query Options', () => {
  it(
    'should not log anything if footprint is false',
    autocatch(async (done) => {
      // create has to take an array if passing options argument
      let doc = (
        await TestModel.create([getSampleDocument()], {
          footprint: false,
        })
      )[0];
      await TestModel.findByIdAndUpdate(doc._id, getUpdateToApply(), {
        footprint: false,
      });
      doc = await TestModel.findById(doc._id);
      doc.stringField = 'Wah';
      await doc.save({
        footprint: false,
      });
      await TestModel.findByIdAndDelete(doc._id, {
        footprint: false,
      });

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(fp).toBeUndefined();

      done();
    })
  );
});
