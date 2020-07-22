#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { InfraStack } from "../lib/infra";

const app = new App();

const stackName = process.env.GITHUB_PR_NUMBER
  ? `CdkWebhookProxyInfraStack-${process.env.GITHUB_PR_NUMBER}`
  : "CdkWebhookProxyInfraStack";

new InfraStack(app, stackName);
