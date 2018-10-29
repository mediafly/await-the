/**
 * @file Map values of an object.
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const _ = require('lodash');
const Limiter = require('./Limiter');

/**
 * Given an object of key-value pairs, run the given asynchronous task in parallel for each pair.
 *
 * @module mapValues
 * @example
 * const the = require('await-the');
 * const result = await the.mapValues({key1: 'value1'}, async (value, key) => {
 *     return somePromise(value);
 * });
 * // result is now an object with {key1: <resolved promise> }
 *
 * @param {Object} collection Key-value pair to be iterated over.
 * @param {Promise} task Promise to be await for each key, called with (value, key).
 * @param {Object} options Optional overrides.
 * @param {Number} options.limit=Infinity Number of concurrently pending promises returned by mapper.
 * @returns {Object} An object containing the results for each key.
 */
module.exports = async (collection = {}, task = () => {}, options) => {
    const clonedOptions = _.cloneDeep(options);

    // backwards compat for moving from concurrency to limit
    if (!_.isEmpty(clonedOptions)) {
        if (!_.isNil(clonedOptions.concurrency)) {
            clonedOptions.limit = clonedOptions.concurrency;
        }
    }

    return new Promise((resolve, reject) => {
        const output = {};

        const limiter = new Limiter(collection, task, clonedOptions);

        limiter.on('error', ({ error } = {}) => {
            return reject(error);
        });
        limiter.on('iteration', ({ key, resultValue } = {}) => {
            _.set(output, [key], resultValue);
        });
        limiter.on('done', () => {
            return resolve(output);
        });

        limiter.start();
    });
};
