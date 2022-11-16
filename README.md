# Mongoose Footprints

A mongoose plugin to log changes to MongoDB documents.

### Possible options for plugin

```js
const footprints = require('mongoose-footprints');
mySchema.plugin(footprints.plugin, { logUser: true });
```

### Possible options for mongoose operations

```js
const username = req.user.username; // Strings only
MyModel.findOneAndUpdate(filter, updates, {
  footprint: true, // to use the plugin for an operation
  user: username,
  session: session, // supports sessions so updates in aborted transactions won't be logged
});
```
