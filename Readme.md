# dictionary.flow
[![travis][travis.icon]][travis.url]
[![package][version.icon] ![downloads][downloads.icon]][package.url]
[![styled with prettier][prettier.icon]][prettier.url]

Library provides APIs to work with typed mutable dictionaries, where dictionary has a following type signature. Note that unlike [Objects as maps][] in flow definition below forces user to unsure dictionary contains value rather than making that a runtime error: 

```flow
type Dict <a> = {[string]: ?a}
```

Library assumes that passed dictionaries do not have a prototype chain to be concerned with, so either they are construct by the library functions or via `Object.create(null)`. If you use plain objects like `{}` or instances of some class expect issues with name collisions with inherited properties like `toString` and what not.

### Warning on mutability

Library intentionally provides functional interface where it takes in dictionary & other params and returns a dictionary, it may seem that new dictionary is returned, but it is important to be aware that passed dictionary is mutated in place and is returned returned back.

A seen in the examples it is recomended to use only returned dictionary and treat dictionary passed in as inaccessible. If you use it library as such you'll be able to avoid most of the pitfalls with mutablity and possibly use immutable verison of this library as a drop in replacement. Maybe I just really wish flow had a [owneship system][] like Rust :)

## API

#### `empty: <a> () => Dict<a>`

Function creates an empty dictionary.

```js
const v0 = Dictionary.empty()
v0 // => ({}:Dict <*>)
const v1 = Dictionary.set('Jack', 1, v0)
v1 // => ({"Jack": 1}: Dict <number>)
const v2 = Dictionary.set('Jane', 'Jane', v1)
v2 // => ({"Jack": 1, "Jane": "Jane"}:Dict<number|string>)
```

Notice that type of values dictionary holds is open and get's extended based
on usage, this is actualy very useful in practice. That being said sometimes
you'd want to put bounds to what dictionary holds ahead you could do it in
multiple ways:

##### Anotate binding

```js
const v3:Dict<number> = empty()
v3 // => ({}:Dict<number>)
const v4 = set('Jack', 1, v3)
v4 // => ({"Jack": 1}:Dict<number>)
const v5 = set('Jane', 'Jane', v4)
//!                    ^ string. This type is incompatible with the expected param type of
//! const v3:Dict<number> = empty()
//!               ^ number
```

##### Enclose in typed function

```js
const enumerate = (...keys:string[]):Dict<number> => {
  let dict = empty()
  let index = 0
  for (let key of keys) {
    dict = set(key, index++, dict)
  }
  return dict
}
```

#### `singleton: <a> (string, a) => Dict<a>`

Creates a dictionary with only one entry for given key, value pair.

```js
Dictionary.singleton('Zoe', 15) // => ({Zoe: 15}:Dict<number>)
Dictionary.singleton('a', {foo:"bar"}) // => ({a: {foo:"bar"}}:Dict<{foo:string}>)
```

Note that as with `empty` returned dictionary has open type for values.

#### `fromEntries: <a>(Iterable<[string, a]>) => Dict<a>`

Create a dictionary from iterable of `[key, value]` pairs.

```js
Dictionary.fromEntries([
   ['Zoe', 17],
   ['Sandro', 18]
]) // => ({Zoe: 17, Sandro: 18}:Dict<number>)

Dictionary
 .fromEntries((db:Map<string, User>)).entries()) // => ({...}:Dict<User>)
```

#### `set: <a> (string, a, Dict<a>) => Dict<a>`

Insert an entry under the given key with a gievn value into a dictionary.
Replaces value of the entry if there was one under that key.

```js
const v0 = Dictionary.fromEntries([["a", 1]])
v0 // => ({a:1}:Dict<number>)

// Add
const v1 = Dictionary.set("b", 2, v0)
v1 // => ({a:1, b:2}:Dict<number>)

// Replace
const v2 = Dictionary.set("b", 15, v1)
v2 // => ({a:1, b:15}:Dict<number>)
```

#### `update: <a>(string, ?a => ?a, Dict<a>) => Dict<a>`

