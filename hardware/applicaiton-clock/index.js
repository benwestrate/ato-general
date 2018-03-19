

let fs = require('fs');

const certificationService  = require('./lib/certificaitonService.js')
const IotClient             = require('./lib/iotThingClient.js').Client

const deviceInfo  = require('./deviceInfo.json');
new IotClient( deviceInfo.device.id )


