var _ = require('underscore');
var dump = require('../lib/util.js').simpleDump;

var Filesystem = function(url, name) {
    if(url === undefined) {
        url = 'http://localhost:5984';
    }

    this._name = name;
    this._nano = require('nano')(url);
    this.db = this._nano.use(name);
}

Error_CouldNotReadFile = function(response) {
    this.body = response;
};
Error_CouldNotWriteFile = function(response) {
    this.response = response;
};
Error_CouldNotDeleteFile = function(response) {
    this.response = response;
};

Filesystem.prototype = {


    nuke: function(callback) {
        this._nano.db.destroy(this._name, callback);
    },

    init: function(callback) {
        this._nano.db.create(this._name, callback);
    },

    /**
     * Write a file to the database
     * @param file
     * @param callback
     */
    writeFile: function(file, callback) {

        that = this;

        this.db.insert(file.data(), file.path(), function requestCompleted(error) {
            // check for error
            if(error !== null) {
                throw new Error_CouldNotWriteFile(error);
            }

            // pass callback to readFile
            that.readFile(file.path(), callback);
        });
    },

    /**
     * Read a file from the database
     * @param path
     * @param callback
     */
    readFile: function(path, callback) {
        this.db.get(path, {'include_docs': true}, function requestCompleted(error, response) {
            // check for error
            if(error !== null) {
                throw new Error_CouldNotReadFile(response);
            }

            // create file and call back
            var file = File.create(response);
            callback(file);
        });
    },

    /**
     * Delete a file from the database
     * @param file
     * @param callback
     */
    deleteFile: function(file, callback) {
        this.db.destroy_document(file.path(), file._rev, function(error, response) {
            if(error !== null) {
                dump(file)
                dump(error)
                throw new Error_CouldNotDeleteFile(response);
            }
        });
    },

    /**
     * Check if a file exists
     * @param path
     * @param callback
     */
    fileExists: function(path, callback) {
        this.db.head(path, function requestCompleted(error, response) {
            // check for error


        });
    }
};


var File = function(path, data) {
    this._id = path;
    this._data = data;
};
File.prototype = {
    set: function(key, value) {
        this._data[key] = value;
        return this;
    },
    get: function(key) {
        return this._data[key];
    },
    path: function() {
        return this._id
    },
    data: function() {
        return this._data;
    }
};
File.create = function(data) {
    var file = new File();
    file._data = data;
    return file;
}

module.exports = {'Filesystem': Filesystem, 'File': File};
