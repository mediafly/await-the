/**
 * @file Map values of an object
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const _ = require('lodash');

/**
 * Map Values
 *
 * @module mapValues
 * @example
 * const result = await the.mapValues({key1: 'value1'}, async (value, key) => {
 *     return somePromise(value);
 * });
 * // result is now an object with {key1: <resolved promise> }
 *
 * @param {Object} obj - key value pair to be iterated over
 * @param {Promise} promise - promise to be await for each key, called with (value, key)
 */
module.exports = async (obj, promise) => {
    if (!obj) {
        return obj;
    }

    const promises = _.map(obj, (value, key) => {
        return promise(value, key).then(result => {
            return { [key]: result };
        });
    });

    const resolvedPromises = await Promise.all(promises);

    return _.reduce(
        resolvedPromises,
        (accumulator, resolvedPromise) => {
            const key = _.first(_.keys(resolvedPromise));
            const value = _.first(_.values(resolvedPromise));
            _.set(accumulator, [key], value);

            return accumulator;
        },
        {}
    );
};
