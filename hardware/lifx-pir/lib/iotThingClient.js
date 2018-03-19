"use strict"

var awsIot          = require('aws-iot-device-sdk');
var fs              = require('fs');
var moment          = require('moment');
var Particle        = require('particle-api-js');
var date            = moment(new Date());
var particle        = new Particle();
var LifxClient      = require('node-lifx').Client;

 
// client.on('light-new', function(light) {
//   // Change light state here 

//   console.log( light );

//   light.on(2000)
// });
 
// client.init();


class Client {

    constructor( clientId ){

        this.clientId       = clientId;
        this.particleStream = particle.getEventStream({  deviceId: 'mine', auth: '<KEY GOES HERE/>' })
        this.lfxClient      = new LifxClient();
        this.shadow         = awsIot.thingShadow( {
            keyPath: 'certs/privateKey.pem',
            certPath: 'certs/certificate.pem',
            caPath: 'certs/rootCert.pem',
            clientId: clientId,
            region: 'us-east-1'
        } )

        this.state                  = {    };
        this.light                  = null;

        
        
        this.registerShadow         = this.registerShadow.bind( this );
        this.setState               = this.setState.bind( this );
        this.setDefaultState        = this.setDefaultState.bind( this );
        this.shouldTurnOffLight     = this.shouldTurnOffLight.bind( this );
        this.doStatesDiff           = this.doStatesDiff.bind( this );

        // Event Handlers
        this.handler_status         = this.handler_shadow_status.bind( this );
        this.handler_message        = this.handler_shadow_message.bind( this );
        this.handler_delta          = this.handler_shadow_delta.bind( this );
        this.handler_timeout        = this.handler_shadow_timeout.bind( this );
        this.handler_lfx_new_light  = this.handler_lfx_new_light.bind( this );

        this.init();
    }

    registerShadow() {

        this.shadow.register( this.clientId, {}, () => {
            this.shadow.get(this.clientId);
            console.log( 'Shadow Registered : ', this.clientId )
        } )

    }

    subscribe( topic, cb = ()=> {} ){
        this.shadow.subscribe( topic, cb)
    }
    
    handler_shadow_status( thingName, stat, clientToken, stateObject ) {

        switch (stat) {
            case 'rejected':
                if( stateObject.code === 404 ) this.setDefaultState()
                break;
            case 'accepted' : 
                if( this.doStatesDiff( stateObject.state.reported ) ) {
                    this.setState( stateObject.state.reported )
                }
                break
            default:
                break;
        }
    }

    handler_shadow_message( topic, stat, clientToken, stateObject ) {
        switch (topic) {
            case '/time':
                this.shouldTurnOffLight()
                break;
        
            default:
                break;
        }
        // console.log('================= handler_message ===================');
        // console.log(topic,`${stat}`, clientToken, stateObject);
        // console.log('====================================');
    }

    handler_shadow_delta( thingName, stateObject ) {
        // console.log('================== handler_delta ==================');
        // console.log(arguments);
        // console.log('====================================');
    }

    handler_shadow_timeout( thingName, stateObject ) {
        // console.log('================== handler_timeout ==================');
        // console.log(arguments);
        // console.log('====================================');
    }

    handler_lfx_new_light( light ) {
        console.log('====================================');
        console.log(light);
        console.log('====================================');
        this.light = light;
    }

    doStatesDiff( diffState ){
        let statesDiffer = false;

        if( this.state.lightStatus !== diffState.lightStatus ){
            statesDiffer = true;
        }

        if( this.state.lastMotion !== diffState.lastMotion ){
            statesDiffer = true;
        }

        return statesDiffer;

    }

    setState( stateObject ) {
        this.state = {
            ...this.state,
            ...stateObject
        };

        if( this.state.lightStatus === 'on' && this.light){
            this.light.on(2000)
        } else if( this.light ) {
            this.light.off(2000)
        }

        console.log('====================================');
        console.log( 'Setting State to : ', JSON.stringify( this.state, null, 4 ) );
        console.log('====================================');

        this.shadow.update( this.clientId, {
            state : {
                reported : this.state
            }
        } )
    }

    formatDateForSaving( date ) {
        return date.format( )
    }

    setDefaultState(){
        this.state = {
            lastMotion      : this.formatDateForSaving( moment( new Date() ).subtract( 50, 'd' ) ) ,
            lightStatus     : 'off'
        }
        this.setState( this.state )
    }

    handler_motion( data ){
        if( data.name === 'motionInOffice' ){
            this.setState( {
                lastMotion   : this.formatDateForSaving( moment(data.published_at) ),
                lightStatus  : 'on'
            } )
        }
       
    }

    init(){
        
        this.registerShadow();

        this.shadow.on( 'status',   this.handler_shadow_status.bind( this ) );
        this.shadow.on( 'message',  this.handler_shadow_message.bind( this ) );
        this.shadow.on( 'delta',    this.handler_shadow_delta.bind( this ) );
        this.shadow.on( 'timeout',  this.handler_shadow_timeout.bind( this ) );

        this.lfxClient.on( 'light-new', this.handler_lfx_new_light.bind( this ) )
        
        this.particleStream.then( stream =>  stream.on( 'event', this.handler_motion.bind( this ) ) );
        this.setDefaultState();
        this.subscribe( '/time' );

        console.log('====================================');
        console.log( 'Inital State is : ', JSON.stringify( this.state, null, 4 ) );
        console.log('====================================');

        this.lfxClient.init();
    }

    shouldTurnOffLight(  ) {

        let lastMotion = moment( this.state.lastMotion ).add(5, 'm');
        let now        = moment( new Date() );

        if( now.isAfter( lastMotion ) && this.state.lightStatus === 'on' ){
            this.setState( { lightStatus: 'off' } )
        } 

    }

}

module.exports = {
    Client: Client
}
