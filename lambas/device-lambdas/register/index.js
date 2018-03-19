'use strict';
// NPM Modules
var DOC             = require('dynamodb-doc');
var uuidGenerator   = require('node-uuid-generator');
var AWS             = require('aws-sdk');
var randomstring    = require("randomstring");

// Constants
var dynamo = new DOC.DynamoDB();
var iot    = new AWS.Iot();


exports.handler = function( event, context, callback ) {

    console.log( event );

    if( !event.hasOwnProperty('deviceAttributes') ) callback('You must provide a device attributes')

    var policyName = 'ato-main-policy';
    var deviceId   = uuidGenerator.generate();

    var params = {
        setAsActive: true
    };

    iot.createKeysAndCertificate(params, function(err, certsResponse) {
        if (err) console.log(err, err.stack);   // an error occurred
        else     console.log(certsResponse);    // successful response

        var attachCertificateArn = {
            policyName: policyName,                 /* required */
            principal: certsResponse.certificateArn /* required */
        };

        iot.attachPrincipalPolicy(attachCertificateArn, function(err, attachPolicyResponse) {
            if (err) console.log(err, err.stack);       // an error occurred
            else     console.log(attachPolicyResponse); // successful response

            let attrs  = event.deviceAttributes;
            attrs.id   = deviceId;
            attrs.type = event.deviceName;

            var thingParams = {
                thingName: deviceId, /* required */
                attributePayload: {
                    attributes: attrs,
                    merge: true
                }
            };

            iot.createThing(thingParams, function(err, createThingResponse) {
                if (err) console.log(err, err.stack);       // an error occurred
                else     console.log("createThingResponse", createThingResponse);  // successful response

                iot.describeEndpoint({}, function(err, endpointDataResponse) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     console.log("endpoint", endpointDataResponse);           // successful response


                    var attachThingParams = {
                        principal: certsResponse.certificateArn, /* required */
                        thingName: thingParams.thingName /* required */
                    };

                    iot.attachThingPrincipal(attachThingParams, function(err, attachData) {
                        if (err) console.log(err, err.stack); // an error occurred

                        var claimString1 = randomstring.generate(3)
                        var claimString2 = randomstring.generate(3)
                        var claimString3 = randomstring.generate(3)
                        var claimString4 = randomstring.generate(3)
                        var claimString5 = randomstring.generate(3)

                        var claimString  = claimString1 + '-' + claimString2 + '-' + claimString3 + '-' + claimString4 + '-' + claimString5

                        var item = {
                            id                 : deviceId,
                            name               : null,
                            arn                : createThingResponse.thingArn,
                            ownerId            : '-1',
                            ownerFaimliyId     : null,
                            claimString        : claimString,
                            endpoint           : endpointDataResponse.endpointAddress + '/things/' + createThingResponse.thingName + '/shadow',
                            baseTopic          : '$aws/things/' + createThingResponse.thingName + '/',
                            associatedBuilding : null,
                            claimed            : false,
                            events             : event.events || [],
                            subscribed         : event.subscribed || [],
                        };

                        var cb = function(err, data) {
                            if(err) {
                                console.log(err);
                                callback('unable to create device at this time');
                            } else {
                                console.log(data);
                                callback( null, { device: item, certs: certsResponse } );
                            }
                        };

                        if( item.buildingId !== null ){
                            dynamo.putItem({TableName:"ato-devices", Item:item}, cb);
                        }

                    });

                });

            });

        });
    });











}
