/*
 run scripts in a phantom js instance
 */

var fs = require('fs')
var os = require('os')
var exec = require('child_process').exec
var browserify = require('browserify')
var coffeeify = require('coffeeify')

var __tempdir = os.tmpdir()
var __context = process.cwd()

var defaultOpts = {}
var defaultCb = function (err, data) {
    if (err)
        throw err
}

module.exports.run = function (fileList, opts, cb) {
    if (opts instanceof Function) {
        cb = opts
        opts = defaultOpts
    }
    else if (typeof opts === 'undefined')
        opts = defaultOpts
    if (typeof cb !== 'function')
        cb = defaultCb

    opts.__context = __context

    bundle(fileList, opts, function (err, tempFile) {
        if (err)
            return cb(err)

        runTest(tempFile, function (err) {
            if (err)
                return cb(err)

            removeFile(tempFile)
            cb(0)
        })
    })
}

function bundle (filePaths, opts, cb) {
    // bundle up files with browserify so we can write tests using require
    var templateFile = wrapFileInBrowserifyTemplate(opts.__context, filePaths)
    var tempFileName = '/file-to-run-phantom-please-no-conflict.js'
    var tempFilePath = __tempdir + tempFileName

    var b = browserify({
        entries: [opts.__context+'/'+templateFile],
        extensions: ['.coffee', '.coffee.md', '.litcoffee']
    })

    b.transform(coffeeify)

    b.bundle({
        debug: true,
        ignoreMissing: true
    }, function (err, src) {
        removeFile(opts.__context+'/'+templateFile)

        if (!err)
            fs.writeFileSync(tempFilePath, src, { encoding: 'utf8', mode: 0777 })

        cb(err, tempFilePath)
    })
}

function runTest (testFilePath, cb) {
    // run a script in a phantomjs instance

    var child = exec('phantomjs '+testFilePath)
    var partialData = ''
    child.stdout.setEncoding('utf8')

    child.stdout.on('data', function (data) {
        var obj
        try {
            obj = JSON.parse(data)
            if (partialData) {
                partialData = parsePartialData(partialData)
            }
        } catch (err) {
            partialData += data
        }

        if (obj)
            parsePhantomLogs(obj)
    })

    child.on('exit', function (code) {
        if (partialData)
            partialData = parsePartialData(partialData)

        if (partialData)
            console.warn(partialData)

        cb(code)
    })
}

function getTempFilePath () {
    return '/mocha-testrunner-phantomscript.js'
}

function removeFile (fullPath) {
    fs.unlinkSync(fullPath)
}

function wrapFileInBrowserifyTemplate (context, filePaths) {
    var tempPath = getTempFilePath()
    var template = "x = require('mocha/mocha.js');"
                 + "var webconsole=require('"+__dirname+"/console-reporter.js');"
                 + "mocha.setup({reporter:webconsole}); mocha.ui('bdd');"
    template += filePaths.reduce(function (a, b) {
        var path = b[0] === '/' ? b : './' + b
        return a + "require('"+path+"');"
    }, '')
    template += "mocha.run(function() { phantom.exit() });"

    fs.writeFileSync(context+'/'+tempPath, template, { encoding: 'utf8', mode: 0777 })
    return tempPath
}

function parsePartialData (partialData) {
    var remains = ''
    partialData.split('\n').forEach(function (chunk) {
        try {
            parsePhantomLogs(JSON.parse(chunk))
        } catch (err) {
            remains += ''
        }
    })
    return remains
}

function parsePhantomLogs (msg) {
    console[msg.type].apply(console, msg.args)
}