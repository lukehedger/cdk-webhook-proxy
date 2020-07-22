#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { PipelineStack } from "../lib/pipeline";

const app = new App();

const stackName = process.env.GITHUB_PR_NUMBER
  ? `CdkWebhookProxyPipelineStack-${process.env.GITHUB_PR_NUMBER}`
  : "CdkWebhookProxyPipelineStack";

new PipelineStack(app, stackName);
