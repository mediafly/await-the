/**
 * @file  Given a condition and function, continuously call the promisified version of that function
 * sequentially and return the result once the exiting condition is met.
 * @copyright Copyright (c) 2019 Olono, Inc.
 */

'use strict';

/**
 * Given a condition and function, continuously call the promisified version of that function sequentially
 * and return the result once the exiting condition is met.
 *
 * The `condition` can access either the parent scoped variables or the results of `fn` which are passed in
 * as the only parameter.
 *
 * @module while
 * @example
 * const the = require('await-the');
 * let sum = 0;
 * const condition = previousResult => sum < 10;
 * const asyncFn = x => {
 *     sum += x;
 *     return sum * 10;
 * }
 * const result = await the.while(condition, asyncFn, 2);
 * // will loop while sum < 10, then return the final function result
 * // sum === 10
 * // result === 100
 *
 * @param {Function} condition The condition to continue looping.
 * @param {Function|Array} fn The function to be resolved (or rejected) every loop.
 * @param {...*} args Variadic arguments to send to the function.
 * @returns {*} The thrown error or the result.
 */
module.exports = async (condition, fn, ...args) => {
    if (!condition()) {
        return;
    }

    const loop = async () => {
        const result = await fn(...args);
        if (condition(result)) {
            return await loop();
        }

        return result;
    };

    return await loop();
};
