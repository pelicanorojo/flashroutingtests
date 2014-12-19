'use strict';
var	
	_ = require( 'underscore' ),
	chai = require('chai'),
	oldconsoleError = console.error,
	errorStackDepth = 1;

console.error = function () {//fmt, i, title, msg, stack
	var
		args = Array.prototype.slice.call( arguments, 0 ),
		stack = args[ 4 ];

	if ( stack ) {
		args[ 4 ] = stack.split( '\n' ).slice( 0, errorStackDepth ).join( '\n' );
	}

	oldconsoleError.apply( console, args );
};

global.flashRoutingTests = global.flashRoutingTests || {};
global.flashRoutingTests.chai = chai;

module.exports = function ( configs ) {
	var
		Mocha = require( 'mocha'),
		mocha = new Mocha( _.extend( {}, configs.mochaConfigs ) );

	global.flashRoutingTests.mocha = mocha;
	global.flashRoutingTests.currentConfigs = configs;
	errorStackDepth = ( typeof configs.errorStackDepth !== 'undefined' ) ? configs.errorStackDepth : errorStackDepth;

	mocha.addFile( __dirname + '/run.js' );

	mocha.run( function( failures ) {
		process.on( 'exit', function () {
		process.exit( failures );
		});
	});
};
	
