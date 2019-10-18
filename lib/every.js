/**
 * @file Given a collection and a task return true if any promise resolves
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';
const _ = require('lodash');
const Limiter = require('./Limiter');

/**
 * Given a collection and a task return true if all promises resolve.
 * Will bail on first error
 * @module any
 * @alias some
 * @example
 * const the = require('await-the')
 * const collection = ['item1', 'item2', 'item3'];
 * const task = async (value, index) => {
 *     return await new Promise(resolve => resolve());
 * };
 * const result = await the.every(collection, task);
 * // result is true
 * @param {Array|Object} collection Array or object of items to run the asynchronous task over.
 * @param {Function} task The async function to be run on each value in the collection.
 * @param {Object} options Optional overrides.
 * @param {Number} options.limit=Infinity Number of concurrently pending promises returned by mapper.
 * @returns {Boolean} true if all promises resolve, otherwise throws the error from the first rejected promise it encounters
 */
module.exports = async (collection, task, options = {}) => {
    return new Promise((resolve, reject) => {
        // allow caller to override the default of bailOnError
        if (_.isNil(_.get(options, 'bailOnError'))) {
            _.set(options, 'bailOnError', true);
        }

        const limiter = new Limiter(collection, task, options);

        limiter.on('error', ({ error } = {}) => reject(error));

        limiter.on('done', () => resolve(true));

        limiter.start();
    });
};
