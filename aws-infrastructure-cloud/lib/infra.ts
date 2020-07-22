import { Topic } from "@aws-cdk/aws-sns";
import { Construct, Stack, StackProps } from "@aws-cdk/core";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Topic(this, "Topic", {
      displayName: "CdkWebhookProxyTopic",
      topicName: "CdkWebhookProxyTopic",
    });
  }
}
