//'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');

// Constants
var docClient = new DOC.DynamoDB();

exports.handler = function( event, context, callback ) {
    console.log(event);

    var params = {
        TableName : "ato-buildings",
        IndexName: "ownerId-index",
        KeyConditionExpression: "#ownerId = :ownerId",
        ExpressionAttributeNames:{
            "#ownerId": "ownerId"
        },
        ExpressionAttributeValues: {
            ":ownerId": event.userId
        }
    };

    docClient.query(params, function(err, data) {
        if (err) {
            makeError(["Unable to query. Error:", JSON.stringify(err, null, 2)], callback)
        } else {
            console.log("Query succeeded.");
            console.log(data);
            callback(null, { buildings : data.Items })
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
