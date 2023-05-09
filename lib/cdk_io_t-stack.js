"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkIoTStack = void 0;
const cdk = require("@aws-cdk/core");
const aws_iot_1 = require("@aws-cdk/aws-iot");
const aws_lambda = require("@aws-cdk/aws-lambda");
const aws_iam = require("@aws-cdk/aws-iam");
const SUB_TOPIC = "devices/MyIoTThing/sub";
const PUB_TOPIC = "devices/MyIoTThing/pub";
class CdkIoTStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //create an IoT policy allowing the device to connect with its client id, to subscribe to SUB_TOPIC and publish on PUB_TOPIC
        const policy = new aws_iot_1.CfnPolicy(this, 'IoTPolicy', {
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
            code: aws_lambda.Code.fromInline(`exports.handler = async (event) => {
                    console.log(event);
                    return {
                    statusCode: 200,
                    body: JSON.stringify(event)
                    };
                }
                `),
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
            tracing: aws_lambda.Tracing.ACTIVE
        });
        //create an IoT Rule, which will trigger an AWS Lambda function when a message is published on PUB_TOPIC
        const rule = new aws_iot_1.CfnTopicRule(this, 'IoTRule', {
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
        lambda.addPermission('grandIoT', {
            principal: new aws_iam.ServicePrincipal('iot.amazonaws.com'),
            sourceAccount: cdk.Aws.ACCOUNT_ID,
            sourceArn: rule.attrArn
        });
    }
}
exports.CdkIoTStack = CdkIoTStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrX2lvX3Qtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjZGtfaW9fdC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBcUM7QUFDckMsOENBQXlEO0FBRXpELGtEQUFrRDtBQUNsRCw0Q0FBNEM7QUFFNUMsTUFBTSxTQUFTLEdBQUcsd0JBQXdCLENBQUM7QUFDM0MsTUFBTSxTQUFTLEdBQUcsd0JBQXdCLENBQUM7QUFFM0MsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDdEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qiw0SEFBNEg7UUFDNUgsTUFBTSxNQUFNLEdBQWMsSUFBSSxtQkFBUyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDdkQsVUFBVSxFQUFFLGFBQWE7WUFDekIsY0FBYyxFQUFFO2dCQUNaLFNBQVMsRUFBRSxZQUFZO2dCQUN2QixXQUFXLEVBQUU7b0JBQ1Q7d0JBQ0ksUUFBUSxFQUFFLE9BQU87d0JBQ2pCLFFBQVEsRUFBRTs0QkFDTixhQUFhO3lCQUNoQjt3QkFDRCxVQUFVLEVBQUU7NEJBQ1IsZUFBZSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsMEJBQTBCO3lCQUNoRjtxQkFDSjtvQkFDRDt3QkFDSSxRQUFRLEVBQUUsT0FBTzt3QkFDakIsUUFBUSxFQUFFOzRCQUNOLGVBQWU7eUJBQ2xCO3dCQUNELFVBQVUsRUFBRTs0QkFDUixlQUFlLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxnQkFBZ0IsU0FBUyxFQUFFO3lCQUNqRjtxQkFDSjtvQkFDRDt3QkFDSSxRQUFRLEVBQUUsT0FBTzt3QkFDakIsUUFBUSxFQUFFOzRCQUNOLGFBQWE7eUJBQ2hCO3dCQUNELFVBQVUsRUFBRTs0QkFDUixlQUFlLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxVQUFVLFNBQVMsRUFBRTt5QkFDM0U7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztRQUVILG1GQUFtRjtRQUNuRixNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ2hFLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FDNUI7Ozs7Ozs7aUJBT0MsQ0FDSjtZQUNELE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDdkMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU07U0FDckMsQ0FBQyxDQUFDO1FBRUgsd0dBQXdHO1FBQ3hHLE1BQU0sSUFBSSxHQUFHLElBQUksc0JBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQzNDLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLGdCQUFnQixFQUFFO2dCQUNkLE9BQU8sRUFBRTtvQkFDTDt3QkFDSSxNQUFNLEVBQUU7NEJBQ0osV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO3lCQUNsQztxQkFDSjtpQkFDSjtnQkFDRCxXQUFXLEVBQUUsVUFBVTtnQkFDdkIsR0FBRyxFQUFFOzhCQUNTLFNBQVMsR0FBRztnQkFDMUIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLGdCQUFnQixFQUFFLFlBQVk7YUFDakM7U0FDSixDQUFDLENBQUM7UUFFSCxpRUFBaUU7UUFDakUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQzNCO1lBQ0ksU0FBUyxFQUFFLElBQUksT0FBTyxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDO1lBQzVELGFBQWEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVU7WUFDakMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPO1NBQzFCLENBQUMsQ0FBQTtJQUNWLENBQUM7Q0FDSjtBQXZGRCxrQ0F1RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnQGF3cy1jZGsvY29yZSc7XG5pbXBvcnQge0NmblBvbGljeSwgQ2ZuVG9waWNSdWxlfSBmcm9tIFwiQGF3cy1jZGsvYXdzLWlvdFwiO1xuaW1wb3J0IHtDb25zdHJ1Y3R9IGZyb20gXCJAYXdzLWNkay9jb3JlXCI7XG5pbXBvcnQgKiBhcyBhd3NfbGFtYmRhIGZyb20gXCJAYXdzLWNkay9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgKiBhcyBhd3NfaWFtIGZyb20gXCJAYXdzLWNkay9hd3MtaWFtXCI7XG5cbmNvbnN0IFNVQl9UT1BJQyA9IFwiZGV2aWNlcy9NeUlvVFRoaW5nL3N1YlwiO1xuY29uc3QgUFVCX1RPUElDID0gXCJkZXZpY2VzL015SW9UVGhpbmcvcHViXCI7XG5cbmV4cG9ydCBjbGFzcyBDZGtJb1RTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgICAgICAvL2NyZWF0ZSBhbiBJb1QgcG9saWN5IGFsbG93aW5nIHRoZSBkZXZpY2UgdG8gY29ubmVjdCB3aXRoIGl0cyBjbGllbnQgaWQsIHRvIHN1YnNjcmliZSB0byBTVUJfVE9QSUMgYW5kIHB1Ymxpc2ggb24gUFVCX1RPUElDXG4gICAgICAgIGNvbnN0IHBvbGljeTogQ2ZuUG9saWN5ID0gbmV3IENmblBvbGljeSh0aGlzLCAnSW9UUG9saWN5Jywge1xuICAgICAgICAgICAgcG9saWN5TmFtZTogJ015SW9UUG9saWN5JyxcbiAgICAgICAgICAgIHBvbGljeURvY3VtZW50OiB7XG4gICAgICAgICAgICAgICAgXCJWZXJzaW9uXCI6IFwiMjAxMi0xMC0xN1wiLFxuICAgICAgICAgICAgICAgIFwiU3RhdGVtZW50XCI6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW90OkNvbm5lY3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBhcm46YXdzOmlvdDoke2Nkay5Bd3MuUkVHSU9OfToke2Nkay5Bd3MuQUNDT1VOVF9JRH06Y2xpZW50L1xcJHtpb3Q6Q2xpZW50SWR9YFxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIkVmZmVjdFwiOiBcIkFsbG93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkFjdGlvblwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpb3Q6U3Vic2NyaWJlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlJlc291cmNlXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgYXJuOmF3czppb3Q6JHtjZGsuQXdzLlJFR0lPTn06JHtjZGsuQXdzLkFDQ09VTlRfSUR9OnRvcGljZmlsdGVyLyR7U1VCX1RPUElDfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJFZmZlY3RcIjogXCJBbGxvd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJBY3Rpb25cIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW90OlB1Ymxpc2hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUmVzb3VyY2VcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBhcm46YXdzOmlvdDoke2Nkay5Bd3MuUkVHSU9OfToke2Nkay5Bd3MuQUNDT1VOVF9JRH06dG9waWMvJHtQVUJfVE9QSUN9YFxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL2NyZWF0ZSBhIGxhbWJkYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkIGJ5IGFuIElvVCBSdWxlLCB3aXRoIGlubGluZSBjb2RlLlxuICAgICAgICBjb25zdCBsYW1iZGEgPSBuZXcgYXdzX2xhbWJkYS5GdW5jdGlvbih0aGlzLCAnTXlJb1RMYW1iZGFGdW5jdGlvbicsIHtcbiAgICAgICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgICAgIGNvZGU6IGF3c19sYW1iZGEuQ29kZS5mcm9tSW5saW5lKFxuICAgICAgICAgICAgICAgIGBleHBvcnRzLmhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBgXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgcnVudGltZTogYXdzX2xhbWJkYS5SdW50aW1lLk5PREVKU18xNl9YLFxuICAgICAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMTApLFxuICAgICAgICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgICAgICAgdHJhY2luZzogYXdzX2xhbWJkYS5UcmFjaW5nLkFDVElWRVxuICAgICAgICB9KTtcblxuICAgICAgICAvL2NyZWF0ZSBhbiBJb1QgUnVsZSwgd2hpY2ggd2lsbCB0cmlnZ2VyIGFuIEFXUyBMYW1iZGEgZnVuY3Rpb24gd2hlbiBhIG1lc3NhZ2UgaXMgcHVibGlzaGVkIG9uIFBVQl9UT1BJQ1xuICAgICAgICBjb25zdCBydWxlID0gbmV3IENmblRvcGljUnVsZSh0aGlzLCAnSW9UUnVsZScsIHtcbiAgICAgICAgICAgIHJ1bGVOYW1lOiAnTXlJb1RSdWxlJyxcbiAgICAgICAgICAgIHRvcGljUnVsZVBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhbWJkYToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uQXJuOiBsYW1iZGEuZnVuY3Rpb25Bcm5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJb1QgUnVsZScsXG4gICAgICAgICAgICAgICAgc3FsOiBgU0VMRUNUICpcbiAgICAgICAgICAgICAgICAgICAgICBGUk9NICcke1BVQl9UT1BJQ30nYCxcbiAgICAgICAgICAgICAgICBydWxlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF3c0lvdFNxbFZlcnNpb246ICcyMDE2LTAzLTIzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL2FkZCBSZXNvdXJjZSBQb2xpY3kgdG8gbGFtYmRhLCBhbGxvd3MgaW52b2NhdGlvbiBmcm9tIElvVCBSdWxlLlxuICAgICAgICBsYW1iZGEuYWRkUGVybWlzc2lvbignZ3JhbmRJb1QnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHByaW5jaXBhbDogbmV3IGF3c19pYW0uU2VydmljZVByaW5jaXBhbCgnaW90LmFtYXpvbmF3cy5jb20nKSxcbiAgICAgICAgICAgICAgICBzb3VyY2VBY2NvdW50OiBjZGsuQXdzLkFDQ09VTlRfSUQsXG4gICAgICAgICAgICAgICAgc291cmNlQXJuOiBydWxlLmF0dHJBcm5cbiAgICAgICAgICAgIH0pXG4gICAgfVxufVxuIl19