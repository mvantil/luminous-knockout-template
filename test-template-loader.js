var config = require('luminous-server-config'),
	TemplateRenderer = config.loadModule('templateRenderer');

function TemplateLoader() {
	this.load = function(typeName, options, callback) {
		if (typeName == '/string' && options != null && options.context == 'modifySuffix') {
			return callback(null, new TemplateRenderer('{{#display}}<b>{{this}}</b>: {{/display}}<span data-bind="text: {{field}}_modified"/>'));
		}
		if (options != null && options.context == 'modifySuffix') {
			return callback(null, new TemplateRenderer('<div data-bind="foreach: $data">{{render fields}}{{#item.actions}}{{title}}{{/item.actions}}</div>'));
		}
		else if (typeName == '/string') {
			return callback(null, new TemplateRenderer('{{#display}}<b>{{this}}</b>: {{/display}}<span data-bind="text: {{field}}"/>'));
		}
		return callback(null, new TemplateRenderer('<div data-bind="foreach: $data">{{render fields \'context:listField\'}}{{#item.actions}}{{title}}{{/item.actions}}</div>'));
	};
}

module.exports = new TemplateLoader();