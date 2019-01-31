/**
 * @file Map over collection
 * @copyright Copyright (c) 2018 Olono, Inc.
 */
'use strict';

const _ = require('lodash');
const Limiter = require('./Limiter');

/**
 * Given a collection run a map over it
 *
 * @module map
 * @example
 * const the = require('await-the');
 * const result = await the.map(['item1'], async (value, key) => {
 *     return somePromise(value);
 * });
 * // result is now an object with [<resolved promise>]
 *
 * @param {Array} collection to iterate over
 * @param {Promise} task Promise to be await for each key, called with (value, key).
 * @param {Object} options Optional overrides.
 * @param {Number} options.limit=Infinity Number of concurrently pending promises returned by mapper.
 * @returns {Array} An array containing the results for each index
 */
module.exports = async (collection = [], task = () => {}, options) => {
    const clonedOptions = _.cloneDeep(options);

    // backwards compat for moving from concurrency to limit
    if (!_.isEmpty(clonedOptions)) {
        if (!_.isNil(clonedOptions.concurrency)) {
            clonedOptions.limit = clonedOptions.concurrency;
        }
    }

    return new Promise((resolve, reject) => {
        // initialize output array so setting results can be done
        // out of order
        const output = new Array(_.size(collection));

        const limiter = new Limiter(collection, task, clonedOptions);

        limiter.on('error', ({ error } = {}) => {
            return reject(error);
        });
        limiter.on('iteration', ({ resultValue, index } = {}) => {
            output[index] = resultValue;
        });
        limiter.on('done', () => {
            return resolve(output);
        });

        limiter.start();
    });
};
