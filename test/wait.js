const assert = require('assert');
const the = require('../index');

describe('Wait test', function() {
    this.timeout(30000);

    it('should wait the correct amount of time', async () => {
        const minWait = 1000;
        const maxWait = 1050;
        const startTime = Date.now();
        await the.wait(1000);
        const endTime = Date.now();

        const actualWait = endTime - startTime;

        assert(minWait <= actualWait <= maxWait);
    });
});
