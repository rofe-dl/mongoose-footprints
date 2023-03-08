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

  it(
    'should log the user correctly',
    autocatch(async (done) => {
      const TestModelTemp = getModel('TestModelTemp_user_test', {
        operations: ['create', 'update', 'delete'],
        logUser: true,
      });
      let doc = (
        await TestModelTemp.create([getSampleDocument()], {
          user: {
            name: 'John',
            email: 'john@mail.com',
          },
        })
      )[0];
      await TestModelTemp.findByIdAndUpdate(doc._id, getUpdateToApply(), {
        user: 'Harry',
      });
      doc = await TestModelTemp.findById(doc._id);
      doc.stringField = 'Wah';
      await doc.save();
      await TestModelTemp.findByIdAndUpdate(doc._id, getUpdateToApply());
      await TestModelTemp.findByIdAndDelete(doc._id);

      let fp = await footprint.getFootprints({ documentId: doc._id });

      expect(fp[0].user).toEqual('Unknown');
      expect(fp[1].user).toEqual('Unknown');
      expect(fp[2].user).toEqual('Unknown');
      expect(fp[3].user).toEqual('Harry');
      expect(fp[4].user).toEqual({
        name: 'John',
        email: 'john@mail.com',
      });

      done();
    })
  );
});
