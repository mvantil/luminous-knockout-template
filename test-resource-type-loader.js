function TypeLoader() {
    this.load = function(type, callback) {
        callback(null, 'Template data');
    };
}

module.exports = TypeLoader;
