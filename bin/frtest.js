#!/usr/bin/env node

/** Inspirede in: https://github.com/visionmedia/mocha/blob/master/bin/mocha
 *	
 * This tiny wrapper file checks for known node flags and appends them
 * when found, before invoking the "real" _frtest(1) executable.
 */

var
	spawn = require('child_process').spawn,
	args = [ __dirname + '/_frtest' ];

process.argv.slice( 2 ).forEach( function( arg ) {
	args.push( arg );
});

/*
process.argv.slice(2).forEach(function(arg){
	var flag = arg.split('=')[0];

	switch (flag) {
		case '-d':
		args.unshift('--debug');
		args.push('--no-timeouts');
		break;
		case 'debug':
		case '--debug':
		case '--debug-brk':
		args.unshift(arg);
		args.push('--no-timeouts');
		break;
		case '-gc':
		case '--expose-gc':
		args.unshift('--expose-gc');
		break;
		case '--gc-global':
		case '--harmony':
		case '--harmony-proxies':
		case '--harmony-collections':
		case '--harmony-generators':
		case '--no-deprecation':
		case '--prof':
		case '--throw-deprecation':
		case '--trace-deprecation':
		args.unshift(arg);
		break;
		default:
		if (0 == arg.indexOf('--trace')) args.unshift(arg);
		else args.push(arg);
		break;
	}
});
*/
var proc = spawn( process.argv[0], args, { customFds: [0,1,2] } );
proc.on('exit', function (code, signal) {
	process.on('exit', function(){
		if (signal) {
			process.kill(process.pid, signal);
		} else {
			process.exit(code);
		}
	});
});