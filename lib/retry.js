/**
 * @file Retry promise a given number of times at an interval
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const wait = require('./wait');

/**
 * Retry
 *
 * @todo add support for functions as maxTries and interval
 *
 * @param {Promise} promise The promise to be resolved (or rejected) on the retry cadence
 * @param {Object} options Optional overrides for maxTries and interval
 * @param {Number} options.maxTries Max number of times to retry to promise
 * @param {Number} options.interval Time to wait in ms between promise executions
 */
module.exports = async (promise, options = {}) => {
    const { maxTries = 30, interval = 2000 } = options;

    let result,
        tries = 0,
        lastError;

    while (tries < maxTries) {
        tries++;

        try {
            result = await promise();
            lastError = null;
            break;
        } catch (error) {
            lastError = error;
            await wait(interval);
        }
    }

    if (lastError) {
        throw lastError;
    }

    return result;
};
