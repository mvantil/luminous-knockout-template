var Luminous = require('Luminous');
var luminous = new Luminous();

describe("Luminous Knockout Template loader suite", function() {
    it("must be able to load complex types", function(done) {
        luminous.template.load('/complexTest', function(err, result) {
            expect(err).toBeFalsy();
            var expectedResult = '<div data-bind="foreach: $data"><span data-bind="text: stringField"/><span data-bind="text: subField1"/></div>';
            expect(result).toEqual(expectedResult);
            done();
        })
    }, 1000);

    it("must be able to load templates", function(done) {
        luminous.template.load('/todo', function(err, template) {
            expect(err).toBeFalsy();
            var expectedResult = '<div data-bind="foreach: $data"><span data-bind="text: title"/></div>';
            expect(template).toEqual(expectedResult);

            done();
        })
    }, 1000);

    it("must be able to render a specific context", function(done) {
        luminous.template.load('/todo', {
            context: 'modifySuffix'
        }, function(err, template) {
            expect(err).toBeFalsy();
            var expectedResult = '<div data-bind="foreach: $data"><span data-bind="text: title_modified"/></div>';
            expect(template).toEqual(expectedResult);

            done();
        })
    }, 1000);

    it("must be able to render action links", function(done) {
        luminous.template.load('/todo', {
            item: {
                actions: [{
                    title: 'Title'
                }]
            }
        }, function(err, template) {
            expect(err).toBeFalsy();
            var expectedResult = '<div data-bind="foreach: $data"><span data-bind="text: title"/>Title</div>';
            expect(template).toEqual(expectedResult);

            done();
        });
    }, 1000);
});
