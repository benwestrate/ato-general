'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');


// Constants
var dynamo = new DOC.DynamoDB();


exports.handler = function( event, context, callback ) {

    console.log( event );

    if( !event.hasOwnProperty('claimString') ) makeError('You must provide a device claimString', callback)
    if( !event.hasOwnProperty('buildingId') ) makeError('You must provide a buildingId to claim a device', callback)
    if( !event.hasOwnProperty('deviceName') ) makeError('You must provide a device name to claim a device', callback)
    if( !event.hasOwnProperty('userId') ) makeError('You must provide a userId to claim a device', callback)

    var params = {
        TableName : "ato-devices",
        IndexName: "claimString-index",
        KeyConditionExpression: "#claimString = :claimString",
        ExpressionAttributeNames:{
            "#claimString": "claimString"
        },
        ExpressionAttributeValues: {
            ":claimString": event.claimString
        }
    };


    let cb = function( err, data ) {

        if( err ) makeError( err, callback )
        console.log( data );

        callback(null, data)
    }

    dynamo.query(params, function(err, data) {
        if (err || data.Items.length === 0) {
            makeError(["Unable to query. Error:", JSON.stringify(err, null, 2)], callback)
        } else {
            let device = data.Items[0];
            console.log(data);
            console.log(device);

            if( device.claimed ) makeError('The device you are trying to claim has already been claimed', callback)
            if( !device.claimed ){
                device.claimed            = true;
                device.associatedBuilding = event.buildingId;
                device.name               = event.deviceName;
                device.ownerId            = event.userId;

                console.log( device );

                dynamo.putItem({TableName:"ato-devices", Item:device}, cb);
            }

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
