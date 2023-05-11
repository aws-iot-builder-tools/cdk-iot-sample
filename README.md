# CDK IoT Sample Project

This is a sample project which shows how to create, deploy and start a simple Node.js IoT application, using CDK and MQTT.js. 
The code in this sample project was written by using the AI companionship of Amazon CodeWhisperer. 
The comments in the code show what Amazon CodeWhisperer was 'told' to generate. 

The project is composed of two parts:

1. The Typescript CDK infrastructure as code, which creates the needed resources as follows:
   - An IoT policy, 
   - An IoT Rule, 
   - An AWS Lambda function which is invoked as a Rule Action.
The `cdk.json` file tells the CDK Toolkit how to execute your app.
   
2. A Javascript application, which:
   - Creates an AWS IoT Thing,
   - Creates the needed IoT thing identity (certificate and keys),
   - Attaches the policy to the certificate, and the certificate to the thing,
   - Creates an MQTT client using the MQTT.JS open source library,
   - Starts the MQTT client, connects to AWS IoT Core, 
   - Subscribes and publishes data on interval on an MQTT topic.

## Pre-Requisites
* To be able to deploy the CDK resources, as well as run your application, you need to:
  * Ensure you provide the scripts the needed AWS credentials.
  * Replace the `ENDPOINT`value with your AWS Account and REGION IoT Endpoint in line 11 in [here](test-app/app.js).

## Useful commands

* To prepare and deploy the AWS resources created using CDK:

  * `npm install`     install dependencies as node modules
  * `npm run build`   compile typescript to js
  * `npm run watch`   watch for changes and compile
  * `cdk deploy`      deploy this stack to your default AWS account/region
  * `cdk diff`        compare deployed stack with current state
  * `cdk synth`       emits the synthesized CloudFormation template
  
* To run the Javascript application:
  * `npm install`     install dependencies as node modules
  * `node test-app/app.js`   run JavaScript app

## Clean-up steps
* Clean up your app-created resources, certificates, thing etc.
   * `node test-app/clean-up-app.js`   run JavaScript app
  
* Clean up your CDK created resources:
  * `cdk destroy`     delete resources from your AWS Account

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

