/**
 * @file Promise based wait utility
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

/**
 * Promise based wait utility.
 *
 * @module wait
 * @example
 * const the = require('await-the');
 * // wait for 1 second before returning
 * await the.wait(1000);
 *
 * @param {Number} time Time in ms to wait before returning a resolved promise.
 * @returns {Promise}
 */
module.exports = async time => await new Promise(resolve => setTimeout(resolve, time || 1000));
