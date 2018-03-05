const callback = require('./lib/callback');

const pMapSeries = require('p-map-series');
const pMap = require('p-map');
const pAll = require('p-all');
const pAny = require('p-any');
const pEvery = require('p-every');
const pWhilst = require('p-whilst');
const pDoWhilst = require('p-do-whilst');
const pSeries = require('p-series');
const pEachSeries = require('p-each-series');
const pTimes = require('p-times');
const pWaterfall = require('p-waterfall');

exports.callback = callback;

exports.mapSeries = pMapSeries;
exports.map = pMap;

exports.all = pAll;
exports.end = pAll;

exports.any = pAny;
exports.start = pAny;

exports.every = pEvery;

exports.whilst = pWhilst;
exports.doWhilst = pDoWhilst;

exports.each = pSeries;
exports.eachSeries = pEachSeries;

exports.times = pTimes;

exports.waterfall = pWaterfall;
