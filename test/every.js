const assert = require('assert');
const the = require('../index');

describe('every test', function() {
    this.timeout(30000);

    it('should return true if all promises resolve', async () => {
        const collection = ['item1', 'item2', 'item3'];
        const task = async (value, index) => {
            if (index === 1) {
                return await new Promise(resolve => resolve());
            } else {
                return value;
            }
        };

        const result = await the.every(collection, task);
        assert.strictEqual(result, true);
    });

    it('should throw an error if any does not resolve', async () => {
        const collection = ['item1', 'item2', 'item3'];
        const task = async () => {
            throw new Error('test error');
        };
        let err;
        try {
            await the.every(collection, task);
        } catch (e) {
            err = e;
        }
        assert(err);
        assert(err instanceof Error);
    });

    it('should error if last item throws (edge case)', async () => {
        const collection = ['item1', 'item2', 'item3', 'item4'];
        const task = async (value, index) => {
            if (index === 3) {
                throw new Error('test error');
            }
            return 'hi';
        };

        let err;
        try {
            await the.every(collection, task);
        } catch (e) {
            err = e;
        }
        assert(err);
        assert(err instanceof Error);
    });
});
