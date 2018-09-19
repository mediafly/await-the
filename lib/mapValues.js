/**
 * @file Map values of an object.
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const _ = require('lodash');
const map = require('p-map');

/**
 * Given an object of key-value pairs, run the given asynchronous task in parallel for each pair.
 *
 * @module mapValues
 * @example
 * const result = await the.mapValues({key1: 'value1'}, async (value, key) => {
 *     return somePromise(value);
 * });
 * // result is now an object with {key1: <resolved promise> }
 *
 * @param {Object} obj Key-value pair to be iterated over.
 * @param {Promise} promise Promise to be await for each key, called with (value, key).
 * @param {Object} options Optional overrides.
 * @param {Number} options.concurrency=Infinity Number of concurrently pending promises returned by mapper.
 * @returns {Object}
 */
module.exports = async (obj, promise, options = {}) => {
    if (!obj) {
        return obj;
    }

    const promises = _.map(obj, (value, key) => {
        return promise(value, key).then(result => {
            return { [key]: result };
        });
    });

    const resolvedPromises = await map(promises, el => el, options);

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
