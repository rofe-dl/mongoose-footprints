# Mongoose Footprints

A mongoose plugin to log changes in MongoDB documents. If used on Mongoose models, any changes made to that model will be logged as a document of the `Footprint` model. It will include contain an array that shows every change made to the document, along with the old and new document bodies.

Changes in referenced documents will not be logged, however changes in nested documents or subdocuments will be logged.

Currently it supports the following operations:

- Update
  - `findOneAndUpdate`
  - `findByIdAndUpdate`
  - `document.save`
- Create
  - `create`
  - `document.save`
- Delete
  - `findOneAndDelete`
  - `findByIdAndDelete`
  - `findOneAndRemove`
  - `findByIdAndRemove`

Note: The update operations will set `new: true` as the default so the returned object will always be the updated object.

## Get Started

Install the package

```bash
npm i mongoose-footprints
```

Then, just use the plugin on the schema before you make a model from it.

`Book.js`

```js
const footprints = require('mongoose-footprints');
const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  name: String,
  author: String,
});

const options = {
  operations: ['update', 'delete'],
  logUser: false,
};

bookSchema.plugin(footprints.plugin, options);

const Book = mongoose.model('Book', bookSchema);
```

Possible plugin options you can pass are given below. It is passed as an object.

### Plugin Options

- `logUser`: `true` / `false` - To log the user who updated the document. If set to `false`, the default user
  logged is `System`. If set to `true`, the user has to be passed in the options of the query. Otherwise, it will be recorded as `Unknown`. Default is `false`.
- `operations` : `['update', 'create', 'delete']` - The operations that will be logged. Default is `['update']`.
- `storeDocuments`: `true/false` - Store the entire old document and updated document inside the footprint along with the list of changes. Set it to `false` if it causes you to exceed the maximum document size of MongoDB. Default is `true`.

You can pass in extra options during mongoose queries that are specific to that operation.

### Query Options

- `footprint`: `true` / `false` - Set it to false to not create a footprint of this query. Default is `true`.
- `user`: `mongoose.Schema.Types.Mixed` - Can be any data type. This will log the user who made this change. Default is `System` if `logUser` is set to `false`, otherwise it is simply `Unknown`.

### Example Usage

```js
await Book.findOneAndUpdate(filter, updates, {
  user: req.user,
  session: session, // supports sessions so updates in aborted transactions won't be logged
});
```

```js
const bookObject = {
  name: 'Angels & Demons',
  author: 'Dan Brown',
};

// to use create with options, the document has to be passed in an array
// for info, check out https://mongoosejs.com/docs/api/model.html#model_Model-create
await savedBook = Book.create([bookObject], {
  footprint: false // setting to false will not log this creation
});

savedBook.name = 'The Da Vinci Code'
await savedBook.save({
  footprint: true // already true by default though
});
```

```js
await Book.findOneAndDelete(filter, {
  user: req.user,
  session: session,
});
```

## Footprint Model

```js
{
  modelName: String,
  documentId: mongoose.Schema.Types.ObjectId,
  oldDocument: {},
  newDocument: {},
  user: mongoose.Schema.Types.Mixed,
  changes: [String],
  typeOfChange: {
    type: String,
    enum: ['Create', 'Update', 'Delete'],
    default: 'Update',
  },
  version: Number,
}
```
