import express from "express";
import type { Application } from "express";
import serveStatic from "serve-static";
import { join } from "path";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();
console.log("process.env", process.env.SHOPIFY_APP_ID);

import shopify from "./shopify";
// import PrivacyWebhookHandlers from "./privacy";

// import redis from "./config/redis";

import { productRouter, removeBackgroundRouter } from "./routes";

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app: Application = express();
const EXPRESS_PORT = 3001;

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
// app.post(
//   shopify.config.webhooks.path,
//   shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
// );

app.use("/api/*", shopify.validateAuthenticatedSession());

// TODO encoding added by me may cause issues
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res.status(200).send({
    message:
      "Shopify app installed for store. Open other port until serving static content from backend.",
  });
});

// end shopify setup

// TODO limit cors before prod
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(async (req, res, next) => {
  console.log(req.method, req.url, req.headers, JSON.stringify(req.body || {}));
  next();
});
app.get("/", async (_req, res) => {
  res.send("Hello World!");
});
app.use("/api/products", productRouter);
app.use("/api/remove-background", removeBackgroundRouter);

// connect to services and start the express app
const startApp = async () => {
  // await redis.connect();

  // const rabbitmqChannel = await getRabbitMQChannel();
  // await rabbitmqChannel.assertQueue("validate-name");

  app.listen(EXPRESS_PORT, () => {
    console.log(
      `You can connect to express app on http://localhost:${EXPRESS_PORT}`
    );
  });
};
startApp();
