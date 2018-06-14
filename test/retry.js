const assert = require('assert');
const the = require('../index');

describe('Retry test', function() {
    this.timeout(30000);

    it('should retry three times', async () => {
        let tryCount = 0;

        const result = await the.retry(
            async () => {
                tryCount += 1;
                await the.wait(100);
                if (tryCount !== 3) {
                    throw new Error();
                }
                return true;
            },
            { interval: 100, maxTries: 3 }
        );

        assert(result === true);
        assert(tryCount === 3, tryCount);
    });

    it('should fail after max tries reached', async () => {
        let tryCount = 0,
            error;

        try {
            await the.retry(
                async () => {
                    tryCount += 1;
                    await the.wait(100);
                    throw new Error();
                },
                { interval: 100, maxTries: 5 }
            );
        } catch (e) {
            error = e;
        }

        assert(error);
        assert(tryCount === 5, tryCount);
    });

    it('should respect a number as the retry interval', async () => {
        const start = Date.now();
        let error;
        try {
            await the.retry(
                async () => {
                    await the.wait(1);
                    throw new Error('always fail');
                },
                { interval: 100, maxTries: 5 }
            );
        } catch (e) {
            error = e;
        }

        assert(error);
        const duration = Date.now() - start;
        assert(duration > 400 && duration < 500, `Expected duration to be ~400, instead saw ${duration}`);
    });

    it('should respect a function as the retry interval', async () => {
        const start = Date.now();
        let error;
        try {
            await the.retry(
                async () => {
                    await the.wait(1);
                    throw new Error('always fail');
                },
                { interval: numTries => numTries * 100, maxTries: 5 }
            );
        } catch (e) {
            error = e;
        }

        assert(error);
        const duration = Date.now() - start;
        assert(duration > 1000 && duration < 1100, `Expected duration to be ~1000, instead saw ${duration}`);
    });

    it('should default to a 2 second interval', async () => {
        const start = Date.now();
        let error;
        try {
            await the.retry(
                async () => {
                    await the.wait(1);
                    throw new Error('always fail');
                },
                { maxTries: 2 }
            );
        } catch (e) {
            error = e;
        }

        assert(error);
        const duration = Date.now() - start;
        assert(duration > 2000 && duration < 2100, `Expected duration to be ~2000, instead saw ${duration}`);
    });

    it('should gracefully handle bogus output from an interval function', async () => {
        const start = Date.now();
        let error;
        try {
            await the.retry(
                async () => {
                    await the.wait(1);
                    throw new Error('always fail');
                },
                { interval: () => 'cheezy poofs', maxTries: 2 }
            );
        } catch (e) {
            error = e;
        }

        assert(error);
        const duration = Date.now() - start;
        assert(duration > 2000 && duration < 2100, `Expected duration to be ~2000, instead saw ${duration}`);
    });
});
