import {
    DeleteThingCommand,
    IoTClient,
    DetachThingPrincipalCommand, DeleteCertificateCommand, ListTargetsForPolicyCommand, UpdateCertificateCommand
} from "@aws-sdk/client-iot";

const iotClient = new IoTClient({});

//Create a function that detaches all certificates attached to an IoT thing.
export const detachAllCertificates = async () => {

//retrieve all targets for IoT policy.
    const data = await iotClient.send(new ListTargetsForPolicyCommand({
         policyName: "MyIoTPolicy"
    }));

//Loop through all certificates, detach them.
    for (let i = 0; i < data.targets.length; i++) {
        console.log(data.targets[i])
        try {
            await iotClient.send(new DetachThingPrincipalCommand({
                thingName: thingName,
                principal: data.targets[i]
            }));
        } catch (err) {
            console.log(err);
        }
        // retrieve a certificate id from a certificate arn.
        const certificateId = data.targets[i].split('/')[1];

        //update certificate status to INACTIVE.
        await iotClient.send(new UpdateCertificateCommand({
            certificateId: certificateId,
            newStatus: "INACTIVE"
        }));

        //delete the certificates.
        await iotClient.send(new DeleteCertificateCommand({
            certificateId: certificateId,
            forceDelete: true
        }));
    }
    console.log("Success", data);
    return data;
}

// Create a function that deletes an IoT thing.
export const deleteThing = async (thingName) => {
    // Delete the thing.
    const data = await iotClient.send(new DeleteThingCommand({
        thingName
    }));
    console.log("Success", data);
    return data;
}

const thingName = "MyIoTThing";
//call first detachAllCertificates function, then deleteThing function
await detachAllCertificates(thingName).then(() => deleteThing(thingName));
