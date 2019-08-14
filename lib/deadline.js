/**
 * @file Execute a promise with a timeout for a maximum time limit.
 * @copyright Copyright (c) 2019 Olono, Inc.
 */
'use strict';

const wait = require('./wait');

/**
 * Given a collection, run the given asynchronous task in parallel for each value of the collection.
 *
 * @module each
 * @example
 * const the = require('await-the');
 * await the.deadline(someAsyncFunction, 5000);
 * // will call `someAsyncFunction` and let it execute for 5000 ms, rejecting if it exceeds that time.
 *
 * @param {Function} task The async function to be run.
 * @param {Number} time The time in milliseconds this function should be allowed to run.
 * @returns {Promise} A promise
 */
module.exports = (task, time) => {
    return Promise.race([
        task(),
        wait(time).then(() => {
            throw new Error('timeout');
        })
    ]);
};
