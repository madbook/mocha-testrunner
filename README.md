mocha-testrunner
================

Node script to run mocha tests.  Can run tests in node or phantomjs environments.

Running a test (in node)

```
node mocha-testrunner myTest
```

Running multiple tests

```
node mocha-testrunner test1 test2 path/to/test3
```

Prepending a filename with a `+` sign runs that test in phantomjs

```
node mocha-testrunner nodetest +phantomTest
```

_IMPORTANT_ - phantom tests must explicitly call `phantom.exit()`

PhantomJS tests require _PhantomJS_, and also require _Browserify_ to be
installed as a global module.  PhantomJS tests can then be written in
the same format as node tests.  There is currently no support for loading
an html file, so you'll have to build any dom elements you need for browser
tests via js.

## TODO

+ find a proper mocha reporter to output to phantomjs console.log, or write one :(
+ support on-the-fly compiling of coffeescript files (as the non-phantomjs tests do via coffeescript)
+ externalize the browserify template