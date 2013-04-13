var Template = require('../lib/luminous-knockout-template'),
    fs = require('fs');

describe("Luminous Knockout Template loader suite", function() {
    

    var template = new Template();

    //since templates are cached, I have to load all of the templates I'm going to use for all of the templates initially
    var stringTemplate = '<template context="field" writable="yes"><span data-bind="text: {{field}}"/></template><template context="listField" writable="yes"><span data-bind="text: {{field}}"/></template>';

    it("must be able to load templates", function(done) {
        var oldReadFile = fs.readFile;
        spyOn(fs, 'readFile').andCallFake(function(fileName, callback) {
            if (fileName == './template/string.ko') {
                return callback(null, stringTemplate);
            } else if (fileName == './template/form.ko') {
                return callback(null, '<template context="field"><div data-bind="foreach: $data">{{#templates}}{{{this}}}{{/templates}}</div></template>');
            }
            return oldReadFile(fileName, callback);
        });
        template.load('/todo', function(err, template) {
            expect(err).toBeFalsy();
            var expectedResult = '<div data-bind="foreach: $data"><span data-bind="text: title"></span></div>';
            expect(template).toEqual(expectedResult);

            done();
        });
    }, 1000);

    it("must be able to load templates in list context", function(done) {
        var oldReadFile = fs.readFile;
        spyOn(fs, 'readFile').andCallFake(function(fileName, callback) {
            if (fileName == './template/string.ko') {
                return callback(null, stringTemplate);
            } else if (fileName == './template/form.ko') {
                return callback(null, '<template context="listField"><div data-bind="foreach: $data"><div>{{#templates}}{{{this}}}{{/templates}}</div></div></template>');
            }
            return oldReadFile(fileName, callback);
        });
        template.load('/todo', {context: 'listField'}, function(err, template) {
            expect(err).toBeFalsy();
            var expectedResult = '<div data-bind="foreach: $data"><div><span data-bind="text: title"></span></div></div>';
            expect(template).toEqual(expectedResult);

            done();
        });
    });

    it("must be able to render action links", function(done) {
        var oldReadFile = fs.readFile;
        spyOn(fs, 'readFile').andCallFake(function(fileName, callback) {
            if (fileName == './template/string.ko') {
                return callback(null, stringTemplate);
            } else if (fileName == './template/form.ko') {
                return callback(null, '<template context="field"><div data-bind="foreach: $data"><div>{{#templates}}{{{this}}}{{/templates}}{{#item.actions}}{{title}}{{/item.actions}}</div></div></template>');
            }
            return oldReadFile(fileName, callback);
        });
        template.load('/todo', {
            item: {
                actions: [{
                    title: 'Title'
                }]
            }
        }, function(err, template) {
            expect(err).toBeFalsy();
            var expectedResult = '<div data-bind="foreach: $data"><div><span data-bind="text: title"></span>Title</div></div>';
            expect(template).toEqual(expectedResult);

            done();
        });
    });
});
