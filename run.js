'use strict';
var
	_ = require( 'underscore' ),
	flashRoutingTests = require( './flashRoutingTests.js' ),
	configs = global.flashRoutingTests.currentConfigs;

before( function ( done ) {
	if ( configs.before ) {
		configs.before( done )
	} else {
		done();
	}
});

after( function ( done ) {
	if ( configs.after ) {
		configs.after( done )
	} else {
		done();
	}
});

require( 'fs' ).readdirSync( configs.testsFolder + '/batteries' ).forEach( function ( file ) {
	var
		tweak = configs.runTweaks[ file ],
		title = configs.titlePrefix + file,
		testConfigs = require( configs.testsFolder + '/batteries/' + file );



	function run () {
		flashRoutingTests.defineThese( configs, testConfigs );
	}

	if ( tweak ) {
		describe[ tweak ]( title, run );
	} else {
		describe( title, run );
	}
});