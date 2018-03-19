

var moment          = require('moment');
var Particle        = require('particle-api-js');
var date            = moment(new Date());
var particle        = new Particle();
var LifxClient      = require('node-lifx').Client;

var client = new LifxClient();
client.on('light-new', function(light) {
  // Change light state here
  console.log(light);
});

client.init();
