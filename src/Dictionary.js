/* @flow */

import type { Maybe } from "maybe.flow"

/**
 * Library provides APIs to work with a dictionary mapping of unique string
 * keys to values.
 */

/**
 * Dictionary of keys and values. `Dict<User>` is a dictionary that lets
 * you look up a `User` by a `string` key (such as user names).
 */
export type Dict<a> = {
  [key: string]: Maybe<a>,
  // `value?` property is here to workaround a bug in flow. For details see:
  // https://github.com/facebook/flow/issues/4371
  value?: a
}

/**
 * Dictionary class used across the library to create `Dict` instances.
 */
const Dictionary: Class<Dictionary> = function Dictionary(): void {}
Dictionary.prototype = Object.freeze(Object.create(null))

/**
 * Creates an empty dictionary.
 *
 * ```js
 * const v0 = Dictionary.empty()
 * v0 // => ({}:Dict<*>)
 * const v1 = Dictionary.set('Jack', 1, v0)
 * v1 // => ({"Jack": 1}:Dict<number>)
 * const v2 = Dictionary.set('Jane', 'Jane', v1)
 * v2 // => ({"Jack": 1, "Jane": "Jane"}:Dict<number|string>)
 * ```
 *
 * Notice that type of values dictionary holds is open and get's extended based
 * on usage, this is actualy very useful in practice. That being said sometimes
 * you'd want to put bounds to what dictionary holds ahead you could do it in
 * multiple ways:
 * 
 * ##### Anotate binding
 * 
 * ```js
 * const v3:Dict<number> = Dictionary.empty()
 * v3 // => ({}:Dict<number>)
 * const v4 = Dictionary.set('Jack', 1, v3)
 * v4 // => ({"Jack": 1}:Dict<number>)
 * const v5 = Dictionary.set('Jane', 'Jane', v1)
 * ```
 * 
 * ##### Enclose in typed function
 * ```js
 * const enumerate = (...keys:string[]):Dict<number> => {
 *   let dict = empty()
 *   let index = 0
 *   for (let key of keys) {
 *     dict = set(key, index++, dict)
 *   }
 *   return dict
 * }
 * ```
 */
export const empty = <a>(): Dict<a> => new Dictionary()

/**
 * Create a dictionary with one entry of given key, value pair.
 *
 * ```js
 * Dictionary.singleton('Zoe', 15) // => ({Zoe: 15}:Dict<number>)
 * Dictionary.singleton('a', {foo:"bar"}) // => ({a: {foo:"bar"}}:Dict<{foo:string}>)
 * ```
 * 
 * Note that as with `empty` returned dictionary has open type for values.
 */
export const singleton = <a>(key: string, value: a): Dict<a> => {
  const result = new Dictionary()
  result[key] = value
  return result
}

/**
 * Create a dictionary from iterable of `[key, value]` pairs
 *
 * ```js
 * Dictionary.fromEntries([
 *    ['Zoe', 17],
 *    ['Sandro', 18]
 * ]) // => ({Zoe: 17, Sandro: 18}:Dict<number>)
 *
 * Dictionary
 *  .fromEntries((db:Map<string, User>)).entries()) // => ({...}:Dict<User>)
 * ```
 */
export const fromEntries = <a>(entries: Iterable<Entry<a>>): Dict<a> => {
  let result = empty()
  for (let [key, value] of entries) {
    result[key] = value
  }
  return result
}

/**
 * Insert an entry under the given key with a gievn value into a dictionary.
 * Replaces value of the entry if there was one under that key.
 *
 * ```js
 * const v0 = Dictionary.fromEntries([["a", 1]])
 * v0 // => ({a:1}:Dict<number>)
 *
 * // Add
 * const v1 = Dictionary.set("b", 2, v0)
 * v1 // => ({a:1, b:2}:Dict<number>)
 *
 * // Replace
 * const v2 = Dictionary.set("b", 15, v1)
 * v2 // => ({a:1, b:15}:Dict<number>)
 * ```
 */
export const set = <a>(key: string, value: a, dict: Dict<a>): Dict<a> => (
  (dict[key] = value),
  dict
)

type Updater<a> = Mapper<Maybe<a>, Maybe<a>>

/**
 * Updates the entry in the dictionary for a given key with a provided
 * `updater` function. If updader returns `Maybe.nothing` entry is
 * removed from the dictionory otherwise it's value is swapped with
 * returned value.
 *
 * ```js
 * const v0 = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * v0 // => ({a:1, b:2}:Dict<number>)
 *
 * const inc = (v: ?number): ?number => (v == null ? 0 : v + 1)
 *
 * // Add
 * const v1 = Dictionary.update("c", inc, v0)
 * v1 // => ({a:1, b:2, c:0}:Dict<number>)
 *
 * // Modify
 * const v2 = Dictionary.update("b", inc, v1)
 * v2 // => ({a:1, b:3, c:0}:Dict<number>)
 *
 * // Delete
 * const v3 = Dictionary.update("b", _ => null, v2)
 * v3 // => ({a:1, c:0}:Dict<number>)
 *
 * const v4 = Dictionary.update("c", _ => undefined, v3)
 * v4 // => ({a:1}:Dict<number>)
 *
 * // NoOp
 * const v5 = Dictionary.update("d", _ => null, v4)
 * v5 // => ({a: 1}:Dict<number>)
 * ```
 */
