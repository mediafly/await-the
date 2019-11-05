const assert = require('assert');
const the = require('../index');

describe.only('multiResult test', function() {
    this.timeout(30000);

    it('should return the correct results with a standard (null, result) callback', async () => {
        const DELAY = 100;
        const VALUE = 200;
        const fn = (delay, value, cb) => {
            setTimeout(() => {
                return cb(null, value * 2);
            }, delay);
        };
        const curTime = Date.now();
        const [err, result] = await the.multiResult(fn, DELAY, VALUE);
        assert.equal(result, VALUE * 2);
        assert.equal(err, null);
        const duration = Date.now() - curTime;
        assert(
            duration >= DELAY,
            new Error(`Task took shorter time than it should have: expected > ${DELAY}, got ${duration}`)
        );
    });

    it('should return the correct results with a standard (error, result) callback', async () => {
        const DELAY = 100;
        const VALUE = 200;
        const fn = (delay, value, cb) => {
            setTimeout(() => {
                return cb(new Error('foo'), value * 2);
            }, delay);
        };
        const curTime = Date.now();
        const [err, result] = await the.multiResult(fn, DELAY, VALUE);
        assert.equal(result, VALUE * 2);
        assert(err instanceof Error);
        assert.equal(err.message, 'foo');
        const duration = Date.now() - curTime;
        assert(
            duration >= DELAY,
            new Error(`Task took shorter time than it should have: expected > ${DELAY}, got ${duration}`)
        );
    });

    it('should return the correct results with a multi-value (null, result1, result2) callback', async () => {
        const DELAY = 100;
        const VALUE = 200;
        const fn = (delay, value, cb) => {
            setTimeout(() => {
                return cb(null, value * 2, 'foo');
            }, delay);
        };
        const curTime = Date.now();
        const [err, result1, result2] = await the.multiResult(fn, DELAY, VALUE);
        assert.equal(result1, VALUE * 2);
        assert.equal(result2, 'foo');
        assert.equal(err, null);
        const duration = Date.now() - curTime;
        assert(
            duration >= DELAY,
            new Error(`Task took shorter time than it should have: expected > ${DELAY}, got ${duration}`)
        );
    });

    it('should respect binding', async () => {
        class Foo {
            constructor(name) {
                this.name = name;
            }
            fn(cb) {
                setTimeout(() => {
                    return cb(null, this.name);
                }, 100);
            }
        }
        const obj = new Foo('result-test');
        const [err1, result1] = await the.multiResult(obj.fn.bind(obj));
        assert.equal(err1, null);
        assert.equal(result1, 'result-test');
        const [err2, result2] = await the.multiResult(obj.fn.bind({ name: 'bar' }));
        assert.equal(err2, null);
        assert.equal(result2, 'bar');
    });

    it('should work with alternate syntax', async () => {
        class Foo {
            constructor(name) {
                this.name = name;
            }
            fn(suffix, cb) {
                setTimeout(() => {
                    return cb(null, `${this.name}-${suffix}`);
                }, 100);
            }
        }
        const obj = new Foo('result-test');
        const [err, result] = await the.multiResult([obj, 'fn'], 'foo');
        assert.equal(err, null);
        assert.equal(result, 'result-test-foo');
    });

    it('should capture error being thrown in the function', async () => {
        const fn = (value /* cb */) => {
            if (value === 5) {
                throw new Error('it works!');
            }
        };
        let error;
        let result;
        try {
            [result] = await the.multiResult(fn, 5);
        } catch (e) {
            error = e;
        } finally {
            assert(!error);
            assert(result instanceof Error);
            assert.equal(result.message, 'it works!');
        }
    });
});
