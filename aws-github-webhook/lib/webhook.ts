import { LambdaRestApi } from "@aws-cdk/aws-apigateway";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core";
import { Octokit } from "@octokit/rest";

export class WebhookStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webhook = new Function(this, "Function", {
      code: Code.fromInline(
        `exports.handler = async (event) => { console.log(event); return { version: process.env.AWS_LAMBDA_FUNCTION_VERSION}; }`
      ),
      handler: "index.handler",
      runtime: Runtime.NODEJS_12_X,
    });

    const api = new LambdaRestApi(this, "API", {
      handler: webhook,
    });

    const octokit = new Octokit({
      auth: SecretValue.secretsManager("dev/Tread/GitHubToken"),
    });

    octokit.repos.createWebhook({
      active: true,
      config: {
        url: api.url,
      },
      events: ["push"],
      owner: "lukehedger",
      repo: "cdk-webhook-proxy",
    });
  }
}
