#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { InfraStack } from "../lib/infra";

const app = new App();

new InfraStack(app, "CdkWebhookProxyInfraStack");
