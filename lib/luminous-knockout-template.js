var async = require('async'),
    _ = require('underscore'),
    config = require('luminous-server-config'),
    templateLoader = config.loadModule('templateLoader'),
    typeLoader = config.loadModule('metadata');

function Template() {
	var me = this;

	function renderCallback(metadata, options, callback) {
		var fieldList = _.chain(metadata)
		.filter(function(item) {
			return !item.context || item.context == options.context;
		})
		.value();

		async.map(fieldList, function(field, callback) {
			var templateType = field.type instanceof Array ? '/complexType' : field.type;
			loadTemplate(templateType, field, options, callback);
		}, function(err, results) {
			if (err) return callback(err);

			callback(null, joinString(results));
		});
	}

	function joinString(stringArray) {
		var output = '';
		_.each(stringArray, function(item) {
			output += item;
		});
		return output;
	}

	function loadTemplate(typeName, metadata, options, callback) {
		templateLoader.load(typeName, options, function(templateErr, renderer) {
			if (templateErr) return callback(templateErr);
			renderer.render(metadata, {
				render: renderCallback,
				done: callback,
				templateOptions: options
			});
		});
	}

	this.load = function(typeName, options, callback) {
		if (typeof options == 'function') {
			callback = options;
			options = {};
		}

		typeLoader.load(typeName, function(err, metadata) {
			if (err) return callback(err);
			if (!metadata) return callback(new Error('Could not find metadata for ' + typeName));

			loadTemplate(typeName, metadata, options, callback);
		});
	};
}

module.exports = new Template();
