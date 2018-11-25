/**
 * @file Given a collection and a task return resolved values of the task being ran per value via the emitters
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';
const _ = require('lodash');

const DEFAULT_TASK = value => value;

/**
 * Given a collection and a task return resolved values of the task being ran per value via the emitters
 *
 * @module Limiter
 * @example
 * const the = require('await-the');
 * const functions = [
 *     async () => {
 *         await the.wait(1000);
 *         return 'waiter';
 *     },
 *     () => {
 *         return 'check please';
 *     }
 * ];
 * const limiter = new the.Limiter(functions, { limit: 1 });
 * 
 * limiter.on('iteration', ({ key, resultValue }) => {
 *     // resultValue - value of function ran
 *     // key - key of collection the function was run for
 * });
 * 
 * limiter.on('done', () => {
 *     return done();
 * });
 * 
 * limiter.on('error', ({error}) => {
 *     // error - error when running functions
 * });
 *
 * // begin iteration
 * limiter.start();

 * @param {Array|Object} collection - collection of data to be iterated over
 * @param {Function} task The async function to be run on each value in the collection.
 * @param {Object} options Optional overrides.
 * @param {Number} options.limit Optional limit to # of tasks to run in parallel.
 */
module.exports = class Limiter {
    constructor(collection = [], task = DEFAULT_TASK, options = {}) {
        // init options
        this.limit = _.get(options, 'limit', Infinity);
        this.bailOnError = _.get(options, 'bailOnError', true);

        // init defaults
        this.emitters = {}; // where registered emitters are set
        this.numberDone = 0; // keeps track of how many tasks have been completed
        this.concurrency = 0; // keeps track of number of tasks in flight
        this.currentIndex = 0; // keeps track of the index next to be iterated on

        this.collection = _.toPairs(collection);
        this.task = task;
    }

    static get AVAILABLE_CHANNELS() {
        return ['iteration', 'done', 'error'];
    }

    /**
     * start - begin iteration
     * @returns {undefined}
     */
    start() {
        // indicate we are started
        this.stopped = false;

        // don't do any work if an empty collection is supplied
        if (_.size(this.collection) === 0) {
            return this.emit('done');
        }

        // on start we want to get as many promises running as we can
        // since the limit defaults to infinity we take the min of the collection vs limit
        const initialSetSize = _.min([this.limit, _.size(this.collection)]);
        _.times(initialSetSize, () => this.iterate());
    }

    /**
     * stop - stop iteration
     */
    stop() {
        this.stopped = true;
    }

    /**
     * iterate - get the next item to resolve and resolve it
     * @private
     * @returns {undefined}
     */
    iterate() {
        this.concurrency++;
        const index = _.clone(this.currentIndex);

        const currentPair = _.get(this.collection, this.currentIndex++);
        // currentPair is an entry in the toPairs transform on the collection
        // the first item of the pair is the original key
        // the last item of the pair is the original value
        let currentKey = _.first(currentPair);
        const currentValue = _.last(currentPair);

        // to pairs takes array keys and turns them into strings
        // i.e. index 1 becomes '1' so this just coerces is back to a number
        currentKey = _.isNaN(_.parseInt(currentKey)) ? currentKey : _.parseInt(currentKey);

        // run in process next tick so iterate function can return ASAP
        process.nextTick(() => {
            const promise = this.task(currentValue, currentKey);
            // if the function is 'promise-y' wait for the result
            // otherwise return the value
            if (promise instanceof Promise) {
                promise
                    .then(res => this.emitIteration(currentKey, { resultValue: res, index }))
                    .catch(e => this.emitIteration(currentKey, { error: e, index }));
            } else {
                this.emitIteration(currentKey, { resultValue: promise, index });
            }
        });

        return;
    }

    /**
     * emit - emit data on a given channel
     * @private
     * @param {String} channel - channel to emit data to
     * @param {Object} data - data to emit
     */
    emit(channel, data) {
        const emitter = _.get(this.emitters, channel, () => {});
        emitter(data);
    }

    /**
     * emitIteration - when an iteration of running a task is complete emit and error or
     * an iteration event
     * - resultValue - value returned from the task
     * - key - key of the input collection the resultValue corresponds to
     * - index - index of the to pairs collection the resultValue corresponds to
     * @param {String| Number} key - key of the collection the result value is being returned for
     */
    emitIteration(key, { resultValue, error, index } = {}) {
        // don't let concurrency go below 0
        this.concurrency = this.concurrency - 1 >= 0 ? this.concurrency - 1 : 0;
        this.numberDone++;

        // if there has already been an error stop emitting
        if (this.error && this.bailOnError) {
            return;
        }

        // if limiter.stop() has been called stop iteration
        if (this.stopped) {
            return;
        }

        // if there is an error for the first time emit it and bail if bailOnError
        if (error) {
            this.error = error;
            this.emit('error', { key, error, index });

            if (this.bailOnError) {
                return;
            }
        }

        // alert the caller an iteration is complete
        this.emit('iteration', { key, resultValue, index });

        // if we are done emit
        if (this.numberDone >= _.size(this.collection)) {
            this.emit('done');
        } else if (this.concurrency < this.limit && this.currentIndex < _.size(this.collection)) {
            // if we have room in our concurrency to continue and we are not at the end of the collection
            // iterate again
            this.iterate();
        }
    }

    /**
     * on - register an emission listener on a given channel
     * @param {String} channel - channel to initialize a listener on
     * @param {Function} handler - function to call when channel receives a message
     */
    on(channel, handler) {
        // if a channel is not valid throw an error
        if (!_.includes(Limiter.AVAILABLE_CHANNELS, channel)) {
            throw new Error(`Channel: ${channel} is not valid`);
        }

        // register emitter
        _.set(this.emitters, channel, handler);
    }
};
