const assert = require('assert');
const the = require('../index');

describe('While test', function() {
    this.timeout(30000);

    it('should correctly iterate and exit based on the condition', async () => {
        let sum = 0;
        const condition = () => sum < 10;
        const asyncSum = x => {
            return new Promise(resolve => {
                sum = sum + x;
                resolve(sum * 10);
            });
        };
        const result = await the.whileMax(condition, Infinity, asyncSum, 2);
        assert.strictEqual(sum, 10);
        assert.strictEqual(result, 100);
    });

    it('should correctly iterate and exit based on the max loops being hit', async () => {
        let sum = 0;
        const max = 2;
        const condition = () => sum < 10;
        const asyncSum = x => {
            return new Promise(resolve => {
                sum = sum + x;
                resolve(sum * 10);
            });
        };
        const result = await the.whileMax(condition, max, asyncSum, 2);
        assert.strictEqual(sum, 4);
        assert.strictEqual(result, 40);
    });

    it('should correctly iterate and exit based on the previous result passed into the condition', async () => {
        let count = 0;
        const condition = previousResult => {
            return !previousResult || previousResult < 10;
        };
        const asyncSum = () => {
            return new Promise(resolve => {
                count = count + 1;
                resolve(count);
            });
        };
        const result = await the.whileMax(condition, Infinity, asyncSum);
        assert.strictEqual(count, 10);
        assert.strictEqual(result, 10);
    });

    it('should correctly test multiple args', async () => {
        let sum = 0;
        const condition = () => sum < 10;
        const asyncSum = (x, y) => {
            return new Promise(resolve => {
                sum = x + y;
                resolve(sum);
            });
        };
        const result = await the.whileMax(condition, Infinity, asyncSum, 10, 5);
        assert.strictEqual(sum, 15);
        assert.strictEqual(result, 15);
    });

    it('should correctly test async conditions.', async () => {
        let sum = 0;
        const condition = async () => await false;
        const asyncSum = (x, y) => {
            return new Promise(resolve => {
                sum = x + y;
                resolve(sum);
            });
        };
        const result = await the.whileMax(condition, Infinity, asyncSum, 10, 5);
        assert.strictEqual(sum, 0);
        assert.strictEqual(result, undefined);
    });

    it('should correctly test promisified conditions.', async () => {
        let sum = 0;
        const condition = () => new Promise(resolve => resolve(false));
        const asyncSum = (x, y) => {
            return new Promise(resolve => {
                sum = x + y;
                resolve(sum);
            });
        };
        const result = await the.whileMax(condition, Infinity, asyncSum, 10, 5);
        assert.strictEqual(sum, 0);
        assert.strictEqual(result, undefined);
    });

    it('should fail on rejected promises', async () => {
        let errorMessage = 'Fail test';
        try {
            await the.whileMax(
                () => true,
                Infinity,
                () => {
                    return new Promise((resolve, reject) => {
                        reject(new Error(errorMessage));
                    });
                }
            );
            assert(false, 'should never get here');
        } catch (error) {
            assert(error);
            assert.strictEqual(error.message, errorMessage);
        }
    });

    it('should fail on thrown errors', async () => {
        let errorMessage = 'Fail test';
        try {
            await the.whileMax(
                () => true,
                Infinity,
                () => {
                    throw new Error(errorMessage);
                }
            );
            assert(false, 'should never get here');
        } catch (error) {
            assert(error);
            assert.strictEqual(error.message, errorMessage);
        }
    });

    it('should fail on NaN max iterations', async () => {
        const nanValues = [undefined, 'string', {}, [1, 2, 3]];

        for (const value of nanValues) {
            try {
                await the.whileMax(
                    () => true,
                    value,
                    () => {
                        throw new Error('Should not get to the condition');
                    }
                );
                assert(false, 'should never get here');
            } catch (error) {
                assert(error);
                assert.strictEqual(error.message, `The max iterations is not a number: ${value}`);
            }
        }
    });

    it('should fail on being less than 1 max iterations', async () => {
        const invalidValues = [0, -1, -0.5, null, '', []];

        for (const value of invalidValues) {
            try {
                await the.whileMax(
                    () => true,
                    value,
                    () => {
                        throw new Error('Should not get to the condition');
                    }
                );
                assert(false, 'should never get here');
            } catch (error) {
                assert(error);
                assert(
                    error.message.includes('The whileMax function was started with an invalid max iterations')
                );
            }
        }
    });
});
