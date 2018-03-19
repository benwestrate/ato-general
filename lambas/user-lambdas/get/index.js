'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');
var uuidGenerator   = require('node-uuid-generator');

// Constants
var dynamo = new DOC.DynamoDB();

exports.handler = function( event, context, callback ) {

    console.log(event, context);

    var item = {
        id : event.userId
    };

    var cb = function(err, data) {
        console.log('data: ', data);
        if(err) {
            console.log(err);
            callback( 'unable to get the user '+ event.userId +' at this time' );

        } else if( !data.hasOwnProperty('Item') ) {
            console.log("ITEM", data);
            callback( 'unable to get the user '+ event.userId +' at this time' )
        } else {
            console.log("Returning the item");
            callback( null, data.Item );
        }
    };

    if( item.id ){
        dynamo.getItem({TableName:"ato-users", Key: item}, cb);
    } else {
        callback( 'unable to get the user '+ event.userId +' at this time' )
    }


}
