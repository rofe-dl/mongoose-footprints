# Mongoose Footprints

A mongoose plugin to log changes to MongoDB documents. It was inspired by [@mimani/mongoose-diff-history](https://github.com/mimani/mongoose-diff-history) with several changes.

Currently it supports the following operations:

- Update
  - `findOneAndUpdate`
  - `update`
  - `updateOne` (for Model.updateOne(), not for document.updateOne())
  - `save`
- Create
  - `create`
  - `save`
- Delete
  - `findOneAndDelete`
  - `deleteOne` (for Model.deleteOne(), not for document.deleteOne())

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
MyModel.findOneAndUpdate(filter, updates, {
  footprint: true, // to use the plugin for an operation
  user: username,
  session: session, // supports sessions so updates in aborted transactions won't be logged
});
```
