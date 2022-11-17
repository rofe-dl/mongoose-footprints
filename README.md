# Mongoose Footprints

A mongoose plugin to log changes in MongoDB documents. It was inspired by [@mimani/mongoose-diff-history](https://github.com/mimani/mongoose-diff-history) with several changes on top.

Currently it supports the following operations:

- Update
  - `Model.findOneAndUpdate`
  - `Model.update`
  - `Model.updateOne`
  - `document.save`
- Create
  - `Model.create`
  - `document.save`
- Delete
  - `Model.findOneAndDelete`
  - `Model.deleteOne`

Please note that `updateOne` and `deleteOne` methods are not supported when called by documents. They will only get logged when called using the Model.

## Get Started

```js
const footprints = require('mongoose-footprints');
mySchema.plugin(footprints.plugin, options);
```

### Plugin Options

- `logUser`: `true` / `false` to log the user who updated the document. If set to `false`, the default user
  logged is `System`. If set to `true`, the user has to be passed in the options of the operation. Otherwise, it will be recorded as `Unknown`. Default is `false`.
- `operations` : `['update', 'create', 'delete']` The operations that will be logged. Default is `['update']`.

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
  name: 'Harry Potter and the Prisoner of Azkaban',
  author: 'JK Rowling',
};

// to use create with options, the document has to be passed in an array
// for info, check out https://mongoosejs.com/docs/api/model.html#model_Model-create
await savedBook = Book.create([bookObject], options);

savedBook.name = 'Harry Potter and the Deathly Hallows'
await savedBook.save(options);
```
