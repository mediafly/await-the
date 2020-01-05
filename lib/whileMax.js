/**
 * @file Given a condition, maximum amount of loops to do, and function, continuously call the promisified
 * version of that function sequentially and return the result once the exiting condition is met or the loop
 * count has been exhausted.
 * @copyright Copyright (c) 2020 Olono, Inc.
 */

'use strict';

/**
 * Given a condition, maximum amount of loops to do, and function, continuously call the promisified version
 * of that function sequentially and return the result once the exiting condition is met or the loop count
 * has been exhausted.
 *
 * The `condition` can access either the parent scoped variables or the results of `fn` which are passed in
 * as the only parameter.
 *
 * @module whileMax
 * @example
 * const the = require('await-the');
 * let sum = 0;
 * const max = 2;
 * const condition = previousResult => sum < 10;
 * const asyncFn = x => {
 *     sum += x;
 *     return sum * 10;
 * }
 * const result = await the.whileMax(condition, max, asyncFn, 2);
 * // is cut off by hitting the max loops possible
 * // sum === 4
 * // result === 40
 *
 * @param {Function} condition The condition to continue looping.
 * @param {Number} max The maximum amount of loops to do.
 * @param {Function|Array} fn The function to be resolved (or rejected) every loop.
 * @param {...*} args Variadic arguments to send to the function.
 * @returns {*} The thrown error or the result.
 */
module.exports = async (condition, max, fn, ...args) => {
    let count = 1;
    if (!(await condition()) || isNaN(max) || max < 1) {
        return;
    }

    const loop = async () => {
        const result = await fn(...args);
        count++;
        if ((await condition(result)) && count <= max) {
            return await loop();
        }
        return result;
    };

    return await loop();
};
