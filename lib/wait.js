/**
 * @file Promise based wait utility
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

/**
 * Wait
 * @param {Number} time Time in ms to wait before returning a resolved promise
 */
module.exports = async time => await new Promise(resolve => setTimeout(resolve, time || 1000));
