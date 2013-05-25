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
			return !item.context || item.context == metadata.context;
		})
		.value();

		async.map(fieldList, function(field, callback) {
			if (Object.prototype.toString.call(field.type) == '[object Array]') {
				async.map(field.type, function(subField, callback) {
					loadTemplate(subField.type, subField, options, callback);
				}, function(err, results) {
					if (err) return callback(err);

					callback(null, joinString(results));
				});
			} else {
				loadTemplate(field.type, field, options, callback);
			}
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
