# Await The Promise

## NPM Options

### Testing

```bash
npm test
```

### Fix formatting

```bash
npm run format
```

### Build docs

This updates this README with the API.

```bash
npm run docs
```

## API Reference

## Modules

<dl>
<dt><a href="#module_mapValues">mapValues</a></dt>
<dd><p>Map Values</p>
</dd>
<dt><a href="#module_retry">retry</a></dt>
<dd><p>Retry</p>
</dd>
<dt><a href="#module_wait">wait</a></dt>
<dd><p>Wait</p>
</dd>
</dl>

<a name="module_mapValues"></a>

## mapValues
Map Values


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| obj | <code>Object</code> |  | key value pair to be iterated over |
| promise | <code>Promise</code> |  | promise to be await for each key, called with (value, key) |
| options | <code>object</code> |  |  |
| options.concurrency | <code>number</code> | <code>Infinity</code> | number of concurrently pending promises returned by mapper. |

**Example**  
```js
const result = await the.mapValues({key1: 'value1'}, async (value, key) => {
    return somePromise(value);
});
// result is now an object with {key1: <resolved promise> }
```
<a name="module_retry"></a>

## retry
Retry

**Todo**

- [ ] add support for functions as maxTries and interval


| Param | Type | Description |
| --- | --- | --- |
| promise | <code>Promise</code> | The promise to be resolved (or rejected) on the retry cadence |
| options | <code>Object</code> | Optional overrides for maxTries and interval |
| options.maxTries | <code>Number</code> | Max number of times to retry to promise |
| options.interval | <code>Number</code> | Time to wait in ms between promise executions |

**Example**  
```js
await the.retry(myPromise, { maxTries: 10, interval: 100 });
```
<a name="module_wait"></a>

## wait
Wait


| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | Time in ms to wait before returning a resolved promise |

