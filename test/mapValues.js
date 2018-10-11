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

    it('should run in parallel if the limit greater than 1', async () => {
        const collection = {
            item1: 'item-1',
            item2: 'item-2',
            item3: 'item-3'
        };
        const task = async (value, key) => {
            await the.wait(500);
            return `${value}${key}`;
        };

        const start = Date.now();
        const output = await the.mapValues(collection, task, { limit: 2 });
        const duration = Date.now() - start;
        assert(duration < 1500, 'Expected promises to run in parallel');
        assert.deepStrictEqual(output, {
            item1: 'item-1item1',
            item2: 'item-2item2',
            item3: 'item-3item3'
        });
    });

    it('should run in parallel if the concurrency greater than 1', async () => {
        const collection = {
            item1: 'item-1',
            item2: 'item-2',
            item3: 'item-3'
        };
        const task = async (value, key) => {
            await the.wait(500);
            return `${value}${key}`;
        };

        const start = Date.now();
        const output = await the.mapValues(collection, task, { concurrency: 2 });
        const duration = Date.now() - start;
        assert(duration < 1500, 'Expected promises to run in parallel');
        assert.deepStrictEqual(output, {
            item1: 'item-1item1',
            item2: 'item-2item2',
            item3: 'item-3item3'
        });
    });
});
