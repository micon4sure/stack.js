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
    this.response = response;
};
Error_CouldNotWriteFile = function(response) {
    this.response = response;
};
Error_CouldNotDeleteFile = function(response) {
    this.response = response;
};
Error_CouldNotCheckForFileExists = function(response) {
    this.response = response;
};

// set toString for exception prototypes
Error_CouldNotReadFile.prototype = Error_CouldNotWriteFile.prototype = Error_CouldNotDeleteFile.prototype = Error_CouldNotCheckForFileExists.prototype = {
    toString: function() {
        console.log("ERROR RESPONSE");
        dump(this.response)
    }
};

Filesystem.prototype = {

    /**
     * Destroy the database
     * @param callback
     */
    nuke: function(callback) {
        this._nano.db.destroy(this._name, callback);
    },

    /**
     * Create the database
     * @param callback
     */
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
        this.db.destroy(file.path(), file.rev(), function(error, response) {
            if(error !== null) {
                throw new Error_CouldNotDeleteFile(response);
            }
            callback(response.ok);
        });
    },

    /**
     * Check if a file exists
     * @param path
     * @param callback
     */
    fileExists: function(path, callback) {
        this.db.head(path, function requestCompleted(error, response) {
            if(error !== null && error.status_code != 404) {
                throw new Error_CouldNotCheckForFileExists(error);
            }
            callback(error === null);
        });
    }
};

/**
 * @param path
 * @param data
 * @constructor
 */
var File = function(path, data) {
    if(data === undefined) {
        data = {};
    }
    data._id = path
    this._data = data;
};

File.prototype = {
    /**
     * Set a file property
     * @param key
     * @param value
     * @return {*}
     */
    set: function(key, value) {
        this._data[key] = value;
        return this;
    },
    /**
     * Get a file property
     * @param key
     * @return {*}
     */
    get: function(key) {
        return this._data[key];
    },
    /**
     * Get the file path (which is also the _id)
     * @return {*}
     */
    path: function() {
        return this._data._id;
    },

    /**
     * Get revision information, undefined if none
     * @return {*}
     */
    rev: function() {
        return this._data._rev;
    },

    /**
     * Get the whole data of the file
     * @return {*}
     */
    data: function() {
        return this._data;
    }
};

/**
 * Create a file from document data
 * @param data
 * @return {*}
 */
File.create = function(data) {
    var file = new File();
    file._data = data;
    return file;
}

module.exports = {'Filesystem': Filesystem, 'File': File};
