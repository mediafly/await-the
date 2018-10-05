/**
 * @file Utility for making optional callbacks easier. If an error parameter exists, it will throw an error
 *       for promises or return the error to a callback.
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

/**
 * Utility for making optional callbacks easier. If an error param exists, it will throw an error for promises
 * or return the error to a callback.
 *
 * @module callback
 * @example
 * const the = require('await-the');
 * const myFunc = async (args, callback) => {
 *     try {
 *         const result = await somePromise();
 *         return the.callback(callback, null, result);
 *     } catch (e) {
 *         return the.callback(callback, e.message);
 *     }
 * };
 *
 * // call as a promise
 * await myFunc(args);
 * // or as a callback
 * myFunc(args, (err, result) => {});
 *
 * @param {Function} callback If present will invoke the callback with the err and result; otherwise, return or throw.
 * @param {Object|String|Number|Boolean} err Error to throw or return to the caller.
 * @param {*} result The thrown error or the result to return to the calling function.
 */

module.exports = (callback, err, result) => {
    if (callback) {
        return callback(err, result);
    }

    if (err) {
        throw new Error(err);
    }

    return result;
};
