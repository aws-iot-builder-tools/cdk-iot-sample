import {
    IoTClient, CreateThingCommand, CreateKeysAndCertificateCommand, AttachPolicyCommand, AttachThingPrincipalCommand,
} from "@aws-sdk/client-iot";

import mqtt from 'mqtt';
import fs from 'fs';

const SUB_TOPIC = "devices/MyIoTThing/sub";
const PUB_TOPIC = "devices/MyIoTThing/pub";
const THING_NAME = "MyIoTThing";
const ENDPOINT = "a1xbe6y87cnog-ats.iot.eu-central-1.amazonaws.com";
const PORT = 8883;
const CLIENT_ID = "MyIoTThing";
const CERT_FILE = "./MyIoTThing.cert.pem";
const KEY_FILE = "./MyIoTThing.private.key";

//create an iot thing
const createThing = async (iotClient) => {
    const params = {
        thingName: THING_NAME
    };
    return await iotClient.send(new CreateThingCommand(params));
}

//create a new certificate and private key. Activate certificate.
const createKeysAndCertificate = async (iotClient) => {
    return await iotClient.send(new CreateKeysAndCertificateCommand({
        setAsActive: true
    }));
}

//attach the policy to the certificate
const attachPolicy = async (iotClient, policyName, certificateArn) => {
    const params = {
        policyName: policyName, target: certificateArn
    };
    return await iotClient.send(new AttachPolicyCommand(params));
}

//attach the thing to the certificate
const attachThingPrincipal = async (iotClient, certificateArn) => {
    const params = {
        thingName: THING_NAME, principal: certificateArn
    };
    return await iotClient.send(new AttachThingPrincipalCommand(params));
}

//execute create thing function, create keys and certificate, attach policy and attach thing principal
const execute = async () => {
    //create iot client
    const iotClient = new IoTClient({});
    const thing = await createThing(iotClient, THING_NAME);
    const {certificateArn, keyPair, certificatePem} = await createKeysAndCertificate(iotClient);
    //store the private key and certificate to a file
    storeToFile(THING_NAME + ".private.key", keyPair.PrivateKey);
    storeToFile(THING_NAME + ".cert.pem", certificatePem);
    await attachPolicy(iotClient, "MyIoTPolicy", certificateArn);
    await attachThingPrincipal(iotClient, certificateArn);
    return thing;
}

//store a string into a file with file name fileName
const storeToFile = (fileName, data) => {
    fs.writeFileSync(fileName, data, (err) => {
        if (err) {
            console.log(err);
        }
    });
}

execute()
    .then(() => {
        //create options for mqtt client
        const options = {
            clientId: CLIENT_ID,
            host: ENDPOINT,
            port: PORT,
            protocol: 'mqtts',
            cert: fs.readFileSync(CERT_FILE),
            key: fs.readFileSync(KEY_FILE),
            reconnectPeriod: 0,
            enableTrace: false
        }
        //connect to the mqtt broker
        const client = mqtt.connect(options);
        //create on Connect function
        client.on('connect', ( packet) => {
            console.log('connected');
            client.subscribe(SUB_TOPIC);
            client.publish(PUB_TOPIC, JSON.stringify({hello: 'world'}));
        });

        //handle the message
        client.on('message', (topic, message) => {
            console.log(message.toString());
        });
        //publish the message
        setInterval(() => {
            const message = JSON.stringify({hello: 'world'});
            console.log('Publishing message ', message);
            client.publish(PUB_TOPIC, message);
        }, 5000);
    })
    .catch(err => {
        console.log(err);
    });
