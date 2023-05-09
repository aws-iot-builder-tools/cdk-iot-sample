import * as cdk from '@aws-cdk/core';
import {CfnPolicy, CfnTopicRule} from "@aws-cdk/aws-iot";
import {Construct} from "@aws-cdk/core";
import * as aws_lambda from "@aws-cdk/aws-lambda";
import * as aws_iam from "@aws-cdk/aws-iam";

const SUB_TOPIC = "devices/MyIoTThing/sub";
const PUB_TOPIC = "devices/MyIoTThing/pub";

export class CdkIoTStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //create an IoT policy allowing the device to connect with its client id, to subscribe to SUB_TOPIC and publish on PUB_TOPIC
        const policy: CfnPolicy = new CfnPolicy(this, 'IoTPolicy', {
            policyName: 'MyIoTPolicy',
            policyDocument: {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "iot:Connect"
                        ],
                        "Resource": [
                            `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:client/\${iot:ClientId}`
                        ]
                    },
                    {
                        "Effect": "Allow",
                        "Action": [
                            "iot:Subscribe"
                        ],
                        "Resource": [
                            `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:topicfilter/${SUB_TOPIC}`
                        ]
                    },
                    {
                        "Effect": "Allow",
                        "Action": [
                            "iot:Publish"
                        ],
                        "Resource": [
                            `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:topic/${PUB_TOPIC}`
                        ]
                    }
                ]
            }
        });

        //create a lambda function that will be triggered by an IoT Rule, with inline code.
        const lambda = new aws_lambda.Function(this, 'MyIoTLambdaFunction', {
            handler: 'index.handler',
            code: aws_lambda.Code.fromInline(
                `exports.handler = async (event) => {
                    console.log(event);
                    return {
                    statusCode: 200,
                    body: JSON.stringify(event)
                    };
                }
                `
            ),
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
            tracing: aws_lambda.Tracing.ACTIVE
        });

        //create an IoT Rule, which will trigger an AWS Lambda function when a message is published on PUB_TOPIC
        const rule = new CfnTopicRule(this, 'IoTRule', {
            ruleName: 'MyIoTRule',
            topicRulePayload: {
                actions: [
                    {
                        lambda: {
                            functionArn: lambda.functionArn
                        }
                    }
                ],
                description: 'IoT Rule',
                sql: `SELECT *
                      FROM '${PUB_TOPIC}'`,
                ruleDisabled: false,
                awsIotSqlVersion: '2016-03-23'
            }
        });

        //add Resource Policy to lambda, allows invocation from IoT Rule.
        lambda.addPermission('grandIoT',
            {
                principal: new aws_iam.ServicePrincipal('iot.amazonaws.com'),
                sourceAccount: cdk.Aws.ACCOUNT_ID,
                sourceArn: rule.attrArn
            })
    }
}
