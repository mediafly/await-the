/**
 * @file Given a collection of functions, promises, or basic types 'run' them all at a specified limit
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';
const _ = require('lodash');
const map = require('./map');

/**
 * Given a collection of functions, promises, or basic types 'run' them all at a specified limit
 *
 * @module all
 * @example
 * const the = require('await-the');
 * await the.all(
 *     [
 *         new Promise(resolve => resolve('hello')),
 *         'world',
 *         () => 'how are you?'
 *     ],
 *     { limit: 2 }
 *  );
 *
 * @param {Array|Object} collection Array or object of items to run the asynchronous task with.
 * @param {Object} options Optional overrides.
 * @param {Number} options.limit Optional limit to # of tasks to run in parallel.
 * @returns {Array} array of the resolved promises
 */
module.exports = async (collection, options) =>
    await map(
        collection,
        async item => {
            if (!item) {
                return item;
            }

            if (_.isFunction(item)) {
                return await item();
            }

            return item;
        },
        options
    );
