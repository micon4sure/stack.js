var dump = require('../lib/util').simpleDump;
var fs = require('../lib/filesystem.js');
var security = require('../lib/security.js');

exports.testAnonymousSecurity = function (test) {
    var file = new fs.File('/foo');
    var anonymous = new security.AnonymousSecurity();

    test.ok(anonymous.checkFilePermission(file, security.PRIVILEDGE.READ) === false);

    file.addPermission(new security.Permission(security.ENTITY.ALL, security.PRIVILEDGE.READ));

    test.ok(anonymous.checkFilePermission(file, security.PRIVILEDGE.READ));

    test.done();
};

exports.testPriviledgedSecurity = function (test) {
    var file = new fs.File('/foo');
    var priviledged = new security.PriviledgedSecurity();

    test.ok(priviledged.checkFilePermission(file, security.PRIVILEDGE.READ));
    test.done();
};

exports.testUnpriviledgedSecurity = function (test) {
    var file = new fs.File('/foo');
    var unpriviledged = new security.UnpriviledgedSecurity();

    test.ok(unpriviledged.checkFilePermission(file, security.PRIVILEDGE.READ) === false);
    test.done();
};