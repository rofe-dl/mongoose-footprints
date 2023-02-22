const isEqual = require('lodash.isequal');

function docToObject(doc) {
  return doc?.toObject({ depopulate: true });
}

function isObject(object) {
  return object && !Array.isArray(object) && typeof object === 'object';
}

function getUser(queryObjectOptions, options) {
  // if user is required to log but not given, 'Unknown' is default
  // if not required to log, return 'System'
  if (options?.logUser) return queryObjectOptions?.user || 'Unknown';
  else return 'System';
}

function recursiveLogObjectChanges(
  changesArray,
  updatedObject,
  originalObject,
  message = 'Updated '
) {
  for (let [key, value] of Object.entries(updatedObject)) {
    if (key in originalObject) {
      const originalValue = originalObject[key];

      if (isObject(value)) {
        recursiveLogObjectChanges(
          changesArray,
          value,
          originalValue,
          message + `${key}.`
        );
      } else if (!isEqual(value, originalValue)) {
        changesArray.push(
          message + `${key} from '${originalValue}' to '${value}'`
        );
      }
    } else {
      //  what to do if key not in old document
      let messageArray = message.split(' ');
      messageArray[0] = `Added a new field `;
      message = messageArray.join(' ');

      changesArray.push(message + `${key} with value ${value}`);
    }
  }
}

module.exports = {
  docToObject,
  isObject,
  getUser,
  recursiveLogObjectChanges,
};
