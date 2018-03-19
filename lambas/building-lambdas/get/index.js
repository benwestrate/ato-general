'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');

// Constants
var dynamo = new DOC.DynamoDB();

exports.handler = function( event, context, callback ) {

    console.log(event);

    var item = {
        id : event.buildingId
    };

    var cb = function(err, data) {
        console.log('data: ', data);
        if(err) {
            console.log(err);
            callback( 'unable to get the building '+ event.buildingId +' at this time' );

        } else if( !data.hasOwnProperty('Item') ) {
            console.log("ITEM", data);
            callback( 'unable to get the building '+ event.buildingId +' at this time' )
        } else {
            console.log("Returning the item");
            callback( null, data.Item );
        }
    };

    if( item.id ){
        dynamo.getItem({TableName:"ato-buildings", Key: item}, cb);
    } else {
        callback( 'unable to get the building '+ event.userId +' at this time' )
    }


}
