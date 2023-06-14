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
    'successfully logs save() when updating documents',
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
      doc.fieldToRemove2 = undefined;

      // to match the sequence of the object received
      const temp = updateFootprint.changes[0];
      updateFootprint.changes[0] = updateFootprint.changes[1];
      updateFootprint.changes[1] = temp;

      await doc.save();

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(fp)).toEqual(updateFootprint);

      done();
    })
  );

  it(
    'successfully logs create()',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(fp)).toEqual(getCreateFootprint());

      done();
    })
  );

  it(
    'successfully logs save() when creating documents',
    autocatch(async (done) => {
      let doc = new TestModel(getSampleDocument());
      await doc.save();

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(fp)).toEqual(getCreateFootprint());

      done();
    })
  );

  it(
    'successfully logs findOneAndDelete()',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());
      await TestModel.findOneAndDelete({ _id: doc._id });

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(fp)).toEqual(getDeleteFootprint());

      done();
    })
  );

  it(
    'successfully logs findByIdAndDelete()',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());
      await TestModel.findByIdAndDelete(doc._id);

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(fp)).toEqual(getDeleteFootprint());

      done();
    })
  );

  it(
    'successfully logs findOneAndRemove()',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());
      await TestModel.findOneAndRemove({ _id: doc._id });

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(fp)).toEqual(getDeleteFootprint());

      done();
    })
  );

  it(
    'successfully logs findByIdAndRemove()',
    autocatch(async (done) => {
      let doc = await TestModel.create(getSampleDocument());
      await TestModel.findByIdAndRemove(doc._id);

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(fp)).toEqual(getDeleteFootprint());

      done();
    })
  );
});

describe('Possible edge cases', () => {
  it(
    'successfully logs adding a new subdocument field',
    autocatch(async (done) => {
      const sampleDocument = getSampleDocument();
      delete sampleDocument.subDocumentField;

      let doc = await TestModel.create(sampleDocument);
      let updatedDoc = await TestModel.findOneAndUpdate(
        { _id: doc._id },
        getUpdateToApply(),
        { new: true }
      );

      let fp = (await footprint.getFootprints({ documentId: doc._id }))[0];

      expect(toJson(fp).changes).toContain(
        "Added a new field at subDocumentField.subDocumentString with value 'What am I doing here'"
      );
      expect(toJson(fp).changes).toContain(
        "Added a new field at subDocumentField.subDocumentNumber with value '1001'"
      );

      done();
    })
  );
});

function toJson(doc) {
  return doc?.toJSON({ flattenMaps: true });
}
