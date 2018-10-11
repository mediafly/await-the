const assert = require('assert');
const the = require('../index');

describe('Callback test', function() {
    this.timeout(30000);

    it('should callback', done => {
        const callbackFunc = async callback => {
            return await the.callback(callback, null, 123);
        };

        callbackFunc((err, res) => {
            assert.strictEqual(res, 123);
            return done();
        });
    });

    it('should callback with error', done => {
        const callbackFunc = async callback => {
            return await the.callback(callback, 'Error!');
        };

        callbackFunc(err => {
            assert.strictEqual(err, 'Error!');
            return done();
        });
    });

    it('should return results', async () => {
        const callbackFunc = async callback => {
            return await the.callback(callback, null, 123);
        };

        const res = await callbackFunc();

        assert.strictEqual(res, 123);
    });

    it('should throw error', async () => {
        const callbackFunc = async callback => {
            return await the.callback(callback, 'Error!');
        };

        let error;
        try {
            await callbackFunc();
        } catch (e) {
            error = e;
        }

        assert.strictEqual(error.message, 'Error!');
    });
});
