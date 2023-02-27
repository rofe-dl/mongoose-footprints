const isEqual = require('lodash.isequal');
const { isObjectIdOrHexString } = require('mongoose');

function docToObject(doc) {
  return doc?.toObject({ depopulate: true });
}

function isObject(object) {
  return (
    object &&
    typeof object === 'object' &&
    !Array.isArray(object) &&
    !isObjectIdOrHexString(object) &&
    !(object instanceof Date) &&
    object.constructor?.name !== 'Buffer'
  );
}

function getUser(queryOptions, pluginOptions) {
  // if user is required to log but not given, 'Unknown' is default
  // if not required to log, return 'System'
  if (pluginOptions?.logUser) return queryOptions?.user || 'Unknown';
  else return 'System';
}

function findDifferenceInObjects(
  changesArray,
  updatedObject,
  originalObject,
  message = 'Updated '
) {
  if (!updatedObject || !originalObject) return;

  for (let [key, value] of Object.entries(updatedObject)) {
    // updates to Subdocuments changes inner ID so ignore that
    if (key == '_id') continue;

    if (key in originalObject) {
      let originalValue = originalObject[key];

      if (isObject(value) && isObject(originalValue)) {
        findDifferenceInObjects(
          changesArray,
          value,
          originalValue,
          message + `${key}.`
        );
      } else if (!isEqual(value, originalValue)) {
        if (isObject(originalValue) || Array.isArray(originalValue))
          originalValue = JSON.stringify(originalValue);

        if (isObject(value) || Array.isArray(value))
          value = JSON.stringify(value);

        changesArray.push(
          message + `${key} from '${originalValue}' to '${value}'`
        );
      }
    } else {
      //  what to do if key not in old document
      if (isObject(value)) {
        findDifferenceInObjects(changesArray, value, {}, message + `${key}.`);
      } else {
        let messageArray = message.split(' ');
        messageArray[0] = `Added a new field at`;
        const newMessage = messageArray.join(' ');

        if (Array.isArray(value)) value = JSON.stringify(value);

        changesArray.push(newMessage + `${key} with value '${value}'`);
      }
    }
  }
}

module.exports = {
  docToObject,
  isObject,
  getUser,
  findDifferenceInObjects,
};
