var Particle  = require('particle-api-js');
var particle        = new Particle();


callEvent();


function callEvent(){
    
    var time = Math.random() * (60000 - 10000) + 10000

    setTimeout( () => {
        particle.publishEvent({ name: 'motionInTheOffice', data: '', auth: '<KEY GOES HERE/>' })
            .then( function(data) {
                if (data.body.ok) { console.log("Event published succesfully") }
            },
            function(err) {
                console.log("Failed to publish event: " + err)
            });
        callEvent();
    }, time )

}