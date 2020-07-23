import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from "@aws-cdk/aws-codebuild";
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline";
import {
  CloudFormationCreateUpdateStackAction,
  CodeBuildAction,
  GitHubSourceAction,
  GitHubTrigger,
} from "@aws-cdk/aws-codepipeline-actions";
import { Construct, SecretValue, Stack, StackProps } from "@aws-cdk/core";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceOutput = new Artifact();

    const sourceAction = new GitHubSourceAction({
      actionName: "Source",
      branch: process.env.GITHUB_HEAD_REF || "master",
      oauthToken: SecretValue.secretsManager("dev/Tread/GitHubToken"),
      output: sourceOutput,
      owner: "lukehedger",
      repo: "cdk-webhook-proxy",
      trigger: process.env.GITHUB_HEAD_REF
        ? GitHubTrigger.NONE
        : GitHubTrigger.WEBHOOK,
    });

    const stackName = process.env.GITHUB_PR_NUMBER
      ? `CdkWebhookProxyInfraStack-${process.env.GITHUB_PR_NUMBER}`
      : "CdkWebhookProxyInfraStack";

    const buildProjectName = process.env.GITHUB_PR_NUMBER
      ? `WebhookProxy-Build-${process.env.GITHUB_PR_NUMBER}`
      : "WebhookProxy-Build";

    const buildProject = new PipelineProject(this, buildProjectName, {
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        artifacts: {
          "base-directory": "./aws-infrastructure-cloud/cdk.out",
          files: [`${stackName}.template.json`],
          name: "InfraStack",
        },
        phases: {
          install: {
            commands: ["npm install --global yarn", "yarn install"],
          },
          build: {
            commands: [
              "yarn workspace aws-infrastructure-cloud build",
              `GITHUB_PR_NUMBER=${process.env.GITHUB_PR_NUMBER} yarn workspace aws-infrastructure-cloud synth`,
            ],
          },
        },
      }),
      environment: {
        buildImage: LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1,
      },
      projectName: buildProjectName,
    });

    const buildOutput = new Artifact("InfraStack");

    const buildAction = new CodeBuildAction({
      actionName: "Build",
      input: sourceOutput,
      outputs: [buildOutput],
      project: buildProject,
    });

    const deployAction = new CloudFormationCreateUpdateStackAction({
      actionName: "Deploy",
      adminPermissions: true,
      replaceOnFailure: true,
      stackName: stackName,
      templatePath: buildOutput.atPath(`${stackName}.template.json`),
    });

    const pipelineName = process.env.GITHUB_PR_NUMBER
      ? `WebhookProxy-DeploymentPipeline-${process.env.GITHUB_PR_NUMBER}`
      : "WebhookProxy-DeploymentPipeline";

    new Pipeline(this, pipelineName, {
      pipelineName: pipelineName,
      restartExecutionOnUpdate: true,
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
        {
          stageName: "Deploy",
          actions: [deployAction],
        },
      ],
    });
  }
}