Updates the entry in the dictionary for a given key with a provided function. If function returns `null|void` entry is removed from the dictionory otherwise it's value is swapped with return value. If entry for the key does not exist function is passed `void` and if it returns value different from `null|void` it will be inserted with the given key into a dictionary.

```js
const v0 = Dictionary.fromEntries([["a", 1], ["b", 2]])
v0 // => ({a:1, b:2}:Dict<number>)

const inc = (v:?number):number => v == null ? 0 : v + 1

const v1 = Dictionary.update("c", inc, v0)
v1 // => ({a:1, b:2, c:0}:Dict<number>)

// Modify
const v2 = Dictionary.update("b", inc, v1)
v2 // => ({a:1, b:3, c:0}:Dict<number>)

// Delete
const v3 = Dictionary.update("b", _ => null, v2)
v3 // => ({a:1, c:0}:Dict<number>)

const v4 = Dictionary.update("c", _ => undefined, v3)
v4 // => ({a:1}:Dict<number>)

// NoOp
const v5 = Dictionary.update("d", _ => null, v4)
v5 // => ({a: 1}:Dict<number>)

```

#### `remove: <a> (string, Dict<a>) => Dict<a>`

Remove an entry for the given key from a dictionary. If there is no entry
for the given key no changes are made.

```js
const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
before // => ({a: 1, b:2}:Dict<number>)
const after = Dictionary.remove("a", before)
after // => ({b:2}:Dict<number>)
Dictionary.remove("c", after) // => ({b:2}:Dict<number>)
```

#### `has: <a> (string, Dict<a>) => boolean`

Determine if there is an entry with a given key is in a dictionary.

```js
const dict = Dictionary.singleton("a", 1)

Dictionary.has("a", dict) // => true
Dictionary.has("b", dict) // => false
```

#### `get: <a>(string, Dict<a>, a) => a`

Returns value for the give key in the given dictionary or a default passed-in as
a third argument if dictionary has no entry for the give key.

```js
const animals = Dictionary.fromEntries([["Tom", "Cat"], ["Jerry", "Mouse"]])

Dictionary.get("Jerry", animals) // => ("Mouse":string|void)
Dictionary.get("Tom", animals, null) // => ("Cat":string|null)
Dictionary.get("Tom", animals, "") // => ("Cat":string)
Dictionary.get("Spike", animals, null) // => (null:string|null)
Dictionary.get("Spike", animals, "") // => ("":string|null)
```

#### `entries: <a>(Dict<a>) => Iterable<[string, a]>`

Returns an iterable of dictionary entries, that can be iterated as `[key, value]` pairs using `for of`

```js
const dict = Dictionary.singleton('Car', {color:'blue'})
for (let [key, value] of Dictionary.entries(dict)) {
  // ...
}
```

#### `keys: <a>(Dict<a>) => Iterable<string>`

Returns an iterable of dictionary keys that can be iterated over using `for of`

```js
const dict = Dictionary.singleton('Bicycle', {color:'red'})
for (let key of Dictionary.keys(dict)) {
    // ...
}
```

#### `values: <a>(Dict<a>) => Iterable<a>`

Returns an iterable of dictionary values that can be iterated over using `for of`

```js
const dict = Dictionary.singleton('Horse', {color:'black'})
for (let value of Dictionary.values(dict)) {
  // ...
}
```

#### `map: <a, b>(([string, a]) => [string, b], Dict<a>) => Dict<b>`

```js
const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
before // => ({a: 1, b: 2}:Dict<number>)

const after = Dictionary.map(([k, v]) => [k.toUpperCase(), String(v + 5)], before)
after // => ({A:"6", B:"7"}:Dict<string>)
```

#### `filter: <a> (([string, a] => boolean, Dict<a>) => Dict<a>`

Keep a dictionary entries that satisfy provided predicate.

```js
const before = Dictionary.fromEntries([["a", -1], ["b", 2]])
before // => ({a: -1, b: 2}:Dict<number>)

const after = Dictionary.filter(([_k, v]) => v > 0, before)
after // => ({b: 2}:Dict<number>)
```

#### `partition: <a> (([string, a]) => boolean, Dict<a>) => [Dict<a>, Dict<a>]`

