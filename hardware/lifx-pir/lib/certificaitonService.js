const request = require('request');
const fs = require('fs');

const deviceRegUrl = 'https://85d0590682.execute-api.us-east-1.amazonaws.com/development/ato/device';



function getCerts( formData ) {

    let promise = new Promise(function(resolve, reject) {

        request.post( { url: deviceRegUrl, form:  JSON.stringify( formData ) }, function optionalCallback(err, httpResponse, body) {

            if (err) {
                reject('upload failed:', err);
            }

            try{
                let deviceInfo = JSON.parse( body );
                makeCerts( deviceInfo.certs, deviceInfo.device.id )
                resolve( deviceInfo )
            } catch(strinigyError){
                console.error(strinigyError);
                reject( strinigyError )
            }

        });

    });

    return promise;

}

function makeCerts( certs, deviceName ) {
    console.log('====================================');
    console.log(deviceName);
    console.log('====================================');
    try {

        // write private key
        fs.writeFileSync('./certs/privateKey.pem', certs.keyPair.PrivateKey)

        // write certificate
        fs.writeFileSync('./certs/certificate.pem', certs.certificatePem)

    } catch (err) {
        return err;
    }


    return true
}

function isCertified ( deviceName ) {

    try {
        fs.accessSync('./certs/privateKey.pem', fs.F_OK);
        fs.accessSync('./certs/certificate.pem', fs.F_OK);

        return true
    } catch (e) {
        // It isn't accessible
        return false
    }
}

module.exports = {
    isCertified : isCertified,
    getCerts    : getCerts
}
