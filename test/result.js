const assert = require('assert');
const the = require('../index');

describe('Result test', function() {
    this.timeout(30000);

    it('should return the correct result', async () => {
        const DELAY = 100;
        const VALUE = 200;
        const fn = (delay, value, cb) => {
            setTimeout(() => {
                return cb(null, value * 2);
            }, delay);
        };
        const curTime = Date.now();
        const result = await the.result(fn, DELAY, VALUE);
        assert.equal(result, VALUE * 2);
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
        assert.equal(await the.result(obj.fn.bind(obj)), 'result-test');
        assert.equal(await the.result(obj.fn.bind({ name: 'bar' })), 'bar');
    });

    it('should fail on error being returned in callback', async () => {
        const fn = (value, cb) => {
            if (value === 5) {
                return cb(new Error('it works!'));
            }
        };
        let error;
        try {
            await the.result(fn, 5);
        } catch (e) {
            error = e;
        } finally {
            assert(!!error);
            assert.equal(error.message, 'it works!');
        }
    });

    it('should fail on error being thrown in the funciton', async () => {
        const fn = (value /* cb */) => {
            if (value === 5) {
                throw new Error('it works!');
            }
        };
        let error;
        try {
            await the.result(fn, 5);
        } catch (e) {
            error = e;
        } finally {
            assert(!!error);
            assert.equal(error.message, 'it works!');
        }
    });
});
