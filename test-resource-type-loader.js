var fs = require('fs');

function TypeLoader() {
    this.load = function(type, callback) {
    	fs.readFile('./template' + type + '.ko', callback);
    };
}

module.exports = TypeLoader;
