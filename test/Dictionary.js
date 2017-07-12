/* @flow */

import * as Dictionary from "../"
import test from "blue-tape"

test("test exports", async test => {
  test.isEqual(typeof Dictionary, "object")
  test.isEqual(typeof Dictionary.empty, "function")
  test.isEqual(typeof Dictionary.singleton, "function")
  test.isEqual(typeof Dictionary.fromEntries, "function")
  test.isEqual(typeof Dictionary.set, "function")
  test.isEqual(typeof Dictionary.update, "function")
  test.isEqual(typeof Dictionary.remove, "function")
  test.isEqual(typeof Dictionary.has, "function")
  test.isEqual(typeof Dictionary.get, "function")
  test.isEqual(typeof Dictionary.entries, "function")
  test.isEqual(typeof Dictionary.keys, "function")
  test.isEqual(typeof Dictionary.values, "function")
  test.isEqual(typeof Dictionary.map, "function")
  test.isEqual(typeof Dictionary.filter, "function")
  test.isEqual(typeof Dictionary.partition, "function")
  test.isEqual(typeof Dictionary.union, "function")
  test.isEqual(typeof Dictionary.intersect, "function")
  test.isEqual(typeof Dictionary.diff, "function")
  test.isEqual(typeof Dictionary.merge, "function")
})

test("test empty", async test => {
  const v0 = Dictionary.empty()
  test.deepEqual(v0, {})

  const v1 = Dictionary.set("Jack", 1, v0)
  test.deepEqual(v1, { Jack: 1 })

  const v2 = Dictionary.set("Jane", "Jane", v1)

  test.deepEqual(v2, { Jack: 1, Jane: "Jane" })

  const v3: Dictionary.Dict<number> = Dictionary.empty()

  const v4 = Dictionary.empty()
  test.deepEqual(v4, {})

  const v5 = Dictionary.set("Jack", 1, v4)
  test.deepEqual(v5, { Jack: 1 })
})

test("singleton", async test => {
  test.deepEqual(Dictionary.singleton("Zoe", 15), { Zoe: 15 })
  test.deepEqual(Dictionary.singleton("a", { foo: "bar" }), {
    a: { foo: "bar" }
  })
})

test("fromEntries", async test => {
  test.deepEqual(Dictionary.fromEntries([["Zoe", 17], ["Sandro", 18]]), {
    Zoe: 17,
    Sandro: 18
  })

  const map: Map<string, {}> = new Map()
  map.set("a", { a: 1 })
  map.set("b", { b: 2 })

  test.deepEqual(Dictionary.fromEntries(map.entries()), {
    a: { a: 1 },
    b: { b: 2 }
  })
})

test("set", async test => {
  // init
  const v0 = Dictionary.fromEntries([["a", 1]])
  test.deepEqual(v0, { a: 1 })

  // add
  const v1 = Dictionary.set("b", 2, v0)
  test.deepEqual(v1, { a: 1, b: 2 })

  // replace
  const v2 = Dictionary.set("b", 15, v1)
  test.deepEqual(v2, { a: 1, b: 15 })
})

test("update", async test => {
  const v0 = Dictionary.fromEntries([["a", 1], ["b", 2]])
  test.deepEqual(v0, { a: 1, b: 2 })

  const inc = (v: ?number): ?number => (v == null ? 0 : v + 1)

  // Add
  const v1 = Dictionary.update("c", inc, v0)
  test.deepEqual(v1, { a: 1, b: 2, c: 0 })

  // Modify
  const v2 = Dictionary.update("b", inc, v1)
  test.deepEqual(v2, { a: 1, b: 3, c: 0 })

  // Delete
  const v3 = Dictionary.update("b", _ => null, v2)
  test.deepEqual(v3, { a: 1, c: 0 })

  const v4 = Dictionary.update("c", _ => undefined, v3)
  test.deepEqual(v4, { a: 1 })

  // NoOp
  const v5 = Dictionary.update("d", _ => null, v4)
  test.deepEqual(v5, { a: 1 })
})

