'use strict';

const the = require('../index');
const _ = require('lodash');
const assert = require('assert');

describe('Limiter test', function() {
    this.timeout(30000);

    it('should return if no collection is supplied', done => {
        const limiter = new the.Limiter();

        let iterations = 0;
        limiter.on('iteration', () => {
            iterations++;
        });

        limiter.on('done', () => {
            assert.strictEqual(iterations, 0);
            return done();
        });

        limiter.on('error', ({ error }) => {
            assert(!error, `Got error ${error.message}`);
            return done();
        });

        limiter.start();
    });

    it('should do iterate 2 times and call done', done => {
        const collection = ['item1', 'item2'];
        const limiter = new the.Limiter(collection);

        let iterations = 0;
        limiter.on('iteration', () => {
            iterations++;
        });

        limiter.on('done', () => {
            assert.strictEqual(iterations, 2);
            return done();
        });

        limiter.on('error', ({ error }) => {
            assert(!error, `Got error ${error.message}`);
            return done();
        });

        limiter.start();
    });

    it('should be able to run serially with a limit of 1', done => {
        const collection = ['waiter', 'check please'];
        const limiter = new the.Limiter(
            collection,
            async (value, key) => {
                if (key === 0) {
                    await the.wait(1000);
                }

                return value;
            },
            { limit: 1 }
        );

        let results = [];
        limiter.on('iteration', ({ resultValue }) => {
            results.push(resultValue);
        });

        limiter.on('done', () => {
            assert.strictEqual(_.size(results), 2);
            assert.strictEqual(_.first(results), 'waiter');
            assert.strictEqual(_.last(results), 'check please');
            return done();
        });

        limiter.on('error', ({ error }) => {
            assert(!error, `Got error ${error.message}`);
            return done();
        });

        limiter.start();
    });

    it('should be able to run in parallel with a limit of 3', done => {
        const collection = ['waiter1', 'waiter2', 'check please'];

        const limiter = new the.Limiter(
            collection,
            async (value, key) => {
                if (key === 0) {
                    await the.wait(1000);
                } else if (key === 1) {
                    await the.wait(1000);
                }

                return value;
            },
            { limit: 3 }
        );

        let results = [];
        limiter.on('iteration', ({ resultValue }) => {
            results.push(resultValue);
        });

        let timer;
        limiter.on('done', () => {
            const totalTime = Date.now() - timer;
            assert.strictEqual(_.size(results), 3);
            assert(
                totalTime < 2000,
                `Expected execution to take less than 2 seconds to prove parallelism got ${totalTime}`
            );
            assert.strictEqual(_.first(results), 'check please');
            return done();
        });

        limiter.on('error', ({ error }) => {
            assert(!error, `Got error ${error.message}`);
            return done();
        });

        timer = Date.now();
        limiter.start();
    });

    it('should be able to run in parallel with a limit of 2', done => {
        const collection = ['waiter1', 'waiter2', 'check please'];

        const limiter = new the.Limiter(
            collection,
            async (value, key) => {
                if (key === 0) {
                    await the.wait(2000);
                } else if (key === 1) {
                    await the.wait(1000);
                }

                return value;
            },
            { limit: 2 }
        );

        let results = [];
        limiter.on('iteration', ({ resultValue }) => {
            results.push(resultValue);
        });

        let timer;
        limiter.on('done', () => {
            const totalTime = Date.now() - timer;
            assert.strictEqual(_.size(results), 3);
            assert(totalTime < 3000, 'Expected execution to take less than 3 seconds to prove parallelism');
            assert.strictEqual(results[0], 'waiter2');
            assert.strictEqual(results[1], 'check please');
            assert.strictEqual(results[2], 'waiter1');
            return done();
        });

        limiter.on('error', ({ error }) => {
            assert(!error, `Got error ${error.message}`);
            return done();
        });

        timer = Date.now();
        limiter.start();
    });

    it('should throw for invalid channel', () => {
        const collection = [];
        const limiter = new the.Limiter(collection);

        let error;
        try {
            limiter.on('gibberish');
        } catch (e) {
            error = e;
        }

        assert.strictEqual(error.message, `Channel: gibberish is not valid`);
    });
});
