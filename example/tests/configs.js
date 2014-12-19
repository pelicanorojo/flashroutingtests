'use strict';
var
	skip = 'skip',
	only = 'only',
	none = '',
	configs = {
		//before: function ( done ) {}, hook that is called at the begin, you can trigger a login for example
		//after: function ( done ) {}, hook that is called at the end, you can send the report to a server for example.
		after: function ( done ) {
			console.log( 'ApiCallTimes:', JSON.stringify( this.custom.apiCallTimes, null, ' ' ) );
			done();
		},
		mochaConfigs: {
			reporter: 'spec',
			slow: 100,
			timeout: 30000
		},
		testsFolder : __dirname,
		routesConf: {
			root: 'https://translate.google.com'
		},
		redirects: 0,
		httpTimeout: 60000,
		httpTimeCheckThresholds: 0.4,
		headers: {
			'Accept': 'text/html',
			'Accept-Language': 'en-US,en;q=0.8'
		},
		runTweaks: {
			'home.config.js': none
		},
		custom: {//This is an example, where we put values in order to log they at the end.
			apiCallTimes: []
		}
	}

configs.titlePrefix = configs.routesConf.root + ' routing test: ';

module.exports = configs;
