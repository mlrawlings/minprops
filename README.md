# minprops

Normally, a JavaScript minifier will not minify object properties, because they may be used elsewhere, in files other than the one in which they are defined.  Minify allows you to write descriptive property names and safely minify them for production builds.

## Example

### Without `minprops`:

___foo.js___
```js
class Foo {
  callTheFunctionWithTheArgsThatWerePassed(fn, ...args) {
    return fn(...args);
  }
}

module.exports = Foo;
```

___index.js___
```js
const Foo = require('./foo');

Foo.callTheFunctionWithTheArgsThatWerePassed((num1, num2) => num1 + num2, 1, 2);
```

⭆⭆⭆ _MINIFY!_ ⇒⇒⇒

___foo.min.js___
```js
class a {
  callTheFunctionWithTheArgsThatWerePassed(b, ...c) {
    return b(...c);
  }
}

module.exports = a;
```


___index.min.js___
```js
const a = require('./foo');

a.callTheFunctionWithTheArgsThatWerePassed((b, c) => b + c, 1, 2);
```


### _With_ `minprops`:

Use `$__` to notate properties that are private to the package and can be safely renamed.

___foo.js___
```js
class Foo {
  $__callTheFunctionWithTheArgsThatWerePassed(fn, ...args) {
    return fn(...args);
  }
}

module.exports = Foo;
```

___index.js___
```js
const Foo = require('./foo');

Foo.$__callTheFunctionWithTheArgsThatWerePassed((num1, num2) => num1 + num2, 1, 2);
```

⭆⭆⭆ MINIFY! ⇒⇒⇒

___foo.min.js___
```js
class a {
  a(b, ...c) {
    return b(...c);
  }
}

module.exports = a;
```


___index.min.js___
```js
const a = require('./foo');

a.a((b, c) => b + c, 1, 2);
```

## Options

Options can be specified in a `minprops` property in your `package.json`

```js
{
  ...
  "minprops": {
    "exclude": [
      "id"
    ],
    "matchPrefix": "$__"
  }
  ...
}
```

- `exclude`: List an array of properties to _not_ minify to.  Use this if your package has properties that are two characters or less.
- `matchPrefix`: Use a custom prefix. Defaults to `$__`.
