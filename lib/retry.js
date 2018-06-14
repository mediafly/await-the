/**
 * @file Retry promise a given number of times at an interval
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const _ = require('lodash');
const wait = require('./wait');

const DEFAULT_INTERVAL = 2000;

/**
 * Retry
 *
 * @module retry
 * @example
 * await the.retry(myPromise, { maxTries: 10, interval: 100 });
 * await the.retry(myPromise, { maxTries: 10, interval: numTriesSoFar => (numTriesSoFar * 100) });
 *
 * @param {Promise} promise The promise to be resolved (or rejected) on the retry cadence
 * @param {Object} options Optional overrides for maxTries and interval
 * @param {Number} options.maxTries Max number of times to retry to promise
 * @param {Number|Function} options.interval Time to wait in ms between promise executions
 */
module.exports = async (promise, options = {}) => {
    const { maxTries = 30, interval = DEFAULT_INTERVAL } = options;

    let result,
        tries = 0,
        lastError,
        intervalFn;

    // If a numeric interval is provided, we'll use that as the interval to wait
    // between retries.  If a function is provided, we'll call it with the attempt #
    // to determine how long to wait.  If some other type of value is provided,
    // ignore it and default to a constant wait.
    if (_.isNumber(interval)) {
        intervalFn = () => interval;
    } else if (_.isFunction(interval)) {
        intervalFn = interval;
    } else {
        intervalFn = () => DEFAULT_INTERVAL;
    }

    while (tries < maxTries) {
        tries++;

        try {
            result = await promise();
            lastError = null;
            break;
        } catch (error) {
            lastError = error;
            // No reason to wait after the final failure
            // since we're not going to try again...
            if (tries < maxTries) {
                let duration = intervalFn(tries);
                if (!_.isNumber(duration)) {
                    duration = DEFAULT_INTERVAL;
                }
                await wait(duration);
            }
        }
    }

    if (lastError) {
        throw lastError;
    }

    return result;
};
