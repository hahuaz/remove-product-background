import * as path from "path";

import { Construct } from "constructs";
import { aws_s3, CfnOutput } from "aws-cdk-lib";

export class StoreConstruct extends Construct {
  public readonly processedImagesBucket: aws_s3.Bucket;

  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);

    // const {} = props;

    // TODO add cors
    this.processedImagesBucket = new aws_s3.Bucket(
      this,
      "processedImagesBucket",
      {
        publicReadAccess: true,
        blockPublicAccess: new aws_s3.BlockPublicAccess({
          blockPublicPolicy: false,
          restrictPublicBuckets: false,
          blockPublicAcls: true,
          ignorePublicAcls: true,
        }),
        cors: [
          {
            allowedOrigins: ["*"],
            allowedMethods: [aws_s3.HttpMethods.GET],
            allowedHeaders: ["*"],
          },
        ],
      }
    );

    // Output the bucket name
    new CfnOutput(this, "ProcessedImagesBucketName", {
      value: this.processedImagesBucket.bucketName,
      description: "Name of the processed images bucket",
    });
  }
}