test("remove", async test => {
  const v0 = Dictionary.fromEntries([["a", 1], ["b", 2]])
  test.deepEqual(v0, { a: 1, b: 2 })

  const v1 = Dictionary.remove("a", v0)
  test.deepEqual(v1, { b: 2 })

  const v2 = Dictionary.remove("c", v1)

  test.deepEqual(v2, { b: 2 })
})

test("has", async test => {
  const dict = Dictionary.singleton("a", 1)

  test.equal(Dictionary.has("a", dict), true)
  test.equal(Dictionary.has("b", dict), false)
})

test("get", async test => {
  const animals = Dictionary.fromEntries([["Tom", "Cat"], ["Jerry", "Mouse"]])

  test.equal(Dictionary.get("Tom", animals, null), "Cat")
  test.equal(Dictionary.get("Tom", animals, ""), "Cat")
  test.equal(Dictionary.get("Spike", animals, null), null)
  test.equal(Dictionary.get("Spike", animals, ""), "")
})

test("entries", async test => {
  const dict = Dictionary.singleton("Car", { color: "blue" })

  for (let [key, value] of Dictionary.entries(dict)) {
    test.equal(key, "Car")
    test.deepEqual(value, { color: "blue" })
  }
})

test("keys", async test => {
  const dict = Dictionary.singleton("Bicycle", { color: "red" })

  for (let key of Dictionary.keys(dict)) {
    test.equal(key, "Bicycle")
  }
})

test("values", async test => {
  const dict = Dictionary.singleton("Horse", { color: "black" })

  for (let value of Dictionary.values(dict)) {
    test.deepEqual(value, { color: "black" })
  }
})

test("map", async test => {
  const before = Dictionary.fromEntries([["a", 1], ["b", 2]])
  test.deepEqual(before, { a: 1, b: 2 })

  const after = Dictionary.map(
    ([k, v]) => [k.toUpperCase(), String(v + 5)],
    before
  )
  test.deepEqual(after, { A: "6", B: "7" })
})

test("filter", async test => {
  const before: Dictionary.Dict<number> = Dictionary.fromEntries([
    ["a", -1],
    ["b", 2]
  ])
  test.deepEqual(before, { a: -1, b: 2 })

  const after = Dictionary.filter(([_k, v]) => v > 0, before)
  test.deepEqual(after, { b: 2 })
})

test("partition", async test => {
  const all = Dictionary.fromEntries([["a", -1], ["b", 2]])
  test.deepEqual(all, { a: -1, b: 2 })

  const [positive, negative] = Dictionary.partition(([_k, v]) => v > 0, all)
  test.deepEqual(positive, { b: 2 })
  test.deepEqual(negative, { a: -1 })
})

test("union", async test => {
  const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
  test.deepEqual(left, { a: 1, b: 2 })

  const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
  test.deepEqual(right, { b: 18, c: 9 })

  const union = Dictionary.union(left, right)
  test.deepEqual(union, { a: 1, b: 2, c: 9 })
})

test("intersect", async test => {
  const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
  test.deepEqual(left, { a: 1, b: 2 })

  const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
  test.deepEqual(right, { b: 18, c: 9 })

  const intersect = Dictionary.intersect(left, right)
  test.deepEqual(intersect, { b: 2 })
})

test("diff", async test => {
  const left = Dictionary.fromEntries([["a", 1], ["b", 2]])
  test.deepEqual(left, { a: 1, b: 2 })

  const right = Dictionary.fromEntries([["b", 18], ["c", 9]])
  test.deepEqual(right, { b: 18, c: 9 })

  const diff = Dictionary.diff(left, right)
  test.deepEqual(diff, { a: 1 })
})

test("merge", async test => {
  const log = Dictionary.merge(
    ([key, left], log):string[] => [...log, `- ${key} : ${left}`],
    ([key, [left, right]], log):string[] => [...log, `= ${key} : ${left} -> ${right}`],
    ([key, right], log):string[] => [...log, `+ ${key} : ${right}`],
    Dictionary.fromEntries([["a", 1], ["b", 2]]),
    Dictionary.fromEntries([["b", 18], ["c", 9]]),
    []
  )
  test.deepEqual(log, ["- a : 1", "= b : 2 -> 18", "+ c : 9"])
})
