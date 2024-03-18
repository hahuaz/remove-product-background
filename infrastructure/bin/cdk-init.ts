#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import * as dotenv from "dotenv";
dotenv.config({
  path: `${__dirname}/../.env`,
});

const app = new cdk.App();
const { BRANCH, AWS_ACCOUNT, AWS_REGION, APP_NAME } = process.env;

// TODO use PipelineStack when you got money
new AppStack(app, `${BRANCH}-${APP_NAME}`, {
  env: {
    region: AWS_REGION,
    account: AWS_ACCOUNT,
  },
});

app.synth();
