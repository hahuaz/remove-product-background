import axios from "axios";
import express from "express";
import sharp from "sharp";

// import prisma from "../config/prisma";
// import redis from "../config/redis";

const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY;
if (!AZURE_VISION_KEY) {
  throw new Error("AZURE_VISION_KEY is not set.");
}

const router = express.Router();

router.get("/preview", async (req, res) => {
  const { imageSrc, productId, imageId, selectedColor } = req.body;
  const { data: originalImage } = await axios.get(imageSrc, {
    responseType: "arraybuffer",
  });

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
  // await s3
  // .putObject({
  //   Bucket: PROCESSED_IMAGES_BUCKET,
  //   Key: `${shopifyDomain}/${productId}-${imageId}.png`,
  //   Body: composedImage,
  // } as AWS.S3.PutObjectRequest)
  // .promise();

  // Construct the URL for the object
  //  const previewUrl = `https://${PROCESSED_IMAGES_BUCKET}.s3.amazonaws.com/${shopifyDomain}/${productId}-${imageId}.png`;

  // 8. send the composedImage URL to the frontend
  // res.json({ previewUrl });
});

export default router;
