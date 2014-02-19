console.log('foo')
require('./test-phantom-test-required')

if (typeof phantom !== 'undefined')
    phantom.exit()