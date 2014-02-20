#!/usr/bin/env node

var runner = require('../lib/runner')

runner.run(process.argv.slice(2), function (failures) {
    process.exit(failures);
})