var awsIot     = require('aws-iot-device-sdk');
var fs         = require('fs');
var moment     = require('moment');

var date       = moment(new Date());

const Client = function(clientId) {

    var deviceInfo = require('../deviceInfo.json').device;
    console.log(deviceInfo);
    var shadow = awsIot.thingShadow({
        keyPath: 'certs/privateKey.pem',
        certPath: 'certs/certificate.pem',
        caPath: 'certs/rootCert.pem',
        clientId: clientId,
        region: 'us-east-1'
    });

    console.log('====================================');
    console.log(shadow);
    console.log('====================================');

    shadow.register(clientId, {}, function() {
        
    });

    shadow.on('message', function(thingName, stat, clientToken, stateObject) {
        console.log('received ' + stat + ' on ' + thingName + ': \n' + JSON.stringify(stateObject));
    });

    shadow.on('status', function(thingName, stat, clientToken, stateObject) {
        console.log('received ' + stat + ' on ' + thingName + ': \n' + JSON.stringify(stateObject));
    });

    shadow.on('delta', function(thingName, stateObject) {
        console.log('received delta on ' + thingName + ': \n' + JSON.stringify(stateObject)+ "\n");
    });

    shadow.on('timeout', function(thingName, clientToken) {
        console.log('received timeout on ' + thingName + ' with token: ' + clientToken);
    });


    setInterval( function() {
        var now = moment(new Date());
        if( now.isAfter( date ) ){
            date = moment( new Date() ).add(10, 's');
            // setState(date)
            publisNewTime( date );
            console.log( `New time ${now.format('MMMM Do YYYY, h:mm:ss a')}` )
        } else {
             console.log( `${now.format('MMMM Do YYYY, h:mm:ss a')}` )
        }

    }, 500 )

    function setState( time ) {
       
        shadow.update( clientId, {
            state : {
                reported : {
                    "time" : time.format()
                }
            }
        } )
    }

    function publisNewTime( time ) {
        
        shadow.publish( '/time', time.format() )

    }
}


module.exports = {
    Client: Client
}
