// imports
var dump = require('../lib/util').simpleDump;
var ifError = require('./testutils.js').ifError;
var fs = require('../lib/filesystem.js');
var async = require('async');

// initialization
var filesystem = new fs.Filesystem('http://localhost:5984', 'stack-js');

exports.init = function (test) {
    filesystem.nuke(function nuked() {
        filesystem.init(function () {
            test.done();
        });
    });
};

exports.testCRUD = function (test) {
    async.waterfall([

        function(callback) {
            var file = new fs.File('/crud', 'someone', {
                'test':true
            });
            callback(null, file);
        },

        /*
         * C - Create file and check for existence
         */
        function createFile(file, callback) {
            filesystem.writeFile(file, function checkFileExists(error) {
                ifError(error);
                filesystem.fileExists(file.path(), function fileExistsRequested(error, exists) {
                    ifError(error);

                    // check if file exists
                    test.ok(exists);

                    // call readFile
                    callback(null)
                });
            });
        },

        /*
         * R - Read file and check for test property set earlier
         */
        function readFile(callback) {
            filesystem.readFile('/crud', function fileRead(error, file) {
                ifError(error);

                test.ok(file.get('test'))

                // call updateFile
                callback(null);
            });
        },

        /*
         * U - Update file with test to false
         */
        function updateFile(callback) {
            // read file from database, update it, read again, check for updated property
            filesystem.readFile('/crud', function(error, file) {
                ifError(error);

                file.set('test', false);
                filesystem.writeFile(file, function fileWritten(error, file) {
                    ifError(error);
                    filesystem.readFile('/crud', function fileRead(error, file) {
                        ifError(error);

                        test.ok(file.get('test') === false);

                        // call deleteFile
                        callback(null);
                    });

                });
            });
        },

        /*
         * D - Delete file
         */
        function deleteFile(callback) {
            filesystem.readFile('/crud', function fileRead(error, file) {
                ifError(error);

                filesystem.deleteFile(file, function fileDeleted(error) {
                    ifError(error);

                    callback(null);
                });
            })
        }
    ], function done(error) {
        ifError(error);
        test.done();
    });
};