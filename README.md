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

Prepending a filename with a `-` sign runs that test in phantomjs

```
node mocha-testrunner nodetest -phantomTest
```

Filenames can also be _globs_

```
node mocha-testrunner 'tests/*'
```

PhantomJS tests require _PhantomJS_, and also require _Browserify_ to be
installed as a global module.  PhantomJS tests can then be written in
the same format as node tests.  There is currently no support for loading
an html file, so you'll have to build any dom elements you need for browser
tests via js.

## TODO

+ cleanup custom reporter (its _ugly_)
+ package into a nice little command line tool
+ make test environments (node, phantomjs) plugins