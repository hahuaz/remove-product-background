import { Prisma } from "@prisma/client";
import awsSdk from "aws-sdk";
import axios from "axios";
import express from "express";
import sharp from "sharp";

// import prisma from "../config/prisma";
// import redis from "../config/redis";

const {
  AZURE_VISION_KEY,
  AWS_APP_USER_ID,
  AWS_APP_USER_SECRET,
  PROCESSED_IMAGES_BUCKET,
  AWS_REGION,
} = process.env;
if (
  !AZURE_VISION_KEY ||
  !AWS_APP_USER_ID ||
  !AWS_APP_USER_SECRET ||
  !AWS_REGION ||
  !PROCESSED_IMAGES_BUCKET
) {
  throw new Error("Missing environment variables");
}

awsSdk.config.update({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_APP_USER_ID,
    secretAccessKey: AWS_APP_USER_SECRET,
  },
});

const s3 = new awsSdk.S3();

const router = express.Router();

router.post("/preview", async (req, res) => {
  const { shop } = res.locals.shopify
    .session as Prisma.$shopify_sessionsPayload["scalars"];
  const { imageSrc, productId, imageId, selectedColor } = req.body;

  let originalImage;
  try {
    const { data } = await axios.get(imageSrc, {
      responseType: "arraybuffer",
    });
    originalImage = data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch image from the URL");
  }

  // 1. store the original image

  // 2. optimize image before sending for bg removal
  let optimizedOriginalImage: Buffer;
  try {
    optimizedOriginalImage = await sharp(originalImage).webp().toBuffer();
  } catch (error) {
    console.error(error);
    throw new Error("Failed while optimizing originalImage");
  }

  // 3. generate background removed image
  console.log("started azure ai");
  let bgRemovedImage: Buffer;
  try {
    const cognitiveInstanceUrl =
      "https://cognitive-instance.cognitiveservices.azure.com/";

    const removalResult = await axios.post(
      `${cognitiveInstanceUrl}computervision/imageanalysis:segment?api-version=2023-02-01-preview&mode=backgroundRemoval`,
      optimizedOriginalImage,
      {
        headers: {
          "Content-Type": "application/octet-stream",
          "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY,
        },
        responseType: "arraybuffer",
      }
    );
    bgRemovedImage = removalResult.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to recieve bg removed image from service.");
  }
  console.log("finished azure ai");

  // 4. Get the original size of the foreground image
  const { width: foregroundWidth, height: foregroundHeight } = await sharp(
    bgRemovedImage
  ).metadata();

  // Convert RGBa color values to a valid CSS color string
  const rgbaColor = `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a})`;

  // 5. Create a buffer with a color
  const backgroundBuffer = Buffer.from(
    `<svg><rect width="${foregroundWidth}" height="${foregroundHeight}" style="fill:${rgbaColor}" /></svg>`
  );

  // 6. Compose the foreground image over the background image
  const composedImage = await sharp(backgroundBuffer)
    .composite([
      {
        input: bgRemovedImage,
        top: 0,
        left: 0,
        blend: "over",
      },
    ])
    .resize(foregroundWidth, foregroundHeight)
    .webp()
    .toBuffer();

  // 7. save composedImage to S3
  console.log("started s3 upload");
  try {
    await s3
      .putObject({
        Bucket: PROCESSED_IMAGES_BUCKET,
        Key: `${shop}/${productId}-${imageId}.webp`,
        Body: composedImage,
      } as AWS.S3.PutObjectRequest)
      .promise();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload composedImage to S3");
  }

  // Construct the URL for the object
  const previewUrl = `https://${PROCESSED_IMAGES_BUCKET}.s3.amazonaws.com/${shop}/${productId}-${imageId}.webp`;
  console.log("finished s3 upload");

  // 8. send the composedImage URL to the frontend
  return res.status(201).json({ previewUrl });
});

export default router;
