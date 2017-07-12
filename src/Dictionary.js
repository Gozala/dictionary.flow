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
  [key: string]: Maybe<a>
}

/**
 * Dictionary class used across the library to create `Dict` instances.
 */
const Dictionary: Class<Dictionary> = function Dictionary(): void {}
Dictionary.prototype = Object.freeze(Object.create(null))

/**
 * Create an empty dictionary.
 *
 * ```ts
 * const v0 = Dictionary.empty()
 * v0 // => <Dict<any>>{}
 * const v1 = Dictionary.set('Jack', 1, v0)
 * v1 // => <Dict<any>>{"Jack": 1}
 * const v2 = Dictionary.set('Jane', 'Jane', v1)
 * v2 // => <Dict<any>>{"Jack": 1, "Jane": "Jane"}
 * ```
 *
 * If optional `dictioray` is passed retuned empty dictionary will be of the
 * same type entries. If ommited it will be of `any` type.
 *
 * ```ts
 * const v$:Dictionary.Dict<number> = Dictionary.empty()
 * v$ // => <Dict<number>>{}
 * const v0 = Dictionary.empty(v$)
 * v0 // => <Dict<number>>{}
 * const v1 = Dictionary.set('Jack', 1, v0)
 * v1 // => <Dict<number>>{Jack: 1}
 * Dictionary.set('Jane', 'Jane', v1) // <- ts: 'Jane' is not a number
 * ```
 *
 * There are two things to notice in the examlpe above:
 *
 *   1. Passing optional `dictionary` is useful as it narrovs down the type of
 *      values that can be inserted into dictionary.
 *   2. Alternatively type can be narroved down via explicit type annotation
 *      as seen on the first line.
 */
export const empty = <a>(): Dict<a> => new Dictionary()

/**
 * Create a dictionary with one entry of given key, value pair.
 *
 * ```ts
 * Dictionary.singleton('Zoe', 15) // => <Dict<number>>{Zoe: 15}
 * Dictionary.singleton('a', {foo:"bar"}) // => <Dict<{foo:string}>>{a: {foo:"bar"}}
 * ```
 */
export const singleton = <a>(key: string, value: a): Dict<a> => {
  const result = new Dictionary()
  result[key] = value
  return result
}

/**
 * Convert an iterable of `[key, value]` pairs into a dictionary.
 *
 * ```ts
 * Dictionary.fromEntries([
 *    ['Zoe', 17],
 *    ['Sandro', 18]
 * ]) // => <Dict<number>> {Zoe: 17, Sandro: 18}
 *
 * Dictionary
 *  .fromEntries((<Map<string, User>>db).entries()) // => <Dict<User>>
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
 * ```ts
 * const v0 = Dictionary.fromEntries([["a", 1]])
 * v0 // => <Dict<number>> {a:1}
 *
 * // Add
 * const v1 = Dictionary.set("b", 2, v0)
 * v1 // => <Dict<number>> {a:1, b:2}
 *
 * // Replace
 * const v2 = Dictionary.set("b", 15, v1)
 * v2 // => <Dict<number>> {a:1, b:15}
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
 * ```ts
 * const v0 = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * v0 // => <Dict<number>>{a:1, b:2}
 *
 * const inc = (v:null|undefined|number):number =>
 *    v == null ? 0 : v + 1
 *
 * // Add
 * const v1 = Dictionary.update("c", inc, v0)
 * v1 // => <Dict<number>>{a:1, b:2, c:0}
 *
 * // Modify
 * const v2 = Dictionary.update("b", inc, v1)
 * v2 // => <Dict<number>>{a:1, b:3, c:0}
 *
 * // Delete
 * const v3 = Dictionary.update("b", _ => null, v2)
 * v3 // => <Dict<number>>{a:1, c:0}
 *
 * const v4 = Dictionary.update("c", _ => undefined, v3)
 * v4 // => <Dict<number>>{a:1}
 *
 * // NoOp
 * const v5 = Dictionary.update("d", _ => null, v4)
 * v5 // => <Dict<number>>{a: 1}
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
 * ```ts
 * const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * before // => <Dict<number>>{a: 1, b:2}
 * const after = Dictionary.remove("a", before)
 * after // => <Dict<number>>{b:2}
 * Diremove("c", after) // => <Dict<number>>{b:2}
 * ```
 */
