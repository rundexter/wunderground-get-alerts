var _ = require('lodash'),
    request = require('request'),
    util = require('./util.js');

var apiURL = 'http://api.wunderground.com/api/';

var pickInputs = {
        'country': 'country',
        'city': 'city'
    },
    pickOutputs = {
        'type': {
            keyName: 'alerts',
            fields: ['type']
        },
        'description': {
            keyName: 'alerts',
            fields: ['description']
        },
        'date': {
            keyName: 'alerts',
            fields: ['date']
        },
        'expires': {
            keyName: 'alerts',
            fields: ['expires']
        },
        'message': {
            keyName: 'alerts',
            fields: ['message']
        }
    };

module.exports = {

    /**
     * Get auth data.
     *
     * @param step
     * @param dexter
     * @returns {*}
     */
    authorizeRequest: function (dexter) {

        if(!dexter.environment('wunderground_api_key')) {

            this.fail('A [wunderground_api_key] environment variable is required for this module');

            return false;
        } else {

            request = request.defaults({
                baseUrl: apiURL.concat(_(dexter.environment('wunderground_api_key')).toString().trim())
            });

            return true;
        }
    },

    /**
     * Check correct inputs data.
     *
     * @param step
     * @param pickInputs
     * @returns {*}
     */
    checkInputStruct: function (step, pickInputs) {
       var requestData = util.pickStringInputs(step, pickInputs),
            uriData = [];

        if (requestData.country)
            uriData.push(requestData.country);

        if (requestData.city)
            uriData.push(requestData.city);

        if (requestData.state)
            uriData.push(requestData.state);


        if (uriData.length < 2) {

            this.fail('A [country,city or state] inputs need for this module.');

            return false;
        }

        return uriData;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var uriData = this.checkInputStruct(step, pickInputs),
            uri = 'alerts/q/' + uriData.join('/') + '.json';

        if (!this.authorizeRequest(dexter) || !uriData)
            return;


        request.get({uri: uri, json: true}, function (error, response, data) {

            if (error)
                this.fail(error);

            else if (data.error)
                this.fail(data.error);

            else if (response.statusCode !== 200)
                this.fail(response.statusCode + ': Something is happened');

            else
                this.complete(util.pickResult(data, pickOutputs));
        }.bind(this));
    }
};
