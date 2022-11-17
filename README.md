# Mongoose Footprints

A mongoose plugin to log changes to MongoDB documents. It was inspired by [@mimani/mongoose-diff-history](https://github.com/mimani/mongoose-diff-history) with several changes.

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

Please note, for `updateOne` and `deleteOne` methods for `document` are not supported.

## Get Started

```js
const footprints = require('mongoose-footprints');
mySchema.plugin(footprints.plugin, options);
```

### Plugin `options`

- `logUser`: `true` / `false ` to allow passing user who updated the document. Default is `false`.
- `operations` : `['update', 'create', 'delete']` operations to log. Default is `['update']`

### Possible options for mongoose operations

```js
const username = req.user.username; // Strings only
const options = {
  footprint: true, // to use the plugin for an operation
  user: username,
  session: session, // supports sessions so updates in aborted transactions won't be logged
};

Book.findOneAndUpdate(filter, updates, options);

const bookObject = {
  name: 'Harry Potter and the Prisoner of Azkaban',
  author: 'JK Rowling',
};

// to use create with options, the document has to be passed in an array
// for info, check out https://mongoosejs.com/docs/api/model.html#model_Model-create
await savedBook = Book.create([bookObject], options);

savedBook.name = 'Harry Potter and the Deathly Hallows'
savedBook.save(options);
```
