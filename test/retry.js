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
});
