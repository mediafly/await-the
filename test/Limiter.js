'use strict';

const the = require('../index');
const _ = require('lodash');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const bluebird = require('bluebird');

describe('Limiter test', function() {
    this.timeout(30000);

    it('should return if no collection is supplied', async () => {
        return new Promise((resolve, reject) => {
            const limiter = new the.Limiter();

            let iterations = 0;
            limiter.on('iteration', () => {
                iterations++;
            });

            limiter.on('done', () => {
                try {
                    assert.strictEqual(iterations, 0);
                } catch (e) {
                    return reject(e);
                }
                return resolve();
            });

            limiter.on('error', ({ error }) => {
                return reject(`Got error ${error.message}`);
            });

            limiter.start();
        });
    });

    it('should do iterate 2 times and call done', async () => {
        return new Promise((resolve, reject) => {
            const collection = ['item1', 'item2'];
            const limiter = new the.Limiter(collection);

            let iterations = 0;
            limiter.on('iteration', () => {
                iterations++;
            });

            limiter.on('done', () => {
                try {
                    assert.strictEqual(iterations, 2);
                } catch (e) {
                    return reject(e);
                }
                return resolve();
            });

            limiter.on('error', ({ error }) => {
                return reject(`Got error ${error.message}`);
            });

            limiter.start();
        });
    });

    it('should be able to run serially with a limit of 1', async () => {
        return new Promise((resolve, reject) => {
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
                try {
                    assert.strictEqual(_.size(results), 2);
                    assert.strictEqual(_.first(results), 'waiter');
                    assert.strictEqual(_.last(results), 'check please');
                } catch (e) {
                    return reject(e);
                }

                return resolve();
            });

            limiter.on('error', ({ error }) => {
                return reject(`Got error ${error.message}`);
            });

            limiter.start();
        });
    });

    it('should be able to run in parallel with a limit of 3', async () => {
        return new Promise((resolve, reject) => {
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
                try {
                    assert.strictEqual(_.size(results), 3);
                    assert(
                        totalTime < 2000,
                        `Expected execution to take less than 2 seconds to prove parallelism got ${totalTime}`
                    );
                    assert.strictEqual(_.first(results), 'check please');
                } catch (e) {
                    return reject(e);
                }
                return resolve();
            });

            limiter.on('error', ({ error }) => {
                return reject(`Got error ${error.message}`);
            });

            timer = Date.now();
            limiter.start();
        });
    });

    it('should be able to run in parallel with a limit of 2', async () => {
        return new Promise((resolve, reject) => {
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
                try {
                    assert.strictEqual(_.size(results), 3);
                    assert(
                        totalTime < 3000,
                        'Expected execution to take less than 3 seconds to prove parallelism'
                    );
                    assert.strictEqual(results[0], 'waiter2');
                    assert.strictEqual(results[1], 'check please');
                    assert.strictEqual(results[2], 'waiter1');
                } catch (e) {
                    return reject(e);
                }

                return resolve();
            });

            limiter.on('error', ({ error }) => {
                return reject(`got error ${error}`);
            });

            timer = Date.now();
            limiter.start();
        });
    });

    it('should work correctly when presented with keys that start with numbers or are stringified numbers', async () => {
        return new Promise((resolve, reject) => {
            const collection = { '123abc': 'foo', '234': 'bar', '56d': 'baz' };

            const limiter = new the.Limiter(
                collection,
                async (value, key) => {
                    if (key === '123abc') {
                        return 'fooey';
                    }
                    if (key === '234') {
                        return 'barry';
                    }
                    if (key === '56d') {
                        return 'bazzy';
                    }
                    throw new Error('unexpected key!');
                },
                { limit: 2 }
            );

            let results = {};
            limiter.on('iteration', ({ resultValue, key }) => {
                results[key] = resultValue;
            });

            limiter.on('done', () => {
                try {
                    assert.deepStrictEqual(results, {
                        '123abc': 'fooey',
                        '234': 'barry',
                        '56d': 'bazzy'
                    });
                } catch (e) {
                    return reject(e);
                }

                return resolve();
            });

            limiter.on('error', ({ error }) => {
                return reject(`got error ${error}`);
            });

            limiter.start();
        });
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

    it('should work correctly with ugly promises', async () => {
        return new Promise((resolve, reject) => {
            const collection = ['waiter', 'check please'];
            const limiter = new the.Limiter(
                collection,
                // Note that this is NOT an async function.  If it was, it would be wrapped by Node
                // and return a nice Promise.  Instead, it returns a gnarly Bluebird promise for
                // which `instanceof Promise` would return `false`.
                (value, key) => {
                    if (key === 0) {
                        return bluebird.delay(1000).then(() => value);
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
                try {
                    assert.strictEqual(_.size(results), 2);
                    assert.strictEqual(_.first(results), 'waiter');
                    assert.strictEqual(_.last(results), 'check please');
                } catch (e) {
                    return reject(e);
                }

                return resolve();
            });

            limiter.on('error', ({ error }) => {
                return reject(`Got error ${error.message}`);
            });

            limiter.start();
        });
    });

    it('should not block the event loop', async () => {
        return new Promise((resolve, reject) => {
            const collection = _.range(0, 10);
            const limiter = new the.Limiter(
                collection,
                async value => {
                    let now = Date.now();
                    const start = now;
                    while (now - start < 100) {
                        now = Date.now();
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
                try {
                    // If the event loop is blocked, this will be 10 since the Limiter
                    // will finish before any IO or timer callbacks fire.
                    assert.strictEqual(_.size(results), 12);
                    // Validate that numeric items were still processed in order.
                    assert.deepEqual(_.without(results, 'io', 'timer'), collection);
                } catch (e) {
                    return reject(e);
                }

                return resolve();
            });

            limiter.on('error', ({ error }) => {
                return reject(`Got error ${error.message}`);
            });

            // Some IO that should happen before the limiter is done.
            fs.readFile(path.resolve(__dirname, __filename), err => {
                if (err) {
                    throw new Error('Error reading file: ', JSON.stringify(err));
                }
                results.push('io');
            });

            // A timer that should happen before the limiter is done.
            setTimeout(() => {
                results.push('timer');
            }, 50);

            limiter.start();
        });
    });

    describe('bail on error', () => {
        it('should bail on error by default', async () => {
            // Three items in the collectino, parallelism 1, so should expect 3 events by default
            // - On the first item, we emit the iteration event and increment iterations counter
            // - On the second item (index 1) we emit an error event. As bailOnError is true, we do NOT emit an iteration event and do not continue processing.
            // - The third item should never be processed.
            return new Promise((resolve, reject) => {
                let err;

                const proxyDone = async () => {
                    // give any pending promises a chance to resolve
                    await the.wait(100);
                    try {
                        assert(err, 'expected err to exist');
                        assert.strictEqual(iterations, 1, 'Expected only two iterations');
                    } catch (e) {
                        return reject(e);
                    }

                    return resolve();
                };

                const collection = ['item1', 'item2', 'item3'];
                const limiter = new the.Limiter(
                    collection,
                    async (value, index) => {
                        if (index === 1) {
                            throw new Error('test error');
                        }
                    },
                    { limit: 1 }
                );

                let iterations = 0;
                limiter.on('iteration', () => {
                    iterations++;
                });

                limiter.on('done', () => {
                    reject('done event should not have been emitted');
                });

                limiter.on('error', ({ error }) => {
                    err = error;
                    return proxyDone();
                });

                limiter.start();
            });
        });

        it('should not bail on error if specified', async () => {
            // Three items in the collectino, parallelism 1, so should expect 3 events by default
            // - On the first item, we emit the iteration event and increment iterations counter
            // - On the second item (index 1) we emit an error event. As bailOnError is false, we also emit the iteration
            // - On the third item (index 2) we process as usual and emit the iteration event
            return new Promise((resolve, reject) => {
                let err;
                const proxyDone = () => {
                    try {
                        assert(err, 'expected err to exist');
                        assert.strictEqual(iterations, 3);
                    } catch (e) {
                        return reject(e);
                    }

                    return resolve();
                };
                const collection = ['item1', 'item2', 'item3'];
                const limiter = new the.Limiter(
                    collection,
                    async (value, index) => {
                        if (index === 1) {
                            throw new Error('test error');
                        }
                    },
                    { bailOnError: false, limit: 1 }
                );

                let iterations = 0;
                limiter.on('iteration', () => {
                    iterations++;
                });

                limiter.on('done', () => {
                    return proxyDone();
                });

                limiter.on('error', ({ error }) => {
                    err = error;
                });

                limiter.start();
            });
        });
    });

    describe('stop', () => {
        it('should stop iteration after calling stop', async () => {
            // Four items in collection, parallelism 1, so we expect 4 iterations by default
            // - On the first item, we emit the iteration event and increment iterations counter
            // - On the second item (ie index 1) we emit an error. As bailOnError is false, we also emit the iteration event
            //   and increment the counter. The error event handler invokes `stop()`.
            // - On the third item we see that stop has been invoked
            // - The fourth item should never be processed.
            return new Promise((resolve, reject) => {
                let err;

                const proxyDone = async () => {
                    // give any pending promises a chance to resolve
                    await the.wait(100);
                    try {
                        assert(err, 'expected err to exist');
                        assert.strictEqual(iterations, 2);
                    } catch (e) {
                        return reject(e);
                    }

                    return resolve();
                };

                const collection = ['item1', 'item2', 'item3', 'item4'];
                const limiter = new the.Limiter(
                    collection,
                    async (value, index) => {
                        if (index === 1) {
                            throw new Error('test error');
                        }
                    },
                    { bailOnError: false, limit: 1 }
                );

                let iterations = 0;
                limiter.on('iteration', () => {
                    iterations++;
                });

                limiter.on('done', () => {
                    // ERROR PATH, this shouldn't be invoked
                    return reject('done event should not have been emitted');
                });

                limiter.on('error', ({ error }) => {
                    err = error;
                    limiter.stop();

                    return proxyDone();
                });

                limiter.start();
            });
        });
    });
});