Partition a dictionary according to a predicate. The first dictionary contains all entries which satisfy the predicate, and the second contains the rest.

```js
const all = Dictionary.fromEntries([["a", -1], ["b", 2]])
all // => ({a: -1, b: 2}:Dict<number>)

const [positive, negative] = Dictionary.partition(([_k, v]) => v > 0, all)
positive // => ({b: 2}:Dict<number>)
negative // => ({a: -1}:Dict<number>)
```

#### `union: <a>(Dict<a>, Dict<a>) => Dict<a>`

Combine two dictionaries. If there is a collision, preference is given to the first dictionary.

```js
const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
left // => ({a:1, b:2}:Dict<number>)

const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
right // => ({b:18, c:9}:Dict<number>)
 
const union = Dictionary.union(left, right)
union // => ({a:1, b:2, c:9}:Dict<number>)
```

#### `intersect: <a> (Dict<a>, Dict<a>) => Dict<a>`

Keep a entries from left dictionary when right dictionary has entries for the same key.

```js
const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
left // => ({a:1, b:2}:Dict<number>)

const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
right // => ({b:18, c:9}:Dict<number>)

const intersect = Dictionary.intersect(left, right)
intersect // => ({b:2}:Dict<number>)
```

#### `diff: <a> (Dict<a>, Dict<a>) => Dict<a>`

Keep a entries from left dictionary only if right dictionary does not have
entry for that key.

```js
const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
left // => ({a:1, b:2}:Dict<number>)
const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
right // => ({b:18, c:9}:Dict<number>)
const delta = Dictionary.diff(left, right)
delta // => ({a:1}:Dict<number>)
```

#### `merge: <a, b, r> (([string, a]) => r, ([string, [a, b]]) => r, ([string, b]) => r, Dict<a>, Dict<b>, r) => r`

The most general way of combining two dictionaries. You provide three accumulators for when a given key appears:

- Only in the left dictionary.
- In both dictionaries.
- Only in the right dictionary.

Merge then will traverse all the keys from both both dicitionaries, building up whatever your accumulators accumulate.

```js
Dictionary.merge(
  ([key, left], log):string[] =>
    [...log, `- ${key} : ${left}`],
  ([key, [left, right]], log):string[] =>
    [...log, `= ${key} : ${left} -> ${right}`],
  ([key, right], log):string[] =>
    [...log, `+ ${key} : ${right}`],
  Dictionary.fromEntries([["a", 1], ["b", 2]]),
  Dictionary.fromEntries([["b", 18], ["c", 9]]),
  []
) // => ['- a : 1', '= b : 2 -> 18', '+ c : 9']
```

**Plase note:** Flow seems to have bug that causes it's [inference to enter pathological path][flow chokes] when `merge` is given accumulators that are not type annotated causing it to never finish type cheking, so until [this bug][flow chokes] is fixed please annotate your accumulators.

## Install

### yarn

    yarn add --save dictionary.flow

### npm

    npm install --save dictionary.flow


## Prior Art

API of this library mostly follows the API of the [Dict][Dict Elm] module from
[Elm][] core library.

[Objects as maps]:https://flow.org/en/docs/types/objects/#toc-objects-as-maps
[flow chokes]:https://github.com/facebook/flow/issues/4370

[ownership system]:https://doc.rust-lang.org/book/ownership.html
[Dict Elm]:http://package.elm-lang.org/packages/elm-lang/core/latest/Dict
[Elm]:http://elm-lang.org/

[travis.icon]: https://travis-ci.org/Gozala/dictionary.flow.svg?branch=master
[travis.url]: https://travis-ci.org/Gozala/dictionary.flow

[version.icon]: https://img.shields.io/npm/v/dictionary.flow.svg
[downloads.icon]: https://img.shields.io/npm/dm/dictionary.flow.svg
[package.url]: https://npmjs.org/package/dictionary.flow


[downloads.image]: https://img.shields.io/npm/dm/dictionary.flow.svg
[downloads.url]: https://npmjs.org/package/dictionary.flow

[prettier.icon]:https://img.shields.io/badge/styled_with-prettier-ff69b4.svg
[prettier.url]:https://github.com/prettier/prettier