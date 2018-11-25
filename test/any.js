const assert = require('assert');
const the = require('../index');

describe('all test', function() {
    this.timeout(30000);

    it('should return true for a promise that passes', async () => {
        const collection = ['item1', 'item2', 'item3'];
        const task = async (value, index) => {
            if (index === 1) {
                return await new Promise(resolve => resolve());
            } else {
                throw new Error('test error');
            }
        };

        const result = await the.any(collection, task);
        assert.strictEqual(result, true);
    });

    it('should throw an error if no promises resolve', async () => {
        const collection = ['item1', 'item2', 'item3'];
        const task = async () => {
            throw new Error('test error');
        };
        let err;
        try {
            await the.any(collection, task);
        } catch (e) {
            err = e;
        }
        assert(err);
        assert(err instanceof Error);
    });

    it('should not error if last item resolves (edge case)', async () => {
        const collection = ['item1', 'item2', 'item3', 'item4'];
        const task = async (value, index) => {
            if (index === 3) {
                return 'hi';
            }
            throw new Error('test error');
        };

        const result = await the.any(collection, task);
        assert.strictEqual(result, true);
    });
});
