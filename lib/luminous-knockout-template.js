var Luminous = require('luminous-base'),
    Config = Luminous.Config,
    EventEmitter = require('events').EventEmitter,
    async = require('async'),
    _ = require('underscore'),
    Handlebars = require('handlebars'),
    fs = require('fs');

function Template() {
    var emitter = new EventEmitter();
    var config = new Config();
    var typeResourceLoader;
    var metadataLoader;

    var typeLookup = {};
    var typeLoadEmitter = new EventEmitter();

    config.load(function(err, data) {
        if (!data || !data.modules) {
            err = new Error("Type Resource and metadata modules must be defined in configuration for knockout template engine.");
        }
        else if (!data.modules.typeResource) {
            err = new Error("Type Resource module must be defined in configuration for knockout template engine.");
        }
        else if (!data.modules.metadata) {
            err = new Error("Metadata module must be defined in configuration for knockout template engine.");
        }
        else {
            try {
                var classFunction = require(data.modules.typeResource);
                typeResourceLoader = new classFunction();

                classFunction = require(data.modules.metadata);
                metadataLoader = new classFunction();
            }
            catch (e) {
                err = e;
            }
        }

        emitter.emit('configLoaded', err, data);
        emitter.on('newListener', function(eventName, listener) {
            if (eventName == 'configLoaded') {
                listener(err, data);
            }
        });
    });

    this.load = function(type, callback) {
        if (!type || !type.length) {
            throw new Error('Missing type');
        }
        if (!callback) {
            throw new Error('Template loader must be called with a callback');
        }

        emitter.once('configLoaded', function(err, config) {
            if (err) return callback(err);

            metadataLoader.load(type, function(err, metadata) {
                if (err) return callback(err);

                loadTemplate(metadata, function(templateInfo) {
                    var htmlResult = renderTemplate(templateInfo);
                    callback(null, htmlResult);
                });
            });
        });
    };

    function renderTemplate(templateInfo) {
        var html = '<div data-bind="foreach: $data">';
        _.each(templateInfo, function(templateInfo) {
            html += templateInfo.template;
        });
        html += '</div>';
        return html;
    }

    function loadTemplate(metadata, callback, context) {
        var loadEmitter = new EventEmitter();
        var templateInfo = [];

        var queue = async.queue(function(fieldInfo, callback) {
            loadEmitter.once(fieldInfo.loadEvent, function() {
                callback();
            });
        }, 10);
        queue.drain = function() {
            if (context && context.callback) {
                context.callback(templateInfo);
            }
            else {
                callback(templateInfo);
            }
        };

        //can I change this to async.each instead of using draing?
        _.each(metadata.fields, function(field, index) {
            var fieldInfo = {
                field: field,
                loadEvent: 'templateLoad_' + index
            };

            templateInfo.push(fieldInfo);
            queue.push(fieldInfo);

            if (field.type.length > 1 && typeof field.type == 'object') {
                me.load({
                    writable: metadata.writable,
                    fields: field.type
                }, callback, {
                    callback: function(templateInfo) {
                        fieldInfo.template = '<div data-bind="foreach: ' + field.field + '"><div>';
                        _.each(templateInfo, function(templateInfo) {
                            fieldInfo.template += templateInfo.template;
                        });
                        fieldInfo.template += '</div></div>';

                        loadEmitter.emit(fieldInfo.loadEvent, templateInfo);
                    }
                });
                return;
            }

            var writable = (typeof field.writable  == 'undefined' && typeof metadata.writable == 'undefined')
                || field.writable || (metadata.writable && typeof(field.writable) == 'undefined');

            getTemplateInfo(fieldInfo, context ? 'listField' : 'field', writable, function() {
                loadEmitter.emit(fieldInfo.loadEvent);
            });
        });
    }

    function getTemplateInfo(fieldInfo, context, writable, callback) {
        typeLoadEmitter.once(fieldInfo.field.type, function() {
            if (typeLookup[fieldInfo.field.type][context]
                && typeLookup[fieldInfo.field.type][context][writable]) {

                var html = typeLookup[fieldInfo.field.type][context][writable];
                fieldInfo.template = Handlebars.compile(html)(fieldInfo.field);
                callback();
            }
        });

        if (!typeLookup[fieldInfo.field.type]) {
            typeLookup[fieldInfo.field.type] = {
                loading: true
            };
            fs.readFile('./template' + fieldInfo.field.type + '.ko', function(err, content) {
                if (err) throw err;
                content = content.toString();
                var typeMap = {};

                var jsdom = require('jsdom');
                jsdom.env({
                    html: content,
                    done: function(err, result) {
                        _.each(result.document.body.children, function(child) {
                            var context = child.getAttribute('context');
                            var writable = child.getAttribute('writable') == 'yes';

                            if (!typeMap[context]) {
                                typeMap[context] = {};
                            }
                            typeMap[context][writable] = child.innerHTML;
                        });
                        typeLookup[fieldInfo.field.type] = typeMap;
                        typeLoadEmitter.emit(fieldInfo.field.type);
                    }
                });
            });
        }
        else if (!typeLookup[fieldInfo.field.type].loading){
            typeLoadEmitter.emit(fieldInfo.field.type);
        } else {
        }
    }
}

module.exports = Template;