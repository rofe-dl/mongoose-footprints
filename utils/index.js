const isEqual = require('lodash.isequal');
const { isObjectIdOrHexString } = require('mongoose');

function docToObject(doc) {
  return doc?.toObject({ depopulate: true, flattenMaps: true });
}

function isObject(object) {
  return (
    object &&
    typeof object === 'object' &&
    !Array.isArray(object) && // isn't an Array
    !isObjectIdOrHexString(object) && // isn't a MongoDB Object ID
    !(object instanceof Date) && // isn't a Date object
    object.constructor?.name !== 'Buffer' // isn't a MongoDB Buffer field
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
  const keysUnion = unionOfKeys(updatedObject, originalObject);

  for (let key of keysUnion) {
    // updates to Subdocuments changes inner MongoDB ID so ignore that
    if (key == '_id' || key == '__v') continue;

    let value = updatedObject[key];

    if (value == null) {
      // if no value exists for the new object, it was removed
      const newMessage = replaceFirstWord(message, `Removed the field`);
      changesArray.push(newMessage + `${key}`);
    } else if (key in originalObject) {
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
      //  if key not in old object, it was added
      if (isObject(value)) {
        findDifferenceInObjects(changesArray, value, {}, message + `${key}.`);
      } else {
        const newMessage = replaceFirstWord(message, `Added a new field at`);
        if (Array.isArray(value)) value = JSON.stringify(value);

        changesArray.push(newMessage + `${key} with value '${value}'`);
      }
    }
  }
}

function replaceFirstWord(message, replacement) {
  let messageArray = message.split(' ');
  messageArray[0] = replacement;
  const newMessage = messageArray.join(' ');

  return newMessage;
}

/**
 * @param {Object} objectOne
 * @param {Object} objectTwo
 * @returns Array containing keys from both objects without duplicates
 */
function unionOfKeys(objectOne, objectTwo) {
  let set = new Set();
  const arr = Object.keys(objectOne).concat(Object.keys(objectTwo));

  for (let key of arr) {
    set.add(key);
  }

  return Array.from(set);
}

module.exports = {
  docToObject,
  isObject,
  getUser,
  findDifferenceInObjects,
};
