const assert = require('assert');
const the = require('../index');

describe('all test', function() {
    this.timeout(30000);

    it('should resolve all types', async () => {
        const result = await the.all([
            new Promise(resolve => resolve('hello')),
            'world',
            () => 'how are you?',
            null
        ]);

        assert.deepStrictEqual(result, ['hello', 'world', 'how are you?', null]);
    });

    it('should run in series if the limit is 1', async () => {
        const collection = [
            async () => {
                await the.wait(500);
                return `hello`;
            },
            'item2',
            'item3'
        ];

        const output = await the.all(collection, { limit: 1 });
        assert.deepStrictEqual(output, ['hello', 'item2', 'item3']);
    });

    it('should run in parallel if the limit greater than 1', async () => {
        const collection = [
            async () => {
                await the.wait(600);
                return `world`;
            },
            async () => {
                await the.wait(500);
                return `hello`;
            },
            async () => {
                await the.wait(700);
                return `how are you?`;
            }
        ];

        const start = Date.now();
        const output = await the.all(collection, { limit: 3 });
        const duration = Date.now() - start;
        assert(duration < 800, 'Expected promises to run in parallel');
        assert.deepStrictEqual(output, ['world', 'hello', 'how are you?']);
    });

    it('should support objects', async () => {
        const result = await the.all({
            item1: new Promise(resolve => resolve('hello')),
            item2: 'world',
            item3: () => 'how are you?'
        });

        assert.deepStrictEqual(result, ['hello', 'world', 'how are you?']);
    });
});
