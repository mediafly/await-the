# Await The Promise

[![Build Status](https://travis-ci.com/olono/await-the.svg?branch=master)](https://travis-ci.com/olono/await-the)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A utility which provides straight-forward, powerful functions for working with async/await in JavaScript.

+ [Installation](#installation)
+ [API Reference](#api-reference)
+ [Testing](#test)
+ [NPM Options](#npm-options)

## Installation

You can install into your Node.js project as a dependency with:

```bash
npm install await-the
```

## API Reference

## Modules

<dl>
<dt><a href="#module_Limiter">Limiter</a></dt>
<dd><p>Given a collection and a task return resolved values of the task being ran per value via the emitters</p>
</dd>
<dt><a href="#module_all">all</a> ⇒ <code>Array</code></dt>
<dd><p>Given a collection of functions, promises, or basic types &#39;run&#39; them all at a specified limit</p>
</dd>
<dt><a href="#module_any">any</a> ⇒ <code>Boolean</code></dt>
<dd><p>Given a collection and a task return true if any promise resolves</p>
</dd>
<dt><a href="#module_callback">callback</a></dt>
<dd><p>Utility for making optional callbacks easier. If an error param exists, it will throw an error for promises
or return the error to a callback.</p>
</dd>
<dt><a href="#module_deadline">deadline</a> ⇒ <code>Promise</code></dt>
<dd><p>Run the passed function, if it takes longer than the configured time throw an error, otherwise
return the results of the original function execution.</p>
<p>On timeout, this does NOT abort the execution of the function!</p>
</dd>
<dt><a href="#module_each">each</a></dt>
<dd><p>Given a collection, run the given asynchronous task in parallel for each value of the collection.</p>
</dd>
<dt><a href="#module_every">every</a> ⇒ <code>Boolean</code></dt>
<dd><p>Given a collection and a task return true if all promises resolve.
Will bail on first error</p>
</dd>
<dt><a href="#module_map">map</a> ⇒ <code>Array</code></dt>
<dd><p>Given a collection run a map over it</p>
</dd>
<dt><a href="#module_mapValues">mapValues</a> ⇒ <code>Object</code></dt>
<dd><p>Given an object of key-value pairs, run the given asynchronous task in parallel for each pair.</p>
</dd>
<dt><a href="#module_multiResult">multiResult</a> ⇒ <code>Array</code></dt>
<dd><p>Given a function that expects a callback as its last argument, await a promisified version of that function
and return the arguments sent to the callback as an array.</p>
</dd>
<dt><a href="#module_result">result</a> ⇒ <code>*</code></dt>
<dd><p>Given a function that expects a callback as its last argument, await a promisified version of that function
and return the result.</p>
</dd>
<dt><a href="#module_retry">retry</a> ⇒ <code>*</code></dt>
<dd><p>Retry promise a given number of times at an interval.</p>
</dd>
<dt><a href="#module_wait">wait</a> ⇒ <code>Promise</code></dt>
<dd><p>Promise based wait utility.</p>
</dd>
<dt><a href="#module_while">while</a> ⇒ <code>*</code></dt>
<dd><p>Given a condition and function, continuously call the promisified version of that function sequentially
and return the result once the exiting condition is met.</p>
<p>The <code>condition</code> can access either the parent scoped variables or the results of <code>fn</code> which are passed in
as the only parameter.</p>
</dd>
<dt><a href="#module_whileMax">whileMax</a> ⇒ <code>*</code></dt>
<dd><p>Given a condition, maximum amount of loop iterations to do, and function, continuously call the promisified
version of that function sequentially and return the result once the exiting condition is met or the loop
count has been exhausted.</p>
<p>The <code>condition</code> can access either the parent scoped variables or the results of <code>fn</code> which are passed in
as the only parameter.</p>
</dd>
</dl>

<a name="module_Limiter"></a>

## Limiter
Given a collection and a task return resolved values of the task being ran per value via the emitters


| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Array</code> \| <code>Object</code> | collection of data to be iterated over |
| task | <code>function</code> | The async function to be run on each value in the collection. |
| options | <code>Object</code> | Optional overrides. |
| options.limit | <code>Number</code> | Optional limit to # of tasks to run in parallel. |

**Example**  
```js
const the = require('await-the');
const functions = [
    async () => {
        await the.wait(1000);
        return 'waiter';
    },
    () => {
        return 'check please';
    }
];
const limiter = new the.Limiter(functions, { limit: 1 });

limiter.on('iteration', ({ key, resultValue }) => {
    // resultValue - value of function ran
    // key - key of collection the function was run for
});

limiter.on('done', () => {
    return done();
});

limiter.on('error', ({error}) => {
    // error - error when running functions
});

// begin iteration
limiter.start();
```
<a name="module_all"></a>

## all ⇒ <code>Array</code>
Given a collection of functions, promises, or basic types 'run' them all at a specified limit

**Returns**: <code>Array</code> - array of the resolved promises  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Array</code> \| <code>Object</code> | Array or object of items to run the asynchronous task with. |
| options | <code>Object</code> | Optional overrides. |
| options.limit | <code>Number</code> | Optional limit to # of tasks to run in parallel. |

**Example**  
```js
const the = require('await-the');
await the.all(
    [
        new Promise(resolve => resolve('hello')),
        'world',
        () => 'how are you?'
    ],
    { limit: 2 }
 );
```
<a name="module_any"></a>

## any ⇒ <code>Boolean</code>
Given a collection and a task return true if any promise resolves

**Returns**: <code>Boolean</code> - true if a promise resolves otherwise throws an error  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Array</code> \| <code>Object</code> | Array or object of items to run the asynchronous task over. |
| task | <code>function</code> | The async function to be run on each value in the collection. |

**Example**  
```js
const the = require('await-the')
const collection = ['item1', 'item2', 'item3'];
const task = async (value, index) => {
    if (index === 1) {
        return await new Promise(resolve => resolve());
    } else {
        throw new Error('test error');
    }
};
const result = await the.any(collection, task);
// result is true
```
<a name="module_callback"></a>

## callback
Utility for making optional callbacks easier. If an error param exists, it will throw an error for promises
or return the error to a callback.


| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | If present will invoke the callback with the err and result; otherwise, return or throw. |
| err | <code>Object</code> \| <code>String</code> \| <code>Number</code> \| <code>Boolean</code> | Error to throw or return to the caller. |
| result | <code>\*</code> | The thrown error or the result to return to the calling function. |

**Example**  
```js
const the = require('await-the');
const myFunc = async (args, callback) => {
    try {
        const result = await somePromise();
        return the.callback(callback, null, result);
    } catch (e) {
        return the.callback(callback, e.message);
    }
};

// call as a promise
await myFunc(args);
// or as a callback
myFunc(args, (err, result) => {});
```
<a name="module_deadline"></a>

## deadline ⇒ <code>Promise</code>
Run the passed function, if it takes longer than the configured time throw an error, otherwise
return the results of the original function execution.

On timeout, this does NOT abort the execution of the function!

**Returns**: <code>Promise</code> - A promise  

| Param | Type | Description |
| --- | --- | --- |
| task | <code>function</code> | The async function to be run. |
| time | <code>Number</code> | The time in milliseconds this function should be allowed to run. |
| error | <code>String</code> | Optionally, a custom error message to use. |

**Example**  
```js
const the = require('await-the');
await the.deadline(someAsyncFunction, 5000);
// will call `someAsyncFunction` and let it execute for 5000 ms, rejecting if it exceeds that time.
```
<a name="module_each"></a>

## each
Given a collection, run the given asynchronous task in parallel for each value of the collection.


| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Array</code> \| <code>Object</code> | Array or object of items to run the asynchronous task with. |
| task | <code>function</code> | The async function to be run on each value in the collection. |
| options | <code>Object</code> | Optional overrides. |
| options.limit | <code>Number</code> | Optional limit to # of tasks to run in parallel. |

**Example**  
```js
const the = require('await-the');
await the.each([1,2,3], someAsyncFunction, { limit: 2 });
// will call `someAsyncFunction` on each value of the collection, with at most two functions
// running in parallel at a time.
```
<a name="module_every"></a>

## every ⇒ <code>Boolean</code>
Given a collection and a task return true if all promises resolve.
Will bail on first error

**Returns**: <code>Boolean</code> - true if all promises resolve, otherwise throws the error from the first rejected promise it encounters  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| collection | <code>Array</code> \| <code>Object</code> |  | Array or object of items to run the asynchronous task over. |
| task | <code>function</code> |  | Promise to be awaited for each key, called with (value, key). |
| options | <code>Object</code> |  | Optional overrides. |
| options.limit | <code>Number</code> | <code>Infinity</code> | Number of concurrently pending promises returned by mapper. |

**Example**  
```js
const the = require('await-the')
const collection = ['item1', 'item2', 'item3'];
const task = async (value, index) => {
    return await new Promise(resolve => resolve());
};
const result = await the.every(collection, task);
// result is true
```
<a name="module_map"></a>

## map ⇒ <code>Array</code>
Given a collection run a map over it

**Returns**: <code>Array</code> - An array containing the results for each index  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| collection | <code>Array</code> |  | to iterate over |
| task | <code>Promise</code> |  | Promise to be await for each key, called with (value, key). |
| options | <code>Object</code> |  | Optional overrides. |
| options.limit | <code>Number</code> | <code>Infinity</code> | Number of concurrently pending promises returned by mapper. |

**Example**  
```js
const the = require('await-the');
const result = await the.map(['item1'], async (value, key) => {
    return somePromise(value);
});
// result is now an object with [<resolved promise>]
```
<a name="module_mapValues"></a>

## mapValues ⇒ <code>Object</code>
Given an object of key-value pairs, run the given asynchronous task in parallel for each pair.

**Returns**: <code>Object</code> - An object containing the results for each key.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| collection | <code>Object</code> |  | Key-value pair to be iterated over. |
| task | <code>Promise</code> |  | Promise to be await for each key, called with (value, key). |
| options | <code>Object</code> |  | Optional overrides. |
| options.limit | <code>Number</code> | <code>Infinity</code> | Number of concurrently pending promises returned by mapper. |

**Example**  
```js
const the = require('await-the');
const result = await the.mapValues({key1: 'value1'}, async (value, key) => {
    return somePromise(value);
});
// result is now an object with {key1: <resolved promise> }
```
<a name="module_multiResult"></a>

## multiResult ⇒ <code>Array</code>
Given a function that expects a callback as its last argument, await a promisified version of that function
and return the arguments sent to the callback as an array.

**Returns**: <code>Array</code> - The arguments sent to the callback, including the error.  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> \| <code>Array</code> | The async function to promisify and call, or an array of [class, method name]. |
| ...args | <code>\*</code> | Variadic arguments to send to the function, _excluding_ the callback.  Note that _all_ parameters of the function besides the callback must have values supplied, even if they're optional. |

**Example**  
```js
const the = require('await-the');
const asyncSum = (x, y, callback) => callback(null, x + y, x * y);
const [err, sum, product] = await the.multiResult(asyncSum, 1, 2);
// will assign null to `err`, 3 to `sum` and 2 to `product`.

await the.multiResult([someObj, 'someFnName'], 1, 2);
// equivalent of `await the.multiResult(someObj.someFnName.bind(someObj), 1, 2)`

const someFnWithOptionalArgs = (x, y = 1, opts = {}, callback) => callback(null, x + y);
await the.multiResult(someFnWithOptionalArgs, 2, 1, {});
// if the function has optional params before the callback, values must be supplied for all
```
<a name="module_result"></a>

## result ⇒ <code>\*</code>
Given a function that expects a callback as its last argument, await a promisified version of that function
and return the result.

**Returns**: <code>\*</code> - The thrown error or the result.  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> \| <code>Array</code> | The async function to promisify and call, or an array of [class, method name]. |
| ...args | <code>\*</code> | Variadic arguments to send to the function, _excluding_ the callback.  Note that _all_ parameters of the function besides the callback must have values supplied, even if they're optional. |

**Example**  
```js
const the = require('await-the');
const asyncSum = (x, y, callback) => callback(null, x + y);
const sum = await the.result(asyncSum, 1, 2);
// will assign 3 to `sum`

await the.result([someObj, 'someFnName'], 1, 2);
// equivalent of `await the.result(someObj.someFnName.bind(someObj), 1, 2)`

const someFnWithOptionalArgs = (x, y = 1, opts = {}, callback) => callback(null, x + y);
await the.result(someFnWithOptionalArgs, 2, 1, {});
// if the function has optional params before the callback, values must be supplied for all
```
<a name="module_retry"></a>

## retry ⇒ <code>\*</code>
Retry promise a given number of times at an interval.

**Returns**: <code>\*</code> - The last thrown error or the result.  

| Param | Type | Description |
| --- | --- | --- |
| promise | <code>Promise</code> | The promise to be resolved (or rejected) on the retry cadence. |
| options | <code>Object</code> | Optional overrides. |
| options.maxTries | <code>Number</code> | Maximum number of times to retry to promise. |
| options.interval | <code>Number</code> \| <code>function</code> | Time to wait in ms between promise executions. |
| options.errorFilter | <code>Any</code> \| <code>function</code> \| <code>Promise</code> | if supplied only retry if Any === error.message or function returns true |

**Example**  
```js
const the = require('await-the');
await the.retry(myPromise, { maxTries: 10, interval: 100 });
await the.retry(myPromise, { maxTries: 10, interval: numTriesSoFar => (numTriesSoFar * 100) });
await the.retry(myPromise, { maxTries: 10, interval: errorFilter: 'My Expected Error' });
await the.retry(myPromise, { maxTries: 10, interval: errorFilter: err => err.message === 'My Expected Error' });
```
<a name="module_wait"></a>

## wait ⇒ <code>Promise</code>
Promise based wait utility.


| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | Time in ms to wait before returning a resolved promise. |

**Example**  
```js
const the = require('await-the');
// wait for 1 second before returning
await the.wait(1000);
```
<a name="module_while"></a>

## while ⇒ <code>\*</code>
Given a condition and function, continuously call the promisified version of that function sequentially
and return the result once the exiting condition is met.

The `condition` can access either the parent scoped variables or the results of `fn` which are passed in
as the only parameter.

**Returns**: <code>\*</code> - The thrown error or the result.  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>function</code> | The condition to continue looping. |
| fn | <code>function</code> \| <code>Array</code> | The function to be resolved (or rejected) every loop. |
| ...args | <code>\*</code> | Variadic arguments to send to the function. |

**Example**  
```js
const the = require('await-the');
let sum = 0;
const condition = previousResult => sum < 10;
const asyncFn = x => {
    sum += x;
    return sum * 10;
}
const result = await the.while(condition, asyncFn, 2);
// will loop while sum < 10, then return the final function result
// sum === 10
// result === 100
```
<a name="module_whileMax"></a>

## whileMax ⇒ <code>\*</code>
Given a condition, maximum amount of loop iterations to do, and function, continuously call the promisified
version of that function sequentially and return the result once the exiting condition is met or the loop
count has been exhausted.

The `condition` can access either the parent scoped variables or the results of `fn` which are passed in
as the only parameter.

**Returns**: <code>\*</code> - The thrown error or the result.  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>function</code> | The condition to continue looping. |
| maxIterations | <code>Number</code> | The maximum amount of loop iterations to be done. |
| fn | <code>function</code> \| <code>Array</code> | The function to be resolved (or rejected) every loop. |
| ...args | <code>\*</code> | Variadic arguments to send to the function. |

**Example**  
```js
const the = require('await-the');
let sum = 0;
const max = 2;
const condition = previousResult => sum < 10;
const asyncFn = x => {
    sum += x;
    return sum * 10;
}
const result = await the.whileMax(condition, max, asyncFn, 2);
// is cut off by hitting the max loops possible
// sum === 4
// result === 40
```

## NPM Options

The different package NPM options.

### Test

Runs the linter and all Mocha tests in the `test` directory.

```bash
npm test
```

### Lint

Analyse code for potential errors and styling issues.

```bash
npm run lint
```

### Format

Fix issues found during linting.

```bash
npm run format
```

### Build documentation

Updates this README with the [API Reference](#api-reference).

```bash
npm run docs
```

