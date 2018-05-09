const assert = require('assert');
const the = require('../index');

describe('Map Values test', function() {
    this.timeout(30000);

    it('should return the correct data', async () => {
        const output = await the.mapValues({ key1: 'test1', key2: 'test2' }, async (value, key) => {
            if (value === 'test1') {
                await the.wait(1000);
            } else {
                await the.wait(10);
            }
            return `${key}-${value}-done`;
        });

        assert.deepEqual(output, { key1: 'key1-test1-done', key2: 'key2-test2-done' });
    });

    it('should fail on rejected promises', async () => {
        let err;

        try {
            await the.mapValues({ key1: 'test1', key2: 'test2' }, async value => {
                if (value === 'test2') {
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
