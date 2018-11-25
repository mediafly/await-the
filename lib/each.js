/**
 * @file Given an array, run the given asynchronous task in parallel for each value of the array.
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';
const map = require('./map');

/**
 * Given a collection, run the given asynchronous task in parallel for each value of the collection.
 *
 * @module each
 * @example
 * const the = require('await-the');
 * await the.each([1,2,3], someAsyncFunction, { limit: 2 });
 * // will call `someAsyncFunction` on each value of the collection, with at most two functions
 * // running in parallel at a time.
 *
 * @param {Array|Object} collection Array or object of items to run the asynchronous task with.
 * @param {Function} task The async function to be run on each value in the collection.
 * @param {Object} options Optional overrides.
 * @param {Number} options.limit Optional limit to # of tasks to run in parallel.
 */
module.exports = async (collection, task, options) => {
    await map(collection, task, options);
};
