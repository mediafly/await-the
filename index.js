/**
 * @file await-the main interface
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const all = require('p-all');
const any = require('p-any');
const callback = require('./lib/callback');
const doWhilst = require('p-do-whilst');
const each = require('./lib/each');
const every = require('p-every');
const Limiter = require('./lib/Limiter');
const map = require('./lib/map');
const mapValues = require('./lib/mapValues');
const result = require('./lib/result');
const retry = require('./lib/retry');
const times = require('p-times');
const wait = require('./lib/wait');
const waterfall = require('p-waterfall');
const whilst = require('p-whilst');

module.exports = {
    all,
    any,
    callback,
    doWhilst,
    each,
    end: all,
    every,
    Limiter,
    map,
    mapValues,
    result,
    retry,
    start: any,
    times,
    wait,
    waterfall,
    whilst
};
