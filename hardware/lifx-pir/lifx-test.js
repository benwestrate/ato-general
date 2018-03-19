var LifxClient = require('node-lifx').Client;
var client = new LifxClient();
 
client.on('light-new', function(light) {
  // Change light state here 

  console.log( light );

  light.on(2000)
});
 
client.init();