/**
 * @file Given a function that expects a callback as its last argument, await a promisified version of that function
 *       and return the result.
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const _ = require('lodash');
const { promisify } = require('util');

/**
 * Given a function that expects a callback as its last argument, await a promisified version of that function
 * and return the result.
 *
 * @module result
 * @example
 * const the = require('await-the');
 * const asyncSum = (x, y, callback) => callback(null, x + y);
 * const sum = await the.result(asyncSum, 1, 2);
 * // will assign 3 to `sum`
 *
 * await the.result([someObj, 'someFnName'], 1, 2);
 * // equivalent of `await the.result(someObj.someFnName.bind(someObj), 1, 2)`
 *
 * const someFnWithOptionalArgs = (x, y = 1, opts = {}, callback) => callback(null, x + y);
 * await the.result(someFnWithOptionalArgs, 2, 1, {});
 * // if the function has optional params before the callback, values must be supplied for all
 *
 * @param {Function|Array} fn The async function to promisify and call, or an array of [class, method name].
 * @param {...*} args Variadic arguments to send to the function, _excluding_ the callback.  Note that _all_ parameters of the function besides the callback must have values supplied, even if they're optional.
 * @returns {*} The thrown error or the result.
 */
module.exports = async (fn, ...args) => {
    if (_.isArray(fn)) {
        const [obj, objFnName] = fn;
        if (!_.isObject(obj)) {
            throw new Error(
                `Expected first value of array argument to 'result()' to be an object; instead got: ${obj}`
            );
        }
        if (!_.isFunction(obj[objFnName])) {
            throw new Error(
                `Expected second value of array argument to 'result()' to be the name of a function on the object; instead got: ${obj[objFnName]} (function name: ${objFnName})`
            );
        }
        fn = obj[objFnName].bind(obj);
    } else if (!_.isFunction(fn)) {
        throw new Error(`Expected argument to 'result()' to be a function or an array; instead got: ${fn}`);
    }
    return await promisify(fn)(...args);
};
