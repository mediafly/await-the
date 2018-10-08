'use strict';

const the = require('../index');
const assert = require('assert');

describe('Map test', function() {
    this.timeout(5000);

    it('should run in series if the limit is 1', async () => {
        const collection = ['item1', 'item2', 'item3'];
        const task = async (value, key) => {
            await the.wait(500);
            return `${value}${key}`;
        };

        const start = Date.now();
        const output = await the.map(collection, task, { limit: 1 });
        const duration = Date.now() - start;
        assert(duration >= 1500, 'Expected promises to run in series');
        assert.deepStrictEqual(output, ['item10', 'item21', 'item32']);
    });

    it('should run in parallel if the limit greater than 1', async () => {
        const collection = ['item1', 'item2', 'item3'];
        const task = async (value, key) => {
            await the.wait(500);
            return `${value}${key}`;
        };

        const start = Date.now();
        const output = await the.map(collection, task, { limit: 2 });
        const duration = Date.now() - start;
        assert(duration < 1500, 'Expected promises to run in parallel');
        assert.deepStrictEqual(output, ['item10', 'item21', 'item32']);
    });

    it('should run in parallel if the limit is undefined', async () => {
        const collection = ['item1', 'item2', 'item3'];
        const task = async (value, key) => {
            await the.wait(500);
            return `${value}${key}`;
        };

        const start = Date.now();
        const output = await the.map(collection, task);
        const duration = Date.now() - start;
        assert(duration < 1000, 'Expected promises to run in parallel');
        assert.deepStrictEqual(output, ['item10', 'item21', 'item32']);
    });

    it('should be able to map an object', async () => {
        const collection = { 'item-1': 'item1', 'item-2': 'item2', 'item-3': 'item3' };
        const task = async (value, key) => {
            await the.wait(500);
            return `${value}${key}`;
        };

        const output = await the.map(collection, task);
        assert.deepStrictEqual(output, ['item1item-1', 'item2item-2', 'item3item-3']);
    });

    it('should bail on error for series', async () => {
        let totalRan = 0;
        const collection = ['item1', 'item2', 'item3'];
        const task = async (value, key) => {
            totalRan++;
            await the.wait(500);
            if (key === 1) {
                throw Error('Number 1!');
            }
            return `${value}${key}`;
        };

        try {
            await the.map(collection, task, { limit: 1 });
        } catch (e) {
            assert.strictEqual(e.message, 'Number 1!');
        }

        assert.strictEqual(totalRan, 2);
    });
});
