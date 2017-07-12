# dictionary.flow
[![travis][travis.icon]][travis.url]
[![package][version.icon] ![downloads][downloads.icon]][package.url]
[![styled with prettier][prettier.icon]][prettier.url]

Library provides APIs to work with mutable dictionaries, where dictionary is:

```flow
type Dict <a> = {[key:string]: a}
```

Library assumeth that passed dictionaries do not have a prototype chain to be
concerned with, so either construct them with provided APIs or via
`Object.create(null)`, otherwise you may run into issues with inherited
properties like `toString` and what not.

### Warning on mutability

Library intentionally provides functional interface where it takes in
dictionary & other params and returns a dictionary. But be aware that it
actually mutates given dictionary in place and returns it back.

Recomended use as can be seen in [documentation examples][docs url] is to always
use returned dictionary as if it was different from passed in dictionary while
at the same time avoid touching a passed dictionary ever again. That would
allow you to switch between mutable & (upcoming) immutable version of this
library without breaking your code. Maybe I just really wish typescript had a
[owneship system][] :)

## Install

### yarn

    yarn add --save dictionary.flow

### npm

    npm install --save dictionary.flow


## Prior Art

API of this library mostly follows the API of the [Dict][Dict Elm] module from
[Elm][] core library.


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