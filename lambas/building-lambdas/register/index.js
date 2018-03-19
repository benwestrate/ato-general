'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');
var uuidGenerator   = require('node-uuid-generator');
var zipcodes        = require('zipcodes');
var geocoder        = require('geocoder');

// Constants
var dynamo = new DOC.DynamoDB();

exports.handler = function( event, context, callback ) {

    console.log(event);

    let missingParams = checkAllParamsForValiditity( event );

    if( missingParams.length > 0 ){
        makeError( missingParams, callback );
    }

    var item = {
        id                  : uuidGenerator.generate(),
        ownerId             : event.userId,
        ownerFaimliyId      : event.familyId ? event.familyId : null,
        name                : event.name,
        lat                 : event.lat || null,
        long                : event.long || null,
        streetAddress       : event.streetAddress,
        state               : null,
        city                : null,
        zipCode             : event.zipCode,
        events              : event.events || [],
        subscribed          : event.subscribed || [],
        fullLocationInfo    : null
    };

    var locationInfo = zipcodes.lookup(item.zipCode);

    item.state  = locationInfo.state;
    item.city   = locationInfo.city;

    geocoder.geocode(item.streetAddress + ", " + item.state, function ( err, data ) {

        item.fullLocationInfo = data.results[0];
        item.lat              = item.fullLocationInfo.geometry.location.lat
        item.long             = item.fullLocationInfo.geometry.location.lng

        var cb = function(err, data) {
            if(err) {
                console.log(err);
                makeError([item,'Unable to create building at this time'], callback);
            } else {
                console.log(data);
                callback( null, { id: item.id } );
            }
        };

        console.log(item);


        if( item.name !== null ){
            dynamo.putItem({TableName:"ato-buildings", Item:item}, cb);
        }
    });


}

function makeError( error, callback ) {

    var errorObj = {
      "reason": "client_error",
      "errors": error
    }

    callback( JSON.stringify( errorObj ) )
}

function checkAllParamsForValiditity( params ) {

    let missingParams = [];

    if( !params.hasOwnProperty('userId') ) missingParams.push('Missing the user id to tie this building to. Please provide the param "userId"')
    if( !params.hasOwnProperty('name') ) missingParams.push('Missing the building name. Please provide the param "name"')
    if( !params.hasOwnProperty('streetAddress') ) missingParams.push('Missing the street adress. Please provide the param "streetAddress"')
    if( !params.hasOwnProperty('zipCode') ) missingParams.push('Missing the zip code. Please provide the param "zipCode"')

    return missingParams;
}
