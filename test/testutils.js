var dump = require('../lib/util').simpleDump;

exports.ifError = function(err) {
    if(err !== null) {
        dump(err)
        console.trace()
        throw err;
    }
}