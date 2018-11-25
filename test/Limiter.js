'use strict';

const the = require('../index');
const _ = require('lodash');
const assert = require('assert');

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

    describe('bail on error', () => {
        it('should bail on error if not specified', async () => {
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

                const collection = ['item1', 'item2', 'item3'];
                const limiter = new the.Limiter(collection, async (value, index) => {
                    if (index === 1) {
                        throw new Error('test error');
                    }
                });

                let iterations = 0;
                limiter.on('iteration', () => {
                    iterations++;
                });

                limiter.on('done', () => {
                    return proxyDone();
                });

                limiter.on('error', ({ error }) => {
                    err = error;
                    return proxyDone();
                });

                limiter.start();
            });
        });
        it('should not bail on error if specified', async () => {
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
            return new Promise((resolve, reject) => {
                let err;

                const proxyDone = async () => {
                    // give any pending promises a chance to resolve
                    await the.wait(100);
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
                    { bailOnError: false }
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
                    limiter.stop();
                });

                limiter.start();
            });
        });
    });
});
