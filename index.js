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
const eachSeries = require('p-each-series');
const every = require('p-every');
const map = require('p-map');
const mapSeries = require('p-map-series');
const mapValues = require('./lib/mapValues');
const result = require('./lib/result');
const retry = require('./lib/retry');
const times = require('p-times');
const wait = require('./lib/wait');
const waterfall = require('p-waterfall');
const whilst = require('p-whilst');
console.log('the token', process.env.AUTH_TOKEN)

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
    mapValues,
    result,
    retry,
    start: any,
    times,
    wait,
    waterfall,
    whilst
};
