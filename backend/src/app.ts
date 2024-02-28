import express from "express";
import type { Application } from "express";
import serveStatic from "serve-static";
import { join } from "path";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();
import shopify from "./shopify";
// import PrivacyWebhookHandlers from "./privacy";
// import redis from "./config/redis";
import { productRouter, removeBackgroundRouter } from "./routes";
import ViteExpress from "vite-express";

const isDev = process.env.NODE_ENV === "production" ? false : true;

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
const EXPRESS_PORT = 3001;

app.use(async (req, res, next) => {
  console.log(req.method, req.url, req.headers, JSON.stringify(req.body || {}));
  next();
});

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

// protect all routes except /api/auth, /api/auth/callback and webhooks. This makes sure all requests are originating from Shopify admin panel
app.use("/api/*", shopify.validateAuthenticatedSession());

// TODO encoding added by me may cause issues
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// TODO shopify.ensureInstalledOnShop() redirects unistalled shops to shopify app install page. it can be customized if check only made to our db and not shopify
// [shopify-app/INFO] Running ensureInstalledOnShop
// 2024-01-29 22:48:53 [shopify-app/INFO] Found a session, but it is not valid. Redirecting to auth | {shop: dev-hahuaz.myshopify.com}
// 2024-01-29 22:48:53 [shopify-api/INFO] Beginning OAuth | {shop: dev-hahuaz.myshopify.com, isOnline: false, callbackPath: /api/auth/callback}
app.get("/", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  console.log(
    "shopify.ensureInstalledOnShop() passed for get root, now let to serve frontend"
  );
  // TODO if it didn't pass and has correct params, redirect to oauth page. if it doesn't have correct params, ignore it
  // be aware, shopify won't allow you to redirect user to http protocol on admin panel, even for dev mode.
  // shopify calls your app with bunch of query params as following, you need to pass host to frontend since AppBridge needs it
  // {
  //    embedded: '1',
  //    hmac: 'yours',
  //    host: 'yours', // base64 encoded host
  //    id_token: 'yours',
  //    locale: 'en-US',
  //    session: 'yours',
  //    shop: 'dev-hahuaz.myshopify.com',
  //    timestamp: '1709121895'
  //  }
  _next();
});

// end shopify setup

// TODO limit cors before prod
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/products", productRouter);
app.use("/api/remove-background", removeBackgroundRouter);

// connect to services and start the express app
const createServer = async () => {
  // await redis.connect();

  // const rabbitmqChannel = await getRabbitMQChannel();
  // await rabbitmqChannel.assertQueue("validate-name");

  if (isDev) {
    ViteExpress.config({
      viteConfigFile: join(__dirname, "../../frontend/vite.config.ts"),
      mode: "development",
    });
    ViteExpress.listen(app, EXPRESS_PORT, () =>
      console.log(
        `You can connect to express app on http://localhost:${EXPRESS_PORT}`
      )
    );
  } else {
    // TODO serve build files on production
  }
};
createServer();
