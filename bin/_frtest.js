#!/usr/bin/env node
'use strict';
/** Inspired in: https://github.com/visionmedia/mocha/blob/master/bin/mocha
 * Module dependencies.
 */

var
	_ = require( 'underscore' ),
	cwd = process.cwd(),
	program = require( 'commander' );

program
	.version( '0.0.1' )
	.usage( '[command] [options]' )
	.option( '-d, --destination <path>', 'Destination folder.')
	.option( '-f, --force', 'Force files override.')
	.option( '-m, --multibattery', 'Create a scaffold with prepeared for multi battery tests' )
	.option( '-b, --battery <path>', 'A battery with its config.js, and batteries folder.');

program.name = 'frtest';

program
	.command( 'install' )
	.description( 'Create a scaffold flashRoutingTest project in the specified destination folder.' )
	.action( function ( ) {
		var	
			fs = require( 'fs' ),
			fsSync = require ( 'fs-sync' ),
			exec = require('child_process').exec,
			child,
			list,
			sampleFolder = __dirname + '/../example',
			destFolder = cwd + '/' + ( program.destination ? program.destination : 'frtestsample' ),
			force = !!program.force,
			multiBattery = program.multibattery,
			options = {
				force: force
			},
			npm = require( 'npm' ),
			lastMessage = [
				'When ready, you can try the sample entering in the sample folder, and writing: frtest run ',
				'Also you can use it manually running: node main.js ',
				'The main.js is a start point main file, and you could extend it, and packge.json too.',
				' (remember run npm install in the last case)'
			];


		console.log( 'Creating scaffold in: ' + destFolder );
		console.log( 'Override files if exist: ' +  force );

		fsSync.copy( sampleFolder, destFolder, options );

		if ( !fs.existsSync( destFolder + '/node_modules' ) ) {
			fs.mkdirSync( destFolder + '/node_modules' );
		}

		if ( multiBattery ) {
			console.log( 'Preparing for multibattery...' );
			if ( !fs.existsSync( destFolder + '/tests/battery1' ) ) {
				fs.mkdirSync( destFolder + '/tests/battery1' );
			}

			fsSync.copy( destFolder + '/tests', destFolder + '/tests/battery1', options );
			fsSync.remove( destFolder + '/tests/batteries' );
			fsSync.remove( destFolder + '/tests/configs.js' );
		}

		console.log( 'Installing npm dependencies...' );

		process.chdir( destFolder );

		child = exec('npm install',   function ( error, stdout, stderr ) {
			if ( !error ) {
				if ( !fs.existsSync( destFolder + '/node_modules/flashRoutingTests' ) ) {
					fs.symlinkSync( __dirname + '/../', destFolder + '/node_modules/flashRoutingTests', options );
				}				
				
				console.log( lastMessage.join( '\n') );				
			} else {
				console.log( 'Error while npm install: ' + error );
			}
		}).stderr.pipe( process.stderr );
	});

program
	.command( 'run' )
	.description( 'Run the tests specified by the configurations file.' )
	.action( function () {
		var	
			fs = require ( 'fs' ),
			batteryRoot = program.battery ? '/' + program.battery : '',
			configsFile = cwd + batteryRoot + '/configs.js',
			configs,
			flashRoutingTests = require( 'flashRoutingTests' );

		if ( !fs.existsSync( configsFile )) { 
			configsFile = cwd + '/tests' + batteryRoot +'/configs.js';
		}

		if ( fs.existsSync( configsFile )) { 
			console.log( 'General config.js file to use: ' + configsFile );
			configs = require( configsFile );
			flashRoutingTests( configs );
		} else {
			console.log ( 'ERROR: The test\'s config file ' + configsFile + ' doesn\'t exists.' );
		}		
	});

program.parse( process.argv );	