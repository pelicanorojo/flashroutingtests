# NOTE #

This is a tool I am developing from a couple of years ago as an independent project for testing a restfull api I was developing.

Well, I used and extended this tool in a couple of project, and I was so good, I decide to share and continue its develop in public and free way.

This is the last state, soon I will change the name and enhance the tool and its api, and add the tool to npm.

# README #

flashRoutingTests is a node module loadable via npm, for http routing testing.

### What is this repository for? ###

* This repository have the flashRoutingTests's sources, plus a sample of use in the sample subfolder, that you can use for begin your own tests.

### How do I get set up? ###

* You can use this module how is shown in the main.js inside the sample folder ( your work folder ).
* In your package json, you can declare the flashRoutingTest dependency as "flashroutingtests": "0.1.0" 
* You must provide a (tests/demoGoogleTests in this sample ) folder inside your work folder, and inside it, a batteries folder for the batteries of http calls configuration, and a config.js as a global configuration, where you specify the http root calls, some optional mocha params, etc. 
* the test are triggered with this command line in your workfolder: node main.js -b "tests/demoGoogleTests"               ( -b means battery )

The engine will load your config file and the batteries configurations inside the batteries folder.
### In the latest version, you may install the module globally ###

Note: If you have an EACCES during the installation on Linux, try this:
sudo chown -R $USER /usr/local  ( Extracted from : http://stackoverflow.com/questions/15633029/npm-no-longer-working )

### What can I do in config.js? ###
In the sample there are all general configs used by the engine.
As a recommendation, add your custom configs in the custom property.
In the sample we put a apicall execution times as example.
( See below config.js file example and its description )

### What can I do in batteries ? ###
The batteries allow you define apicalls sufixes, documentation properties like name or description,
hooks, like bodyCheck or httpTimesChecks, etc. ( See below battery file example and its description )

### How to install flashRoutingTests manually ###
If npm install don't work because yo can't set the git credentials, you can put the flashRoutingTest folder module manually inside the node_modules folder or elsewhere.
And in main.js import the module with flashRoutingTests = require( [rootToflashRoutingTestsindex.js] )

With the global installer, you may do this:
go to the folder where you wants the test project
type: frtest -h  and see the help
If you haven't got a project, type: frtest install -d myTestProject -m             -d means destination and -m means multi ( try the different alternatives )
This create a project sample inside myTestProject from which you may start.
Then inside your project you can type: frtest run  or frtest run -b battery1 

### config.js file example and its description ###

```
#!javascript
'use strict';
var
	skip = 'skip',//value you may use in runTweaks for skip a battery file.
	only = 'only',//value you may use in runTweaks for run only a espefied battery file.
	none = '',
	configs = {
		errorStackDepth: 2, //gives you control over the errors stack depth. Is optional, and its default is 1.
		//before: function ( done ) {}, hook that is called at the begin, you can trigger a login for example
		//after: function ( done ) {}, hook that is called at the end, you can send the report to a server for example.
		after: function ( done ) {// A hook that is called after end the tests
			console.log( 'ApiCallTimes:', JSON.stringify( this.custom.apiCallTimes, null, ' ' ) );
			done();
		},
		mochaConfigs: {// Configs forwarded to mocha.js
			reporter: 'spec',
			slow: 100,
			timeout: 30000
		},
		testsFolder : __dirname, // An automatic way to say where is this battery
		routesConf: {
			root: 'https://translate.google.com' // The engine expect these for make the http request. 
		},
		dumpTextTo: dumps,//optional folder where a response dump will be done.
		redirects: 0,// Is set, is used to define how many redirects to do, If you need to analyze 30x status, needs a 0. ( Overrideable in the batteries )
		httpTimeout: 60000, // Is the http response is to slow, this functions as a timeout. ( Overrideable in the batteries )
		httpTimeCheckThresholds: 0.4, // You can use this in httpTimesCheck hook to check response timing
		headers: { //You may put here headers to send in the request ( Overrideable in the batteries )
			'Accept': 'text/html',
			'Accept-Language': 'en-US,en;q=0.8'
		},
		runTweaks: {// You can define here if you wants to skip some battery or run one as only battery
			'home.config.js': none
		},
		custom: {//This is an example, where we put values in order to log they at the end. Try to put your custom configs inside custom property
			apiCallTimes: []
		}
	}

configs.titlePrefix = configs.routesConf.root + ' routing test: '; //The engine use this for the global name

module.exports = configs; //The engine expect you export the configs
```

### Battery example file description ###

```
#!javascript
'use strict';
var
	_ = require( 'underscore' ), // you may add libraries like underscore if needed. In this example is installed in the package.json
	expect = require( 'chai' ).expect,// you may use chai for expects. In this example is installed.....
	configs = global.flashRoutingTests.currentConfigs, //When the engine find your config.js, load it and pass this object to you in global.flashRoutingTests.currentConfigs
	root = configs.routesConf.root; // The engine use routesConf.root for make the http requests. ( The engine concatenates this with the sufix in the batteries cases )

var
	cases;

cases = [
	{
		name: 'Basic body Check.', //the name for this case
		description: 'Checks, status code, server http headers, and html title.', //the description for these case
		sufixes: [ '/?sufijo1', { sufix: '/?sufijo2', n: 3 ], //sufixes to try ( are concatenated with routesConf.root,
                // each sufix may be a string, or an object in order to specify repetitions ( n ( its default is 0 ) )
		expects: {//For each sufix, run these expexts
			statusCode: 200, //check the http status if you want
			headers: { 'server': 'HTTP server (unknown)' }, //check headers if you want
			httpTimesCheck: {// Hook for http request timing
				run: function ( url, time, caseConf ) {// The engine expect the run function and pass to you the url, the time,
                                        //and a caseConf Copy. You may use the automatic requestId in order to identify each requestID and cross data.
					//console.log( '\nDEBUG TIMECHECK: ', configs.httpTimeCheckThresholds, time, url );
					configs.custom.apiCallTimes.push( { requestId: caseConf.requestId, url: url, time: time } );//In this example we save this data in config.custom.apiCallTimes
					expect( time ).to.be.below( configs.httpTimeCheckThresholds );//Also we check the timing is ok
				},
				description: 'Check the body is de translate.google.com one.'//Description for this timing check.
			},
			bodyChecks: {// Hook for check the response body
				run: function ( body, caseConf ) { // The engine expect the run function and pass to you the raw body, and a caseConf Copy
                                        //you may use the automatic requestId in order to identify each requestID and cross data.
                                        //In the current case, I know that the correct response must contain a html fragment title
					expect( body.indexOf( '<title>Google Translate</title>' ) ).to.not.equal( -1 );
                                        // If you expect a json you can declare: var obj = JSON.parse( body ) .
				},
				description: 'Check the body is de translate.google.com one.' //
			}
		}
	}
];

exports.cases = cases; // The engine expect you export an array cases

```
