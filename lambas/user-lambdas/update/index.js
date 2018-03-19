'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');
var uuidGenerator   = require('node-uuid-generator');

// Constants
var dynamo = new DOC.DynamoDB();

exports.handler = function( event, context, callback ) {

    console.log(event);

    var item = {
        id              : event.userId,
        buildings       : event.buildings ? event.buildings : [],
        isParent        : event.isParent ? event.isParent : false,
        familyMembers   : event.familyMembers ? event.familyMembers : [],
        rolls           : event.rolls ? event.rolls : []
    };

    var cb = function(err, data) {
        if(err) {
            console.log(err);
            callback('unable to update user at this time');
        } else {
            console.log(data);
            callback( null, "User " + item.id + " created" );
        }
    };

    if( item.id !== null ){
        dynamo.putItem({TableName:"ato-users", Item:item}, cb);
    }


}
