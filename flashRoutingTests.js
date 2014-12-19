'use strict';
var
	_ = require( 'underscore' ),//
	fs = require( 'fs' ),
	request = require('superagent'),
	expect = require('chai').expect,
	requestsId = -1,
	casesId = 0,
	sufixId = 0,
	now = new Date(),
	year = now.getFullYear(),
	month = now.getMonth() + 1,
	date = now.getDate(),
	dumpPrefix = [
		year,
		lpad( month, 2 ),
		lpad( date, 2 ),
	].join( '-' ) + '+' + [
		lpad( now.getHours(), 2 ),
		lpad( now.getMinutes(), 2 ),
		lpad( now.getSeconds(), 2 )
	].join( '.' ) + '.' + lpad( now.getMilliseconds(), 3 )


exports.defineThese = defineThese;

	function lpad ( n, w, z ) {
		var
			p = ( new Array( w + 1 ) ).join( z || '0' ) + n;

		return p.substr( p.length - w, w );
	}

function defineThese ( configs, casesConfs ) {
	var
		cases = _.find( casesConfs.cases, function ( testcase ) {//tratarde obtener el primero con only
			return testcase.tweak &&  testcase.tweak === 'only';
		});

	cases = cases ? [ cases ] : _.filter( casesConfs.cases, function ( testcase ) {
		return ( typeof testcase.tweak === 'undefined' ) || testcase.tweak !== 'skip';
	});

	_.each( cases, function ( caseConf ) {

		caseConf.id = casesId++;	

		_.each( caseConf.sufixes, function( sufix ) {
			describeSufix( _.extend( { sufixId: sufixId++ }, caseConf, { sufix: sufix } ) );
		})

		function describeSufix( caseConf ) {//TODO: when needed put before and after hooks...
			var

				withRepetitions = ( typeof caseConf.sufix === 'object' ),
				sufix = withRepetitions ? caseConf.sufix.sufix : caseConf.sufix,
				repetition,
				repetitions = withRepetitions ? caseConf.sufix.n : 1;

			if ( typeof repetitions === 'undefined' ) { repetitions = 1; }

			for ( repetition = 0; repetition < repetitions; repetition ++ ) {
				describe(
					'\n caseId: ' + caseConf.id +
					'\n caseName: ' + caseConf.name +
					'\n caseDescription: ' + caseConf.description +
					'\n Sufix: ' + sufix +
					'\n Repetition: ' + repetition +
					'\n requestsId: ' + ( ++requestsId )
					,
					(function ( requestsId ) { 
						return  function (/* done */) { //
							var
								error, res,
								url,
								dumpText,
								executionTime,
								requestConf = _.extend( { requestId: requestsId }, caseConf );

							before( function( done ) {
								var
									apiCallStartedOn,
									apiCallFinishedOn,
									onConfigRequest;
								
								url = configs.routesConf.root + sufix,

								onConfigRequest = request
								.get( url )
								.redirects( ( typeof requestConf.redirects !== 'undefined' ) ?  requestConf.redirects : configs.redirects || 0 )
								.timeout( ( typeof requestConf.httpTimeout !== 'undefined' ) ? requestConf.httpTimeout : configs.httpTimeout || 10000 )
								.set( 'Accept', 'text/html' )								
								.set( 'Accept-Language', 'en-US,en;q=0.8' );

								//global config headers defaults
								_.each( configs.headers, function ( v, k ) {
									onConfigRequest.set( k, v );
								});

								//by case headers confs
								_.each( requestConf.headers, function ( v, k ) {
									onConfigRequest.set( k, v );
								});

								apiCallStartedOn = ( new Date() ).getTime();

								onConfigRequest.end( function( e, r ) {
									error = e;
									res = r;
									dumpText = '';
									apiCallFinishedOn = ( new Date() ).getTime();
									executionTime = ( apiCallFinishedOn - apiCallStartedOn ) / 1000;

									if ( configs.dumpTextTo ) {
										dumpText+='\n--------\nURL:\n' + url;

										dumpText+='\n--------\nexecutionTime:\n' + executionTime;

										dumpText+='\n--------\nSTATUS:\n' + ( ( res ) ? res.statusCode : 'empty response' );

										dumpText+='\n--------\nrequestConf:\n' +
											JSON.stringify( requestConf || false, null, ' ' );

										dumpText+='\n--------\nHEADERS:\n' +
											JSON.stringify( res && res.headers || false, null, ' ' );								

										dumpText+='\n--------\nBODY:\n' +
											( ( res ) ? res.text : 'empty response' )
									}

									done()
								});
							});

							after( function ( done ) {

								if ( configs.dumpTextTo ) {
									var
										logFolder = configs.dumpTextTo + '/' + dumpPrefix,
										logFileName =  logFolder + '/requestId-' + lpad( requestsId, 4 ) + '-' + executionTime + '.txt';

									console.log( 'Creating log folder: ', logFolder );

									fs.mkdir( logFolder, function ( err ) {
										if ( !err || ( err && err.code === 'EEXIST' ) ) {
											console.log( 'Writing request contents to: ', logFileName );
											fs.appendFile(
												logFileName,
												dumpText,
												function (err) {
													if ( err ) {
														console.log( 'Error writing request contents to : ', logFileName, err );
													} else {
														console.log('The data was appended to file: ', logFileName );
													}
												}
											);
										} else {
											console.log( 'Error creating log folder: ', logFolder, err );
										}

										
									});
								}
								done();
							});

							if ( requestConf.expects.statusCode ) {
								it( 'Should have status ' + requestConf.expects.statusCode, function () {
									expect( res ).to.not.be.undefined;
									expect( res.statusCode ).to.equal( requestConf.expects.statusCode );
								});
							}

							if ( requestConf.expects.headers ) {
								var
									headers = requestConf.expects.headers;

								it( 'Should have headers ( ' + _.keys( headers ).join() + ' ) = ( ' + _.values( headers ).join() + ')', function () {
									expect( res ).to.not.be.undefined;
									_.each( headers, function ( v, k ) {
										expect( res.headers[ k ] ).to.not.be.undefined;
										expect( res.headers[ k ] ).to.equal( v );
									});
									
								});
							}					

							if ( requestConf.expects.headerChecks ) {
								it( 'Should compliant headerChecks: ' + requestConf.expects.headerChecks.description, function () {
									expect( res ).to.not.be.undefined;
									requestConf.expects.headerChecks.run( res.headers, requestConf );
								});
							}

							if ( requestConf.expects.bodyChecks ) {
								it( 'Should compliant bodyChecks: ' + requestConf.expects.bodyChecks.description, function () {
									expect( res ).to.not.be.undefined;
									requestConf.expects.bodyChecks.run( res.text, requestConf );
								});
							}

							if ( requestConf.expects.httpTimesCheck ) {
								it( 'Should compliant httpTimesCheck: ' + requestConf.expects.httpTimesCheck.description, function () {
									requestConf.expects.httpTimesCheck.run( url, executionTime, requestConf );
								});
							}

						};
					}( requestsId ))
				);
			};
		}
	});
};
