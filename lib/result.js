/**
 * @file Given a function that expects a callback as its last argument, await a promisified version of that function
 *       and return the result.
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const { promisify } = require('util');

/**
 * Result
 *
 * @module result
 * @example
 * const asyncSum = (x, y, callback) => callback(null, x + y);
 * const sum = await the.result(asyncSum, 1, 2);
 * // will assign 3 to `sum`
 *
 * @param {function} fn The async function to promisify and call.
 * @param {...mixed} args Variadic arguments to send to the function, _excluding_ the callback.
 */
module.exports = async (fn, ...args) => {
    return await promisify(fn)(...args);
};
