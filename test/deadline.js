const assert = require('assert');

const the = require('../index');

describe('deadline test', function() {
    this.timeout(30000);

    it('should resolve the task if it executes under the time limit', async () => {
        const task = async () => {
            await the.wait(1000);
            return 'success';
        };

        let result, error;
        try {
            result = await the.deadline(task, 5000);
        } catch (err) {
            error = err;
        }

        assert(!error, `Expected the Promise to not be rejected, got ${error}`);
        assert.equal(result, 'success', `Expected the Promise to be resolved, but got ${result}`);
    });

    it('should reject the Promise if it executes over the time limit', async () => {
        const task = async () => {
            await the.wait(5000);
            return 'success';
        };

        let error;
        try {
            await the.deadline(task, 1000);
        } catch (err) {
            error = err;
        }

        assert(!!error, `Expected the Promise to be rejected`);
    });

    it('should work with Promises rather than async/await', done => {
        const task = function() {
            return new Promise(resolve => {
                setTimeout(resolve, 1000, 'success');
            });
        };

        let result, error;
        the.deadline(task, 5000)
            .then(
                r => {
                    result = r;
                },
                err => {
                    error = err;
                }
            )
            .then(() => {
                assert(!error, `Expected the Promise to not be rejected, got ${error}`);
                assert.equal(result, 'success', `Expected the Promise to be resolved, but got ${result}`);
            })
            .then(done);
    });
});
