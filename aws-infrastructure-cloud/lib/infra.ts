import { Topic } from "@aws-cdk/aws-sns";
import { Construct, Stack, StackProps } from "@aws-cdk/core";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const topicName = process.env.GITHUB_HEAD_REF
      ? `CdkWebhookProxyTopic-${process.env.GITHUB_HEAD_REF}`
      : "CdkWebhookProxyTopic";

    new Topic(this, "Topic", {
      displayName: topicName,
      topicName: topicName,
    });
  }
}
