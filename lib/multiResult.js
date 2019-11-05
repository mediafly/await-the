/**
 * @file Given a function that expects a callback as its last argument, await a promisified version of that function
 *       and return the arguments sent to the callback as an array.
 * @copyright Copyright (c) 2019 Olono, Inc.
 */

'use strict';

const _ = require('lodash');

/**
 * Given a function that expects a callback as its last argument, await a promisified version of that function
 * and return the arguments sent to the callback as an array.
 *
 * @module multiResult
 * @example
 * const the = require('await-the');
 * const asyncSum = (x, y, callback) => callback(null, x + y, x * y);
 * const [err, sum, product] = await the.multiResult(asyncSum, 1, 2);
 * // will assign null to `err`, 3 to `sum` and 2 to `product`.
 *
 * await the.multiResult([someObj, 'someFnName'], 1, 2);
 * // equivalent of `await the.multiResult(someObj.someFnName.bind(someObj), 1, 2)`
 *
 * const someFnWithOptionalArgs = (x, y = 1, opts = {}, callback) => callback(null, x + y);
 * await the.multiResult(someFnWithOptionalArgs, 2, 1, {});
 * // if the function has optional params before the callback, values must be supplied for all
 *
 * @param {Function|Array} fn The async function to promisify and call, or an array of [class, method name].
 * @param {...*} args Variadic arguments to send to the function, _excluding_ the callback.  Note that _all_ parameters of the function besides the callback must have values supplied, even if they're optional.
 * @returns {Array} The arguments sent to the callback, including the error.
 */
module.exports = async (fn, ...args) => {
    if (_.isArray(fn)) {
        const [obj, objFnName] = fn;
        if (!_.isObject(obj)) {
            throw new Error(
                `Expected first value of array argument to 'multiResult()' to be an object; instead got: ${obj}`
            );
        }
        if (!_.isFunction(obj[objFnName])) {
            throw new Error(
                `Expected second value of array argument to 'multiResult()' to be the name of a function on the object; instead got: ${obj[objFnName]} (function name: ${objFnName})`
            );
        }
        fn = obj[objFnName].bind(obj);
    } else if (!_.isFunction(fn)) {
        throw new Error(
            `Expected argument to 'multiResult()' to be a function or an array; instead got: ${fn}`
        );
    }
    let resultsArray;
    try {
        resultsArray = await new Promise(resolve => {
            fn(...args, function(...callbackArgs) {
                return resolve(callbackArgs);
            });
        });
    } catch (e) {
        resultsArray = [e];
    }
    return resultsArray;
};
