# Mongoose Footprints

A mongoose plugin to log changes in MongoDB documents. It was inspired by [@mimani/mongoose-diff-history](https://github.com/mimani/mongoose-diff-history) with several changes on top.

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

```js
const footprints = require('mongoose-footprints');
mySchema.plugin(footprints.plugin, options);
```

### Plugin Options

- `logUser`: `true` / `false` - To log the user who updated the document. If set to `false`, the default user
  logged is `System`. If set to `true`, the user has to be passed in the options of the operation. Otherwise, it will be recorded as `Unknown`. Default is `false`.
- `operations` : `['update', 'create', 'delete']` - The operations that will be logged. Default is `['update']`.
- `storeDocuments`: `true/false` - Store the entire old document and updated document inside the Footprint document along with the list of changes. Default is `true`.

### Possible options for mongoose operations

```js
const user = req.user;
const options = {
  footprint: true, // to use the plugin for an operation
  user: user, // user can be any data type
  session: session, // supports sessions so updates in aborted transactions won't be logged
};

await Book.findOneAndUpdate(filter, updates, options);

const bookObject = {
  name: 'Angels & Demons',
  author: 'Dan Brown',
};

// to use create with options, the document has to be passed in an array
// for info, check out https://mongoosejs.com/docs/api/model.html#model_Model-create
await savedBook = Book.create([bookObject], options);

savedBook.name = 'The Da Vinci Code'
await savedBook.save(options);

await Book.findOneAndDelete(filter, options);
```

## Footprint Model

```js
{
  modelName: String,
  documentId: mongoose.Schema.Types.ObjectId,
  oldDocument: {},
  updatedDocument: {},
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
