# await-the

Example:

```
const the = require('await-the');
const words = ['hello', 'world'];

const stutter = async word => { return word + '-' + word };

const speak = async (words) => { 
	let s = await the.mapSeries(words, stutter);
	console.log(s); 
}
speak(words);
> [ 'hello-hello', 'world-world' ]
```
