var _ = require('underscore');

var tests = {};
_.each(['filesystem', 'security'], function(name) {
    var moduleTests = require('./' + name);
    _.each(moduleTests, function(test, index) {
        tests[name + '_' + index] = test;
    });
});

module.exports = tests;