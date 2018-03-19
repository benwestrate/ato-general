'use strict';

const FauxMo = require('fauxmojs');
const request = require('request');

let fauxMo = new FauxMo(
  {
    ipAddress: '192.168.7.78',
    devices: [
      {
        name: 'kitchen lights',
        port: 11002,
        handler: (action) => {

          action = action === 'on' ? 'On' : 'Off';

          let options = {
            method: 'POST',
            uri: 'https://api.particle.io/v1/devices/310019000e47353136383631/lights' + action,
            headers : {
              Authorization : "Bearer <KEY_GOES_HERE/>"
            }

          }
          request(options, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
          });
          console.log('kitchen lights action:', action);
        }
      },
    ]
  });

console.log('started..');
