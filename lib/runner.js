/**
 * run mocha tests programmatically
 */

require('coffee-script/register')

var Mocha = require('mocha')
var fs = require('fs')
var phantom = require('./phantom')
var glob = require('glob')
var fileTypes = ['.js', '.coffee', '.coffee.md', '.litcoffee']

exports.run = function (fileList, done) {
    var mocha = new Mocha
    var phantomTestList = []
    var nodeTestCount = 0

    if (typeof done !== 'function')
        done = function () {}

    function process (fileName, phantomTest) {
        if (phantomTest)
            phantomTestList.push(fileName)
        else {
            mocha.addFile(fileName)
            nodeTestCount++
        }
    }

    fileList.forEach(function (file) {
        // allow passing in filenames w/o extension
        var fileName = file

        var phantomTest = (fileName[0] === '-')

        if (phantomTest)
            fileName = fileName.slice(1)

        var globResults = glob.sync(fileName)

        if (globResults.length)
            return globResults.forEach(function (file) {
                process(file, phantomTest)
            })

        var fileTypeMatch = fileTypes.some(function (elem) {
            var i = fileName.indexOf(elem)
            return (i !== ~0 && i === fileName.length - elem.length)
        })

        if (!fileTypeMatch)
            fileTypes.some(function (elem) {
                if (!fs.existsSync(fileName + elem))
                    return false
                fileName += elem
                return true
            })

        if (fs.existsSync(fileName))
            process(fileName, phantomTest)
        else
            console.warn(file + ' not found, skipping')

    })

    if (nodeTestCount)
        mocha.reporter('spec').ui('tdd').run(function (failures) {
            if (!phantomTestList.length)
                return done()

            return runPhantomTests(phantomTestList, done)
        })
    else if (phantomTestList.length) {
        mocha.reporter('spec').ui('tdd')
        runPhantomTests(phantomTestList, done)
    }
    else
        done('no tests!')

}

function runPhantomTests (files, cb) {
    return phantom.run(files, cb)

    var i = 0
    next()

    function next () {
        if (i < files.length)
            phantom.run(files[i++], next)
        else if (cb instanceof Function)
            cb()
    }
}