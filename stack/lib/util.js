var _ = require('underscore');

var trace = require('stack-trace');

var util = require('util');

function isScalar(test) {
    return (/boolean|number|string/).test(typeof test);
}

function isObject(test) {
    if (Object.prototype.toString.call(test) === '[object Array]') {
        return false;
    }
    return test !== null && typeof test == 'object';
}

function getClass (obj) {
    if (obj && typeof obj !== 'object' || Object.prototype.toString.call(obj) == '[object Array]' || !obj.constructor) {
        return false;
    }
    var nameMatch = obj.constructor.toString().match(/function\s+([^\(]+)/);

    if (nameMatch && nameMatch.length == 2) {
        return nameMatch[1];
    }
    return false;
}

exports.simpleDump = function(stuff) {
    new Dump().flat(stuff)
    console.log(stuff);
    console.log("@" + trace.get()[1].getFileName(), '#' + trace.get()[1].getLineNumber())
};

/**
 * @type {Function}
 */
var Dump = exports.Dump = function() {
    this.levels = 1;
}

Dump.getSpacing = function(levels) {
    return new Array(levels + 1).join('    ');
};

Dump.prototype.flat = function() {
    new Dump(1)._goes(arguments);
};

Dump.prototype.levels = function() {
    if(arguments.length < 2) {
        throw new Error('Expecting at least 2 arguments');
    }
    new Dump(arguments[0])._goes(arguments.slice[1]);
};

Dump.prototype.all = function() {
    new Dump(100)._goes(arguments);
};

Dump.prototype._goes = function() {
    var dump = this;
    _.each(arguments, function(item) {
        dump._dump(item, 0);
    });
}

Dump.prototype._dump = function(arg, levels) {
    if (arg === true) {
        console.log('true(bool)');
    }
    else if (arg === false) {
        console.log('false(bool)');
    }
    else if (arg === null) {
        console.log('NULL');
    }
    else if(typeof arg == 'number') {
        console.log(util.format('%d(number)', arg))
    }
    else if(typeof arg == 'string') {
        console.log(util.format('%s(string:%d)', arg, arg.length));
    }
    else if(isObject(arg)) {
        console.log(util.format("Object(%s)", getClass(arg)));
    }
};
