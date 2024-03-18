import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_iam } from "aws-cdk-lib";

import { StoreConstruct } from "./constructs";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { processedImagesBucket } = new StoreConstruct(this, "store", {});

    // create less priviled iam user for the app so user tokens can be used to access resources from outside of aws
    const appUser = new aws_iam.User(this, "appUser", {});

    // TODO use role and attach it to the appUser

    // grant the role access to the bucket
    processedImagesBucket.grantReadWrite(appUser);
  }
}
