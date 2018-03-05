'use strict';

module.exports = (callback, err, result) => {
    if (callback) {
        return callback(err, result);
    }

    if (err) {
        throw new Error(err);
    }

    return result;
};
