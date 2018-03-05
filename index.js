/**
 * @file await-the main interface
 * @copyright Copyright (c) 2018 Olono, Inc.
 */

'use strict';

const all = require('p-all');
const any = require('p-any');
const callback = require('./lib/callback');
const doWhilst = require('p-do-whilst');
const each = require('p-series');
const eachSeries = require('p-each-series');
const every = require('p-every');
const map = require('p-map');
const mapSeries = require('p-map-series');
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
    eachSeries,
    end: all,
    every,
    map,
    mapSeries,
    retry,
    start: any,
    times,
    wait,
    waterfall,
    whilst
};
