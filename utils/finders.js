const Footprint = require('../models/footprintModel');

module.exports.getFootprints = (filter, projection, options, callback) => {
  return get('All', filter, projection, options, callback);
};

module.exports.getDeletions = (filter, projection, options, callback) => {
  return get('Delete', filter, projection, options, callback);
};

module.exports.getCreations = (filter, projection, options, callback) => {
  return get('Create', filter, projection, options, callback);
};
module.exports.getUpdates = (filter, projection, options, callback) => {
  return get('Update', filter, projection, options, callback);
};

function get(
  typeOfChange,
  filter = {},
  projection = {},
  options = {},
  callback
) {
  if (typeof filter === 'function') {
    callback = filter;
    filter = {};
    projection = {};
    options = {};
  } else if (typeof projection === 'function') {
    callback = projection;
    projection = {};
    options = {};
  } else if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeOfChange !== 'All') filter['typeOfChange'] = typeOfChange;
  if (!options?.sort) options['sort'] = '-version';

  return Footprint.find(filter, projection, options)
    .then((footprint) => {
      if (typeof callback === 'function') return callback(null, footprint);

      return footprint;
    })
    .catch((err) => {
      if (typeof callback === 'function') return callback(err, null);

      throw err;
    });
}
