'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');
var uuidGenerator   = require('node-uuid-generator');

// Constants
var dynamo = new DOC.DynamoDB();

exports.handler = function( event, context, callback ) {


    var item = {
        id              : event.id,
        givenName       : event.givenName,
        familyName      : event.familyName,
        phoneNumber     : event.phoneNumber,
        isSimpleAccount : event.isSimpleAccount ? event.isSimpleAccount : false,
        socialInfo      : event.socialInfo ? event.socialInfo : {},
        buildings       : event.buildings ? event.buildings : []
    };

    if( !event.id && !event.isSimpleAccount )   callback('please include id for a valid registration');
    if( !event.givenName )                      callback('please include givenName for a valid registration');
    if( !event.familyName )                     callback('please include familyName for a valid registration');
    if( !event.phoneNumber )                    callback('please include phoneNumber for a valid registration');

    // TODO: need to make some kind of check here to verify that we are not adding multiple of the same person
    if( item.isSimpleAccount ) { 
        if( !event.creatorId ) callback('please include creatorId for a valid registration of a simple account');
        item.creatorId = event.creatorId;
        item.id = 'simple-' + uuidGenerator.generate();

        delete item.socialInfo
        delete item.buildings
    }

    var cb = function(err, data) {
        if(err) {
            console.log(err);
            callback('unable to update devices at this time');
        } else {
            console.log(data);
            callback( null, { user : item.id, message : "User " + item.id + " created" });
        }
    };


    if( item.id !== null ){
        dynamo.putItem({TableName:"ato-users", Item:item}, cb);
    }

    


}
