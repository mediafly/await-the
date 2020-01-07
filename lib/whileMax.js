/**
 * @file Given a condition, maximum amount of loop iterations to do, and function, continuously call the promisified
 * version of that function sequentially and return the result once the exiting condition is met or the loop
 * count has been exhausted.
 * @copyright Copyright (c) 2020 Olono, Inc.
 */

'use strict';

const awaitWhile = require('../lib/while');

/**
 * Given a condition, maximum amount of loop iterations to do, and function, continuously call the promisified
 * version of that function sequentially and return the result once the exiting condition is met or the loop
 * count has been exhausted.
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
 * @param {Number} maxIterations The maximum amount of loop iterations to be done.
 * @param {Function|Array} fn The function to be resolved (or rejected) every loop.
 * @param {...*} args Variadic arguments to send to the function.
 * @returns {*} The thrown error or the result.
 */
module.exports = async (condition, maxIterations, fn, ...args) => {
    let count = 0;
    if (isNaN(maxIterations)) {
        throw new Error(`The max iterations is not a number: ${maxIterations}`);
    } else if (maxIterations < 1) {
        throw new Error(`The whileMax function was started with an invalid max iterations: ${maxIterations}`);
    } else if (!(await condition())) {
        return;
    }
    const conditionWithMax = async previousResult => {
        count++;
        if (count > maxIterations) {
            return false;
        }
        return await condition(previousResult);
    };

    return await awaitWhile(conditionWithMax, fn, ...args);
};
