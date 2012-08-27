var _ = require('underscore');
var dump = require('./util').simpleDump;

exports.PRIVILEDGE = PRIVILEDGE = {
    READ: 'r',
    WRITE: 'w',
    EXECUTE: 'x'
}

exports.ENTITY = ENTITY = {
    USER: 'u',
    GROUP: 'g',
    ALL: 'a'
}

exports.Permission = function(entity, priviledge, name) {
    this.priviledge = priviledge;
    this.entity = entity;
    this.name = name;
}

/**
 * AnonymousSecurity is for non-logged-in users
 * @type {Function}
 */
exports.AnonymousSecurity = AnonymousSecurity = function() {

}
/**
 * Check a file for permission
 * Will only return true if entity is ALL
 * @param file
 * @param priviledge
 */
AnonymousSecurity.prototype.checkFilePermission = function(file, priviledge) {
    var found = false;
    _.each(file.getPermissions(), function(permission) {
        if(permission.priviledge != priviledge) {
            // not the requested priviledge
            return;
        }

        if(permission.entity == ENTITY.ALL) {
            found = true;
        }
    });
    return found;
}

/**
 * PriviledgedSecurity for when you need to override security
 * @type {Function}
 */
exports.PriviledgedSecurity = PriviledgedSecurity = function() {

}
/**
 * Check a file for permission
 * Will always return true
 * @param file
 * @param priviledge
 */
PriviledgedSecurity.prototype.checkFilePermission = function(file, priviledge) {
    return true;
}

/**
 * UnpriviledgedSecurity for when you want to make sure nobody has access
 * @type {Function}
 */
exports.UnpriviledgedSecurity = UnpriviledgedSecurity = function() {

}
/**
 * Check a file for permission
 * Will always return false
 * @param file
 * @param priviledge
 */
UnpriviledgedSecurity.prototype.checkFilePermission = function(file, priviledge) {
    return false;
}