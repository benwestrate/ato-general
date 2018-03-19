

const awsIot = require('aws-iot-device-sdk');
const moment = require('moment');
const _      = require('underscore');

var request = require("request");




class LightController {

    constructor( deviceInfo ){

        this.state = {
            light1        : false,
            light2        : false,
            light3        : false,
            light4        : false,
            lastMotion    : moment( new Date ).subtract(5, 'm'),
            motionEnabled : true
        }

        this.init              = this.init.bind(this);

        // AWS Device Shadow events
        this.registerListeners = this.registerListeners.bind( this );
        this.shadowInit        = this.shadowInit.bind( this );
        this.shadowRegistered  = this.shadowRegistered.bind( this );
        this.newStatus         = this.newStatus.bind( this );
        this.deltaOnState      = this.deltaOnState.bind( this );
        this.timeout           = this.timeout.bind( this );
        this.subscribed           = this.subscribed.bind( this );

        // Topic subscribers
        this.initSubscriptions = this.initSubscriptions.bind( this );
        this.message           = this.message.bind( this );

        this.lightStatus     = this.lightStatus.bind( this );
        this.setState        = this.setState.bind( this );
        this.updateShadow    = this.updateShadow.bind( this );
        this.updateLights    = this.updateLights.bind( this );
        this.requestResponse = this.requestResponse.bind( this );
        this.newTick         = this.newTick.bind( this );


        this.init();
    }

    init(){

        console.log( '[ init ]', this );

        this.shadow = awsIot.thingShadow({
           keyPath: 'certs/lightController.private.key',
          certPath: 'certs/lightController.cert.pem',
            caPath: 'certs/root-CA.crt',
              host: 'a10ihyfeoljcqa.iot.us-east-1.amazonaws.com'
        })

        this.registerListeners();
        this.shadowInit();
        this.initSubscriptions();
    }

    shadowInit(){

        this.shadow.register( 'lightController',  this.shadowRegistered)

    }

    initSubscriptions(){

        this.shadow.subscribe( [
            'theW/-1/bensOffice/lights',
            'theW/-1/bensOffice/toggleMotion',
            'clock/tick'
        ], this.subscribed )

    }

    subscribed(err, arrayOfSubscriptions){
        console.log( '[ subscribed ]', arrayOfSubscriptions );
    }

    registerListeners(){

        this.shadow.on( 'connect',     this.shadowInit )
        this.shadow.on( 'status',      this.newStatus )
        this.shadow.on( 'delta',       this.deltaOnState )
        this.shadow.on( 'timeout',     this.timeout )
        this.shadow.on( 'message',     this.message )

    }

    shadowRegistered(){

        //set state
        console.log( '[ shadowRegistered ]', arguments );
        this.shadow.get( 'lightController' )

    }

    newStatus( shadowName, stutus, id, shadowState ){
        // console.log( '[ newStatus ]', arguments );

        if( _.isEqual( this.state, shadowState.state.reported ) ){
            this.setState( shadowState.state.reported );
        }

    }

    deltaOnState(){
        console.log( '[ deltaOnState ]', arguments );
    }

    timeout(){
        console.log( '[ timeout ]', arguments );
    }

    message( topic, message ){

        let messageJson = JSON.parse( message.toString() );
        console.log('\n\n\n\n')
        console.log( "[ message topic ] ", topic )
        console.log('\n\n\n\n')

        switch (topic) {
            case 'theW/-1/bensOffice/lights':
                this.setState({
                    lastMotion : moment(new Date())
                });
                this.lightStatus( messageJson )
                break;
            case 'theW/-1/bensOffice/toggleMotion':
                console.log( '[ message ]', message.toString() );
                this.motionStatus( messageJson )
                break;
            case 'clock/tick' :
                this.newTick();
        }

    }

    lightStatus( eventInfo ){

        if( eventInfo.event === 'motion' && this.state.motionEnabled ){


            switch ( eventInfo.room ){

                case 'bensOffice':
                    this.setState( { light1 : true } )

            }

        }

    }

    motionStatus( eventInfo ){

        if( eventInfo.event === 'toggleMotion' ){


            switch ( eventInfo.room ){

                case 'bensOffice':
                    this.setState( {
                        motionEnabled : !this.state.motionEnabled,
                        light1 : !this.state.motionEnabled
                    } )

            }

        }

    }

    setState( newState ){
        let stateChanged = false;
        let lightsStateChanged = false;

        newState = Object.assign( {}, this.state, newState );




        _.forEach( this.state, ( val, key ) => {

            if( val !== newState[ key ] ) stateChanged = true;
            if( key === 'light1' && newState[ key ] !== val ) lightsStateChanged = true;
        } )

        if( stateChanged ) {

            console.log("\n\n\n==============================================");
            console.log( '[ oldState ]', this.state );
            console.log( '[ newState ]', newState );
            console.log("==============================================\n\n\n");

            this.state = newState;

            this.updateShadow()

            if( lightsStateChanged ){
              this.updateLights()
            }

        }



    }

    updateShadow(){

        this.shadow.update( 'lightController', { state : { reported: this.state  } })

    }

    updateLights() {
        var options = {
            method: 'POST',
            url: 'https://api.particle.io/v1/devices/2b0047001247353136383631/digitalwrite',
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded',
                access_token: '<KEY GOES HERE/>'
            },
            form: {
                access_token: '<KEY GOES HERE/>',
                args: 'D0 HIGH'
            }
        };


        options.form.args = 'D0 ' + (this.state.light1 ? 'HIGH' : 'LOW');

        // console.log( options.form.args );
        request(options, this.requestResponse)

    }

    requestResponse (error, response, body) {
      if (error) throw new Error(error);

    //   console.log(body);
    }

    newTick(){

        let nowMinusFive = moment( new Date() ).subtract(5, 'm')

        if( this.state.lastMotion.isBefore( nowMinusFive ) ){
            this.setState({
                light1 : false
            });
        }

    }
}

new LightController();
