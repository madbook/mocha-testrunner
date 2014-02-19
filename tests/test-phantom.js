var phantom = require('../lib/phantom')

phantom.run('tests/test-phantom-test.js', function (err) {
    if (err)
        console.warn('some error', err)
    else
        console.log('all done!')
})