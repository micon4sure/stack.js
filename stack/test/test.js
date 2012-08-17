var dump = require('../lib/util.js').simpleDump;
var fs = require('../lib/filesystem.js');
var filesystem = new fs.Filesystem('http://localhost:5984', 'stack-js');

exports.init = function (test) {
    filesystem.nuke(function nuked() {
        filesystem.init(function () {
            test.done();
        });
    });
};

exports.testCRUD = function (test) {
    var file = new fs.File('/foo', {
        'test':true
    });

    // write file
    filesystem.writeFile(file, function (file) {
        fileWritten(file);
    });
    // check file exists
    function fileWritten(file) {
        filesystem.fileExists(file.path(), function(bool) {
            test.ok(bool === true, "File does not exist");
            fileRead(file)
        });
    }
    // read file again
    function fileDoesExist() {
        filesystem.readFile(file.path(), function(file) {
            fileRead(file)
        });
    }
    function fileRead(file) {
        test.ok(file.test, 'Test property of file was not true');

        filesystem.deleteFile(file, function(bool) {
            fileDeleted(bool);
        });
    }
    // check if file still exists
    function fileDeleted(bool) {
        test.ok(bool === true, 'File was expected to be deleted');
        filesystem.fileExists('/foo', function() {
            fileRequested.apply(arguments);
        });
    }
    function fileRequested(bool) {
        test.ok(bool === false, "File does exist");
    }
    test.done();
};