export const remove = <a>(key: string, dict: Dict<a>): Dict<a> => (
  delete dict[key],
  dict
)

/**
 * Determine if there is an entry with a given key is in a dictionary.
 *
 * ```
 * const dict = Dictionary.singleton("a", 1)
 *
 * Dictionary.has("a", dict) // => true
 * Dictionary.has("b", dict) // => false
 * ```
 */
export const has = <a>(key: string, dict: Dict<a>): boolean => key in dict

/**
 * Get the value of the entry with a given key and fallback in case if there is
 * no such entry.
 *
 * ```ts
 * const animals = Dictionary.fromEntries([["Tom", "Cat"], ["Jerry", "Mouse"]])
 *
 * Dictionary.get("Tom", animals, null) => <string|null> "Cat"
 * Dictionary.get("Tom", animals, "") => <string> "Cat"
 * Dictionary.get("Spike", animals, null) => <string|null> null
 * Dictionary.get("Spike", animals, "") => <string> ""
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
 * Returns an iterable of dictionary [key, value] pairs using `for of`
 *
 * ```ts
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
 * Returns an iterable of dictionary keys using `for of`
 *
 * ```ts
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
 * Returns an iterable of dictionary values using `for of`
 *
 * ```ts
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
 * Creates new dictionary with entries from given dictionary but with it's
 * values mapped via given `f` function.
 *
 * ```ts
 * const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * before // => <Dict<number>>{a: 1, b: 2}
 *
 * const after = Dictionary.map(([k, v]) =>
 *                               [k.toUpperCase(), String(v + 5)], before)
 * after // => <Dict<string>>{A:"6", B:"7"}
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
 * Keep a dictionary entries when it satisfies a predicate.
 *
 * ```ts
 * const before = Dictionary.fromEntries([["a", -1], ["b", 2]])
 * before // => <Dict<number>>{a: -1, b: 2}
 *
 * const after = Dictionary.filter(([_k, v]) => v > 0, before)
 * after // => <Dict<number>>{b: 2}
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
 * ```ts
 * const all = Dictionary.fromEntries([["a", -1], ["b", 2]])
 * all // => <Dict<number>>{a: -1, b: 2}
 *
 * const [positive, negative] = Dictionary.partition(([_k, v]) => v > 0, all)
 * positive // => <Dict<number>>{b: 2}
 * negative // => <Dict<number>>{a: -1}
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
 * ```ts
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => <Dict<number>>{a:1, b:2}
 *
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => <Dict<number>>{b:18, c:9}
 *
 * const union = Dictionary.union(left, right)
 * union // => <Dict<number>>{a:1, b:2, c:9}
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
 * ```ts
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => <Dict<number>>{a:1, b:2}
 *
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => <Dict<number>>{b:18, c:9}
 *
 * const intersect = Dictionary.intersect(left, right)
 * intersect // => <Dict<number>>{b:2}
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
 * ```ts
 * const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
 * left // => <Dict<number>>{a:1, b:2}
 * const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
 * right // => <Dict<number>>{b:18, c:9}
 * const diff = Dictionary.diff(left, right)
 * diff // => <Dict<number>>{a:1}
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
 *  The most general way of combining two dictionaries. You provide three
 * accumulators for when a given key appears:
 *
 * - Only in the left dictionary.
 * - In both dictionaries.
 * - Only in the right dictionary.
 *
 * You then traverse all the keys from lowest to highest, building up whatever
 * you want.
 *
 * ```ts
 * Dictionary.merge(
 *   ([key, left], log) =>
 *      [...log, `- ${key} : ${left}`],
 *   ([key, [left, right]], log) =>
 *      [...log, `= ${key} : ${left} -> ${right}`],
 *   ([key, right], log) =>
 *      [...log, `+ ${key} : ${right}`],
 *   Dictionary.fromEntries([["a", 1], ["b", 2]]),
 *   Dictionary.fromEntries([["b", 18], ["c", 9]]),
 *   <string[]>[]) // => ['- a : 1', '= b : 2 -> 18', '+ c : 9']
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
