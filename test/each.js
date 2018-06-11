const assert = require('assert');
const the = require('../index');

describe('Each test', function() {
    this.timeout(30000);

    it('should return the correct data and should run all tasks in parallel', async () => {
        let sum = 0;
        let curTime = Date.now();
        await the.each([100, 200, 300, 400], async value => {
            await the.wait(value);
            sum += value;
        });
        assert.equal(sum, 1000);
        const duration = Date.now() - curTime;
        assert(
            duration < 4100,
            new Error(
                'Tasks took longer than they should if running parallel: expected < 4100, got ' + duration
            )
        );
    });

    it('should return the correct data and should run all tasks in series with `limit: 1`', async () => {
        let sum = 0;
        let curTime = Date.now();
        await the.each(
            [100, 200, 300, 400],
            async value => {
                await the.wait(value);
                sum += value;
            },
            { limit: 1 }
        );
        assert.equal(sum, 1000);
        const duration = Date.now() - curTime;
        assert(
            duration > 990,
            new Error(
                'Tasks took shorter time than they should if running in series: expected > 990, got ' +
                    duration
            )
        );
    });

    it('should fail on rejected promises', async () => {
        let err;

        try {
            await the.each([1, 2, 3, 4], async value => {
                if (value === 2) {
                    throw new Error('test2 failure!');
                } else {
                    await the.wait(10);
                }
                return `${value}-done`;
            });
        } catch (e) {
            err = e;
        }

        assert(!!err);
    });
});
