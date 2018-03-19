'use strict';
// NPM Modules
var AuthenticationClient = require('auth0').AuthenticationClient;


var auth0 = new AuthenticationClient( {
  domain    : 'benwestrate.auth0.com',
  clientId  : '<KEY GOES HERE/>'
} );

let policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1459758003000",
            "Effect": "Allow",
            "Action": [
                "execute-api:Invoke"
            ],
            "Resource": [
                "arn:aws:execute-api:*"
            ]
        }
    ]
}

// extract and return the Bearer Token from the Lambda event parameters
function getToken ( params ) {

    var tokenString = params.authorizationToken ? params.authorizationToken : '';
    var match       = tokenString.match( /^Bearer (.*)$/ );

    if ( ! params.type || params.type !== 'TOKEN' ) {
        throw new Error( "Expected 'event.type' parameter to have value TOKEN" );
    }

    if ( !tokenString ) {
        throw new Error( "Expected 'event.authorizationToken' parameter to be set" );
    }

    if ( ! match || match.length < 2 ) {
        throw new Error( "Invalid Authorization token - '" + tokenString + "' does not match 'Bearer .*'" );
    }

    return match[1];
}

var getPrincipalId = function( userInfo ) {
    if ( ! userInfo || ! userInfo.user_id ) {
        throw new Error( "No user_id returned from Auth0" );
    }
    console.log( 'Auth0 authentication successful for user_id ' + userInfo.user_id );

    return userInfo.user_id;
}

function makeAuthorization ( principalId ) {
    console.log( principalId );
    return {
        principalId     : principalId,
        policyDocument  : policy
    }
}


exports.handler = function( event, context, callback ) {

    console.log(event);

    let token = getToken( event );

    auth0.tokens.getInfo( token ).
        then( (auth0return) => {
            var authorizer = makeAuthorization( getPrincipalId( auth0return ) );
            authorizer.context = {
                user : auth0return
            }
            callback( null, authorizer )
        } ).catch( (err) => {
            callback(err);
        } )

}
