const db = require('./utils/db');
const TestModel = require('./models/testModel');
const footprint = require('../index');
const autocatch = require('./utils/autocatch');
const {
  getSampleDocument,
  getUpdateToApply,
  getUpdatedDocument,
  getUpdateFootprint,
} = require('./utils/templates');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Logging Changes For All Supported Operations', () => {
  it(
    'successfully logs findOneAndUpdate()',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());
      let updatedDoc = await TestModel.findOneAndUpdate(
        { _id: doc._id },
        getUpdateToApply(),
        { new: true }
      );

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(updatedDoc)).toEqual(getUpdatedDocument());
      expect(toJson(fp)).toEqual(getUpdateFootprint());

      done();
    })
  );

  it(
    'successfully logs findByIdAndUpdate()',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());
      let updatedDoc = await TestModel.findByIdAndUpdate(
        doc._id,
        getUpdateToApply(),
        { new: true }
      );

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(updatedDoc)).toEqual(getUpdatedDocument());
      expect(toJson(fp)).toEqual(getUpdateFootprint());

      done();
    })
  );

  it(
    'successfully logs save() on update',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());
      doc = await TestModel.findById(doc._id);

      const updateBody = getUpdateToApply();
      const updateFootprint = getUpdateFootprint();

      for (let key in updateBody) {
        if (key.startsWith('$')) continue;

        doc[key] = updateBody[key];
      }

      // updates using $ operator needs to be set manually
      doc.arrayField2 = ['hello', 'what', 'is', 'up', 'you'];
      doc.fieldToRemove = undefined;

      // to match the sequence of the object received
      const temp = updateFootprint.changes[0];
      updateFootprint.changes[0] = updateFootprint.changes[1];
      updateFootprint.changes[1] = temp;

      await doc.save();

      let fp = (await footprint.getFootprints())[0];

      expect(toJson(fp)).toEqual(updateFootprint);

      done();
    })
  );
});

function toJson(doc) {
  return doc?.toJSON({ flattenMaps: true });
}