export const update = <a>(
  key: string,
  updater: Updater<a>,
  dict: Dict<a>
): Dict<a> => {
  const value = updater(dict[key])
  if (value == null) {
    delete dict[key]
    return dict
  } else {
    dict[key] = value
    return dict
  }
}

/**
 * Remove an entry for the given key from a dictionary. If there is no entry
 * for the given key no changes are made.
 *
 * ```js
 * const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * before // => ({a: 1, b:2}:Dict<number>)
 * const after = Dictionary.remove("a", before)
 * after // => ({b:2}:Dict<number>)
 * Dictionary.remove("c", after) // => ({b:2}:Dict<number>)
 * ```
 */
export const remove = <a>(key: string, dict: Dict<a>): Dict<a> => (
  delete dict[key],
  dict
)

/**
 * Determine if there is an entry with a given key is in a dictionary.
 *
 * ```js
 * const dict = Dictionary.singleton("a", 1)
 *
 * Dictionary.has("a", dict) // => true
 * Dictionary.has("b", dict) // => false
 * ```
 */
export const has = <a>(key: string, dict: Dict<a>): boolean => key in dict

/**
 * Returns value for the give key in the given dictionary or a default passed-in
 * as a third argument if dictionary has no entry for the give key
 *
 * ```js
 * const animals = Dictionary.fromEntries([["Tom", "Cat"], ["Jerry", "Mouse"]])
 *
 * Dictionary.get("Jerry", animals) // => ("Mouse":string|void)
 * Dictionary.get("Tom", animals, null) // => ("Cat":string|null)
 * Dictionary.get("Tom", animals, "") // => ("Cat":string)
 * Dictionary.get("Spike", animals, null) // => (null:string|null)
 * Dictionary.get("Spike", animals, "") // => ("":string|null)
 * ```
 */
export const get = <a>(key: string, dict: Dict<a>, fallback: a): a => {
  const value = dict[key]
  if (value != null) {
    return value
  } else {
    return fallback
  }
}

export type Entry<a> = [string, a]

/**
 * Returns an iterable of dictionary `[key, value]` pairs using `for of`
 *
 * ```js
 * const dict = Dictionary.singleton('Car', {color:'blue'})
 *
 * for (let [key, value] of Dictionary.entries(dict)) {
 *    // ...
 * }
 * ```
 */
export function* entries<a>(dict: Dict<a>): Iterable<Entry<a>> {
  for (let key in dict) {
    const value = dict[key]
    if (value != null) {
      yield [key, value]
    }
  }
}

/**
 * Returns an iterable of dictionary keys that can be iterated over using
 * `for of`
 *
 * ```js
 * const dict = Dictionary.singleton('Bicycle', {color:'red'})
 *
 * for (let key of Dictionary.keys(dict)) {
 *    // ...
 * }
 * ```
 */
export function* keys<a>(dict: Dict<a>): Iterable<string> {
  for (let key in dict) {
    yield key
  }
}

/**
 * Returns an iterable of dictionary values that can be iterated over using `for of`
 *
 * ```js
 * const dict = Dictionary.singleton('Horse', {color:'black'})
 *
 * for (let value of Dictionary.values(dict)) {
 *    // ...
 * }
 * ```
 */
export function* values<a>(dict: Dict<a>): Iterable<a> {
  for (let key in dict) {
    const value = dict[key]
    if (value != null) {
      yield value
    }
  }
}

type Mapper<a, b> = a => b

/**
 * Maps dictionary entries using given function
 *
 * ```js
 * const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * before // => ({a: 1, b: 2}:Dict<number>)
 *
 * const after = Dictionary.map(([k, v]) =>
 *                               [k.toUpperCase(), String(v + 5)], before)
 * after // => ({A:"6", B:"7"}:Dict<string>)
 * ```
 */
export const map = <a, b>(
  f: Mapper<Entry<a>, Entry<b>>,
  dict: Dict<a>
): Dict<b> => {
  let mapped = empty()
  for (let key in dict) {
    const value = dict[key]
    if (value != null) {
      const [newKey, newValue] = f([key, value])
      mapped[newKey] = newValue
    }
  }
  return mapped
}

type Predicate<a> = (input: a) => boolean

/**
 * Keep a dictionary entries that satisfy provided predicate.
 *
 * ```js
 * const before = Dictionary.fromEntries([["a", -1], ["b", 2]])
 * before // => ({a: -1, b: 2}:Dict<number>)
 *
 * const after = Dictionary.filter(([_k, v]) => v > 0, before)
 * after // => ({b: 2}:Dict<number>)
 * ```
 */
