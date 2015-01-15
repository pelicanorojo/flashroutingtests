'use strict';
var	
	fs = require ( 'fs' ),
	argv = require( 'optimist' )
	.alias( 'b', 'batteryConfig' )
	.argv,
	configsFile,
	configs,
	flashRoutingTests = require( 'flashroutingtests' );

configsFile = './tests' + ( argv.b ? '/' + argv.b : '' ) + '/configs.js'

if ( fs.existsSync( configsFile )) { 
	configs = require( configsFile );
	flashRoutingTests( configs );
} else {
	console.log ( 'ERROR: The test\'s config file ' + configsFile + ' doesn\'t exists.' );
	configs = {};
}