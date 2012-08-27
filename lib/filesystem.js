var _ = require('underscore');
var dump = require('./util').simpleDump;
var security = require('./security');

var Filesystem = function(url, name) {
    if(url === undefined) {
        url = 'http://localhost:5984';
    }

    this._name = name;
    this._nano = require('nano')(url);
    this.db = this._nano.use(name);
}

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
        this.db.insert(file.toDatabase(), file.path(), function writeFileRequested(error) {
            // check for error
            if(error !== null) {
                callback(error);
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
        this.db.get(path, {'include_docs': true}, function readFileRequested(error, response) {
            if(error !== null) {
                return callback(error, null)
            }
            // create file and call back
            var file = File.fromDatabase(response);
            callback(error, file);
        });
    },

    /**
     * Delete a file from the database
     * @param file
     * @param callback
     */
    deleteFile: function(file, callback) {
        this.db.destroy(file.path(), file.rev(), function deleteFileRequested(error, response) {
            callback(error, response.ok);
        });
    },

    /**
     * Check if a file exists
     * @param path
     * @param callback
     */
    fileExists: function(path, callback) {
        this.db.head(path, function fileExistsRequested(error, body, headers) {
            if(error !== null) {
                return callback(error, null)
            }
            callback(error, headers['status-code'] === 200);
        });
    }
};

/**
 * @param path
 * @param data
 * @constructor
 */
var File = function(path, owner, data) {
    this.owner = owner;

    if(data === undefined) {
        data = {};
    }
    this._id = path;
    this._rev = undefined;
    this.data = data;
    this.permissions = [];
};

File.prototype = {
    /**
     * Set a file property
     * @param key
     * @param value
     * @return {*}
     */
    set: function(key, value) {
        this.data[key] = value;
        return this;
    },
    /**
     * Get a file property
     * @param key
     * @return {*}
     */
    get: function(key) {
        return this.data[key];
    },
    /**
     * Get the file path (which is also the _id)
     * @return {*}
     */
    path: function() {
        return this._id;
    },

    /**
     * Get revision information, undefined if none
     * @return {*}
     */
    rev: function() {
        return this._rev;
    },

    /**
     * Get the whole data of the file
     * @return {*}
     */
    getData: function() {
        return this.data;
    },

    /**
     * Create object ready to be inserted into database.
     * _rev will be written into it if it is defined
     * @return {*}
     */
    toDatabase: function() {
        var doc = {
            data: this.getData(),
            owner: this.owner,
            permissions: this.getPermissions()
        };
        if(typeof this._rev != 'undefined') {
            doc._rev= this._rev;
        }
        return doc;
    },

    addPermission: function(permission) {
        this.permissions.push(permission);
    },

    getPermissions: function() {
        return this.permissions;
    }
};

/**
 * Create a file from document data
 * @param data
 * @return {*}
 */
File.fromDatabase = function(doc) {
    var file = new File();

    // pick out id and rev, and remove them from data
    file._id = doc._id;
    file._rev = doc._rev;

    file.data = doc.data;
    file.owner = doc.owner;
    _.each(doc.permissions, function(permission) {
        file.addPermission(new security.Permission(permission.entity, permission.permission, permission.name));
    });
    return file;
}

module.exports = {'Filesystem': Filesystem, 'File': File};