export const filter = <a>(p: Predicate<Entry<a>>, dict: Dict<a>): Dict<a> => {
  let filtered = empty()
  for (let key in dict) {
    const value = dict[key]
    if (value != null) {
      if (p([key, value])) {
        filtered[key] = value
      }
    }
  }
  return filtered
}

/**
 * Partition a dictionary according to a predicate. The first dictionary
 * contains all entries which satisfy the predicate, and the second contains
 * the rest.
 *
 * ```js
 * const all = Dictionary.fromEntries([["a", -1], ["b", 2]])
 * all // => ({a: -1, b: 2}:Dict<number>)
 *
 * const [positive, negative] = Dictionary.partition(([_k, v]) => v > 0, all)
 * positive // => ({b: 2}:Dict<number>)
 * negative // => ({a: -1}:Dict<number>)
 * ```
 */
export const partition = <a>(
  p: Predicate<Entry<a>>,
  dict: Dict<a>
): [Dict<a>, Dict<a>] => {
  let filtered = empty()
  let rest = empty()
  for (let key in dict) {
    const value = dict[key]
    if (value != null) {
      if (p([key, value])) {
        filtered[key] = value
      } else {
        rest[key] = value
      }
    }
  }
  return [filtered, rest]
}

/**
 * Combine two dictionaries. If there is a collision, preference is given to
 * the first dictionary.
 *
 * ```js
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => ({a:1, b:2}:Dict<number>)
 *
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => ({b:18, c:9}:Dict<number>)
 *
 * const union = Dictionary.union(left, right)
 * union // => ({a:1, b:2, c:9}:Dict<number>)
 * ```
 */
export const union = <a>(left: Dict<a>, right: Dict<a>): Dict<a> => {
  let union = empty()
  for (let key in left) {
    union[key] = left[key]
  }

  for (let key in right) {
    if (!(key in union)) {
      union[key] = right[key]
    }
  }

  return union
}

/**
 * Keep a entries from left dictionary when right dictionary has entries for
 * the same key.
 *
 * ```js
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => ({a:1, b:2}:Dict<number>)
 *
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => ({b:18, c:9}:Dict<number>)
 *
 * const intersect = Dictionary.intersect(left, right)
 * intersect // => ({b:2}:Dict<number>)
 * ```
 */
export const intersect = <a>(left: Dict<a>, right: Dict<a>): Dict<a> => {
  let intersect = empty()
  for (let key in left) {
    if (key in right) {
      intersect[key] = left[key]
    }
  }
  return intersect
}

/**
 * Keep a entries from left dictionary only if right dictionary does not have
 * entry for that key.
 *
 * ```js
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => ({a:1, b:2}:Dict<number>)
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => ({b:18, c:9}:Dict<number>)
 * const delta = Dictionary.diff(left, right)
 * delta // => ({a:1}:Dict<number>)
 * ```
 */
export const diff = <a>(left: Dict<a>, right: Dict<a>): Dict<a> => {
  let result = empty()
  for (let key in left) {
    if (!(key in right)) {
      result[key] = left[key]
    }
  }
  return result
}

export type Accumulator<chunk, result> = (input: chunk, state: result) => result

/**
 * The most general way of combining two dictionaries. You provide three
 * accumulators for when a given key appears:
 *
 * - Only in the left dictionary.
 * - In both dictionaries.
 * - Only in the right dictionary.
 *
 * You then traverse all the keys from lowest to highest, building up whatever
 * you want.
 *
 * ```js
 * Dictionary.merge(
 *   ([key, left], log):string[] =>
 *      [...log, `- ${key} : ${left}`],
 *   ([key, [left, right]], log):string[] =>
 *      [...log, `= ${key} : ${left} -> ${right}`],
 *   ([key, right], log):string[] =>
 *      [...log, `+ ${key} : ${right}`],
 *   Dictionary.fromEntries([["a", 1], ["b", 2]]),
 *   Dictionary.fromEntries([["b", 18], ["c", 9]]),
 *   []
 * ) // => ['- a : 1', '= b : 2 -> 18', '+ c : 9']
 * ```
 */
export const merge = <a, b, result>(
  accumulateLeft: Accumulator<Entry<a>, result>,
  accumulateBoth: Accumulator<Entry<[a, b]>, result>,
  accumulateRight: Accumulator<Entry<b>, result>,
  left: Dict<a>,
  right: Dict<b>,
  init: result
): result => {
  let state = init
  for (let key in left) {
    const leftValue = left[key]
    if (leftValue != null) {
      const rightValue = right[key]
      if (rightValue != null) {
        state = accumulateBoth([key, [leftValue, rightValue]], state)
      } else {
        state = accumulateLeft([key, leftValue], state)
      }
    }
  }

  for (let key in right) {
    const rightValue = right[key]
    const leftValue = left[key]
    if (rightValue != null && leftValue == null) {
      state = accumulateRight([key, rightValue], state)
    }
  }

  return state
}
