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

describe('Plugin Options', () => {
  it(
    'should not log create, update or delete if operations is empty',
    autocatch(async (done) => {
      const TestModelTemp = getModel('TestModelTemp_operations_empty', {
        operations: [],
      });
      let doc = await TestModelTemp.create(getSampleDocument());
      await TestModelTemp.findByIdAndUpdate(doc._id, getUpdateToApply());
      doc = await TestModelTemp.findById(doc._id);
      doc.stringField = 'Wah';
      await doc.save();
      await TestModelTemp.findByIdAndDelete(doc._id);

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(fp).toBeUndefined();

      done();
    })
  );

  it(
    'should only log delete if options say so',
    autocatch(async (done) => {
      const TestModelTemp = getModel('TestModelTemp_delete_only', {
        operations: ['delete'],
      });
      let doc = await TestModelTemp.create(getSampleDocument());
      await TestModelTemp.findByIdAndUpdate(doc._id, getUpdateToApply());
      doc = await TestModelTemp.findById(doc._id);
      doc.stringField = 'Wah';
      await doc.save();
      await TestModelTemp.findByIdAndDelete(doc._id);

      let fp = await footprint.getFootprints({ documentId: doc._id });

      expect(fp[1]).toBeUndefined();
      expect(fp[0].typeOfChange).toEqual(getDeleteFootprint().typeOfChange);

      done();
    })
  );

  it(
    'should log only updates when no options passed',
    autocatch(async (done) => {
      const TestModelTemp = getModel('TestModelTemp_default_update_only');

      let doc = await TestModelTemp.create(getSampleDocument());
      await TestModelTemp.findByIdAndUpdate(doc._id, getUpdateToApply());
      doc = await TestModelTemp.findById(doc._id);
      doc.stringField = 'Wah';
      await doc.save();
      await TestModelTemp.findByIdAndDelete(doc._id);

      let fp = await footprint.getFootprints({ documentId: doc._id });

      expect(fp[2]).toBeUndefined();
      expect(fp[1].typeOfChange).toEqual(getUpdateFootprint().typeOfChange);
      expect(fp[0].typeOfChange).toEqual(getUpdateFootprint().typeOfChange);

      done();
    })
  );

  it(
    'should only log create if options say so',
    autocatch(async (done) => {
      const TestModelTemp = getModel('TestModelTemp_create_only', {
        operations: ['create'],
      });

      let doc = await TestModelTemp.create(getSampleDocument());
      await TestModelTemp.findByIdAndUpdate(doc._id, getUpdateToApply());
      doc = await TestModelTemp.findById(doc._id);
      doc.stringField = 'Wah';
      await doc.save();
      await TestModelTemp.findByIdAndDelete(doc._id);

      let fp = await footprint.getFootprints({ documentId: doc._id });

      expect(fp[1]).toBeUndefined();
      expect(fp[0].typeOfChange).toEqual(getCreateFootprint().typeOfChange);

      done();
    })
  );
});
