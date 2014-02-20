/**
 * run mocha tests programmatically
 */

require('coffee-script/register')

var Mocha = require('mocha')
var fs = require('fs')
var phantom = require('./lib/phantom')
var fileTypes = ['.js', '.coffee', '.coffee.md', '.litcoffee']

exports.run = function (fileList, done) {
    var mocha = new Mocha
    var phantomTestList = []
    var nodeTestCount = 0

    fileList.forEach(function (file) {
        // allow passing in filenames w/o extension
        var fileName = file

        var phantomTest = (fileName[0] === '+')

        if (phantomTest)
            fileName = fileName.slice(1)

        var fileTypeMatch = fileTypes.some(function (elem) {
            return (fileName.indexOf(elem) === fileName.length - elem.length)
        })

        if (!fileTypeMatch)
            fileTypes.some(function (elem) {
                if (!fs.existsSync(__dirname + '/' + fileName + elem))
                    return false
                fileName += elem
                return true
            })

        if (fs.existsSync(__dirname + '/' + fileName)) {
            if (phantomTest)
                phantomTestList.push(fileName)
            else {
                mocha.addFile(__dirname + '/' + fileName)
                nodeTestCount++
            }
        }
        else
            console.warn(file + ' not found, skipping')

    })

    if (nodeTestCount)
        mocha.reporter('spec').ui('tdd').run(function (failures) {
            function end () {
                complete(failures, done)
            }

            if (!phantomTestList.length)
                return end()

            return runPhantomTests(phantomTestList, end)
        })
    else if (phantomTestList.length) {
        mocha.reporter('spec').ui('tdd')
        runPhantomTests(phantomTestList, done)
    }
    else
        complete('no tests!', done)

}

if (!module.parent) {
    // script is being run directly from shell, use process.argv
    exports.run(process.argv.slice(2))
}

function complete (failures, cb) {
    if (!module.parent) {
        process.exit(failures);
   } else {
        process.on('exit', function () {
            process.exit(failures)
        });
    }

    if (cb)
        cb(failures);
}

function runPhantomTests (files, cb) {
    var i = 0
    next()

    function next () {
        if (i < files.length)
            phantom.run(files[i++], next)
        else if (cb instanceof Function)
            cb()
    }
}