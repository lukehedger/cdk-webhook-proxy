import { LambdaRestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { Construct, Stack, StackProps } from "@aws-cdk/core";

export class WebhookStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // TODO:
    // 0. Function code from asset! Local to this dir, built alongside and reference build file in asset path
    // 1. Receive webhook event data
    //   https://docs.github.com/en/developers/webhooks-and-events/webhook-events-and-payloads#push
    // 2. Derive pipeline name by branch/PR number
    // 3. Start pipeline execution via SDK
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CodePipeline.html#startPipelineExecution-property

    const webhook = new Function(this, "CdkWebhookProxyFunction", {
      code: Code.fromInline(
        `exports.handler = async (event) => { console.log(event); return { body: JSON.stringify({ event: event, version: process.env.AWS_LAMBDA_FUNCTION_VERSION }), statusCode: 200 }; }`
      ),
      functionName: "CdkWebhookProxyFunction",
      handler: "index.handler",
      runtime: Runtime.NODEJS_12_X,
    });

    new LambdaRestApi(this, "CdkWebhookProxyAPI", {
      handler: webhook,
      restApiName: "CdkWebhookProxyAPI",
    });
  }
}
