/**
 * @file Execute a promise with a timeout for a maximum time limit.
 * @copyright Copyright (c) 2019 Olono, Inc.
 */
'use strict';

const wait = require('./wait');

/**
 * Run the passed function, if it takes longer than the configured time throw an error, otherwise
 * return the results of the original function execution.
 *
 * On timeout, this does NOT abort the execution of the function!
 *
 * @module deadline
 * @example
 * const the = require('await-the');
 * await the.deadline(someAsyncFunction, 5000);
 * // will call `someAsyncFunction` and let it execute for 5000 ms, rejecting if it exceeds that time.
 *
 * @param {Function} task The async function to be run.
 * @param {Number} time The time in milliseconds this function should be allowed to run.
 * @param {String} error Optionally, a custom error message to use.
 * @returns {Promise} A promise
 */
module.exports = (task, time, error) => {
    return Promise.race([
        task(),
        wait(time).then(() => {
            throw new Error(error || 'timeout');
        })
    ]);
};
