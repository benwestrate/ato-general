'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');
var uuidGenerator   = require('node-uuid-generator');
var AWS             = require('aws-sdk');

// Constants
var dynamo = new DOC.DynamoDB();
var iot    = new AWS.Iot();


exports.handler = function( event, context, callback ) {

    console.log("event", event );

}
