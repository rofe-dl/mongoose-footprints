const db = require('./utils/db');
const TestModel = require('./models/testModel');
const footprint = require('../index');
const autocatch = require('./utils/autocatch');
const {
  getSampleDocument,
  getUpdateToApply,
  getUpdatedDocument,
} = require('./utils/templates');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Logging Basic Changes For All Operations', () => {
  it(
    'successfully logs findOneAndUpdate',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());
      doc = await TestModel.findOneAndUpdate(
        { _id: doc._id },
        getUpdateToApply()
      );

      expect(doc.toJSON()).toMatchObject(getUpdatedDocument());
      doc = await footprint.getFootprints({ documentId: doc._id });

      // expect(doc.toJSON()).toMatchObject({});

      done();
    })
  );
});
