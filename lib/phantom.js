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

        runTest(__tempdir+tempFile, function (err) {
            removeTempFile(tempFile)
            if (err) {
                if (cb instanceof Function)
                    cb(err)
                else
                    throw err
            }
            else if (cb instanceof Function)
                cb(0)
        })
    })
}

function bundle (filePath, cb) {
    // bundle up files with browserify so we can write tests using require

    var child = exec('browserify '+filePath)
    var tempFileDir = getTempFilePath()
    var tempFile = fs.createWriteStream(__tempdir + tempFileDir, {
        encoding: 'utf8',
        mode: 0777
    })

    child.stdout.setEncoding('utf8')
    child.stdout.pipe(tempFile)

    child.on('exit', function (code) {
        tempFile.end()

        if (code)
            removeTempFile(tempFileDir)

        if (cb instanceof Function)
            cb(code, tempFileDir)
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

function removeTempFile (filePath) {
    fs.unlinkSync(__tempdir + filePath)
}