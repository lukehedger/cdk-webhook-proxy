#!/usr/bin/env node
import { App } from "@aws-cdk/core";
import { WebhookStack } from "../lib/webhook";

const app = new App();

new WebhookStack(app, "CdkWebhookProxyWebhookStack");
