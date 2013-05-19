function Metadata() {
    this.load = function(typeName, callback) {
    	if (typeName == '/todo') {
	        callback(null, {
	            _id: '/todo',
	            fields: [{
	                field: 'title',
	                type: '/string'
	            }]
	        });
	    } else if (typeName == '/complexTest') {
	    	callback(null, {
	    		_id: '/complexTest',
	    		fields: [{
	    			"field": "stringField",
	    			"type": "/string"
	    		}, {
	    			"field": "complexData",
	    			"type": [{
	    				"field": "subField1",
	    				"type": "/string"
	    			}]
	    		}]
	    	});
	    }
    };
}

module.exports = new Metadata();
