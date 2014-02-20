/*
 run scripts in a phantom js instance
 */

var fs = require('fs')
var path = require('path')
var os = require('os')
var exec = require('child_process').exec
var __tempdir = os.tmpdir()
var __context = process.cwd()

module.exports.run = function (file, cb) {
    bundle(__context+'/'+file, function (err, tempFile) {
        if (err) {
            if (cb instanceof Function)
                cb(err)
            else
                throw err
        }

        runTest(tempFile, function (err) {
            if (err) {
                if (cb instanceof Function)
                    cb(err)
                else
                    throw err
            }
            else {
                removeFile(tempFile)
                if (cb instanceof Function)
                    cb(0)
            }
        })
    })
}

function bundle (filePath, cb) {
    // bundle up files with browserify so we can write tests using require
    var templateFile = wrapFileInBrowserifyTemplate(filePath)
    var tempFileName = '/file-to-run-phantom-please-no-conflict.js'
    // var tempFilePath = splitPath(filePath).path + tempFileName
    var tempFilePath = __tempdir + tempFileName
    var child = exec('browserify --debug --ignore-missing -o '+tempFilePath+' '+templateFile)

    child.stdout.setEncoding('utf8')

    child.on('exit', function (code) {
        removeFile(templateFile)

        if (code)
            removeFile(tempFilePath)

        if (cb instanceof Function)
            cb(code, tempFilePath)
        else if (code)
            throw 'Browserify exited with error code '+code
    })
}

function runTest (filePath, cb) {
    // run a script in a phantomjs instance

    var child = exec('phantomjs '+filePath)

    child.stdout.setEncoding('utf8')

    child.stdout.on('data', function (data) {
        console.log(data)
    })
    // child.stdout.pipe(process.stdout)

    child.on('exit', function (code) {
        if (cb instanceof Function)
            cb(code)
        else if (code)
            throw 'Phantom exited with error code '+code
    })
}

function getTempFilePath () {
    return '/mocha-testrunner-phantomscript.js'
}

function removeFile (fullPath) {
    fs.unlinkSync(fullPath)
}

function wrapFileInBrowserifyTemplate (filePath) {
    var fileParts = splitPath(filePath)
    var tempPath = getTempFilePath()

    var templateRelativePath = filePath

    if (filePath[0] !== '/')
        templateRelativePath = './' + templateRelativePath

    var template = "x = require('mocha/mocha.js'); var webconsole=require('"+__dirname+"/console-reporter.js'); mocha.setup({reporter:webconsole}); mocha.ui('bdd'); require('"+templateRelativePath+"'); mocha.run(function() { phantom.exit() });"

    fs.writeFileSync(fileParts.path+tempPath, template, { encoding: 'utf8', mode: 0777 })
    return fileParts.path+tempPath
}

function splitPath(filePath) {
    var parts = filePath.split('/')
    var fileName = parts.pop()
    return { name: fileName, path: parts.join('/') }
}