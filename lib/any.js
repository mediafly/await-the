/**
 * @file Given a collection and a task return true if any promise resolves
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const Limiter = require('./Limiter');

/**
 * Given a collection and a task return true if any promise resolves
 * @module any
 * @alias some
 * @example
 * const the = require('await-the')
 * const collection = ['item1', 'item2', 'item3'];
 * const task = async (value, index) => {
 *     if (index === 1) {
 *         return await new Promise(resolve => resolve());
 *     } else {
 *         throw new Error('test error');
 *     }
 * };
 * const result = await the.any(collection, task);
 * // result is true
 * @param {Array|Object} collection Array or object of items to run the asynchronous task over.
 * @param {Function} task The async function to be run on each value in the collection.
 * @returns {Boolean} true if a promise resolves otherwise throws an error
 */
module.exports = async (collection, task) => {
    return new Promise((resolve, reject) => {
        const limiter = new Limiter(collection, task, { bailOnError: false });

        // indicates if we have returned yet
        limiter.on('iteration', ({ error }) => {
            if (error) {
                return;
            }

            limiter.stop();
            return resolve(true);
        });

        limiter.on('done', () => reject(new Error('No promises resolved')));

        limiter.start();
    });
};
