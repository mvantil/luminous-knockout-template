var Template = require('../lib/luminous-knockout-template'),
    fs = require('fs');

describe("Luminous Knockout Template loader suite", function() {
    var template = new Template();

    it("must be able to load templates", function(done) {
        var oldReadFile = fs.readFile;
        spyOn(fs, 'readFile').andCallFake(function(fileName, callback) {
            if (fileName == './template/string.ko') {
                return callback(null, '<template context="field"><span data-bind="text: {{field}}"/></template><template context="field" writable="yes"><span data-bind="text: {{field}}"/></template>');
            } else if (fileName == './template/form.ko') {
                return callback(null, '<div data-bind="foreach: $data">{{#this}}{{{this}}}{{/this}}</div>');
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
});
