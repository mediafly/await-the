/**
 * @file await-the main interface
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const all = require('./lib/all');
const any = require('./lib/any');
const callback = require('./lib/callback');
const deadline = require('./lib/deadline');
const doWhilst = require('p-do-whilst');
const each = require('./lib/each');
const every = require('./lib/every');
const Limiter = require('./lib/Limiter');
const map = require('./lib/map');
const mapValues = require('./lib/mapValues');
const result = require('./lib/result');
const multiResult = require('./lib/multiResult');
const retry = require('./lib/retry');
const awaitWhile = require('./lib/while');
const times = require('p-times');
const wait = require('./lib/wait');
const waterfall = require('p-waterfall');
const whilst = require('p-whilst');

module.exports = {
    all,
    any,
    callback,
    deadline,
    doWhilst,
    each,
    end: all,
    every,
    Limiter,
    map,
    mapValues,
    result,
    multiResult,
    retry,
    some: any,
    times,
    wait,
    waterfall,
    whilst,
    while: awaitWhile
};
