/**
 * @file Retry promise a given number of times at an interval.
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const _ = require('lodash');
const wait = require('./wait');

const DEFAULT_INTERVAL = 2000;

/**
 * Retry promise a given number of times at an interval.
 *
 * @module retry
 * @example
 * const the = require('await-the');
 * await the.retry(myPromise, { maxTries: 10, interval: 100 });
 * await the.retry(myPromise, { maxTries: 10, interval: numTriesSoFar => (numTriesSoFar * 100) });
 * await the.retry(myPromise, { maxTries: 10, interval: errorFilter: 'My Expected Error' });
 * await the.retry(myPromise, { maxTries: 10, interval: errorFilter: err => err.message === 'My Expected Error' });
 *
 * @param {Promise} promise The promise to be resolved (or rejected) on the retry cadence.
 * @param {Object} options Optional overrides.
 * @param {Number} options.maxTries Maximum number of times to retry to promise.
 * @param {Number|Function} options.interval Time to wait in ms between promise executions.
 * @param {Any|Function|Promise} options.errorFilter - if supplied only retry if Any === error.message or function returns true
 * @returns {*} The last thrown error or the result.
 */
module.exports = async (promise, options = {}) => {
    const { maxTries = 30, interval = DEFAULT_INTERVAL, errorFilter } = options;

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

    // the default error filter will always return true
    let errorFilterFunction = () => {
        return true;
    };

    if (errorFilter) {
        if (_.isFunction(errorFilter)) {
            errorFilterFunction = errorFilter;
        } else {
            errorFilterFunction = err => {
                return _.get(err, 'message') === errorFilter;
            };
        }
    }

    while (tries < maxTries) {
        tries++;

        try {
            result = await promise();
            lastError = null;
            break;
        } catch (error) {
            lastError = error;
            const errorFilterResult = await errorFilterFunction(error);
            // if errorFilterResult is not true we stop retrying
            if (errorFilterResult !== true) {
                break;
            }
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
