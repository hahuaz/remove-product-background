import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import serveStatic from "serve-static";
import ViteExpress from "vite-express";

// import PrivacyWebhookHandlers from "./privacy";
import { productRouter, removeBackgroundRouter } from "./routes";
// TODO remove dotenv after emracing docker .env
// import dotenv from "dotenv";
// dotenv.config();
import shopify from "./shopify";

const isDev = process.env.NODE_ENV === "production" ? false : true;

const app = express();
const EXPRESS_PORT = 3001;

// app.use(async (req, res, next) => {
//   console.log(req.method, req.url, req.headers, JSON.stringify(req.body || {}));
//   next();
// });

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
// TODO make sure webhook requests are authenticated
// app.post(
//   shopify.config.webhooks.path,
//   shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
// );
// TODO shopify.ensureInstalledOnShop() redirects unistalled shops to shopify app install page. it can be customized if check only made to our db and not shopify
// [shopify-app/INFO] Running ensureInstalledOnShop
// 2024-01-29 22:48:53 [shopify-app/INFO] Found a session, but it is not valid. Redirecting to auth | {shop: dev-hahuaz.myshopify.com}
// 2024-01-29 22:48:53 [shopify-api/INFO] Beginning OAuth | {shop: dev-hahuaz.myshopify.com, isOnline: false, callbackPath: /api/auth/callback}

app.get(
  "/",
  shopify.ensureInstalledOnShop(), // if root is accessed, meaning entry of the app is accessed, check if user is authorized before serving the app
  shopify.cspHeaders(), // add Content-Security-Policy header to protect from clickjacking
  async (_req, res, _next) => {
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
  }
);

// protect all api routes except  /api/auth, /api/auth/callback and webhooks. This makes sure all requests are originating from Shopify admin panel
app.use("/api/*", shopify.validateAuthenticatedSession());

// parse urlencoded and json body
app.use(express.urlencoded({ extended: true }), express.json());
// end shopify setup

// TODO limit cors before prod
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Success!" });
});
app.use("/api/products", productRouter);
app.use("/api/remove-background", removeBackgroundRouter);

// connect to services and start the express app
const createServer = async () => {
  // await redis.connect();

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
    //   const STATIC_PATH =
    // process.env.NODE_ENV === "production"
    //   ? `${process.cwd()}/frontend/dist`
    //   : `${process.cwd()}/frontend/`;
    // app.use(serveStatic(STATIC_PATH, { index: false }));
  }
};
createServer();
