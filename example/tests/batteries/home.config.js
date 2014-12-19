'use strict';
var
	_ = require( 'underscore' ),
	expect = require( 'chai' ).expect,
	configs = global.flashRoutingTests.currentConfigs,
	root = configs.routesConf.root;

var
	cases;

cases = [
	{
		name: 'Basic body Check.',
		description: 'Checks, status code, server http headers, and html title.',
		sufixes: [ '/?sufijo1', '/?sufijo2' ],
		expects: {
			statusCode: 200,
			headers: { 'server': 'HTTP server (unknown)' },
			httpTimesCheck: {
				run: function ( url, time ) {
					//console.log( '\nDEBUG TIMECHECK: ', configs.httpTimeCheckThresholds, time, url );
					configs.custom.apiCallTimes.push( { url: url, time: time } );
					expect( time ).to.be.below( configs.httpTimeCheckThresholds );					
				},
				description: 'Check the body is de translate.google.com one.'
			},
			bodyChecks: {
				run: function ( body ) {
					expect( body.indexOf( '<title>Google Translate</title>' ) ).to.not.equal( -1 );
				},
				description: 'Check the body is de translate.google.com one.'
			}
		}
	}
];

exports.cases = cases;