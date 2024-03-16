import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import serveStatic from "serve-static";
import ViteExpress from "vite-express";

import { addCorsHeaders } from "./middlewares";
// import PrivacyWebhookHandlers from "./privacy";
import { productRouter, removeBackgroundRouter } from "./routes";
import shopify from "./shopify";

const IS_DEV = process.env.NODE_ENV === "production" ? false : true;
const EXPRESS_PORT = 3001;

const app = express();

// app.use(async (req, res, next) => {
// TODO log every request
//   next();
// });

// START OF SHOPIFY SETUP
/**
 * about shopify oauth process:
 * 1. it doesn't save any info in session storage about oauth begin.
 * 2. it uses secure cookies to verify the nonce to prevent CSRF attacks. It has no alternative since it didn't save any info in session storage about oauth begin. it implements safe compare, etc. to increase security. So it's good idea to use shopify api for oauth process.
 * 3. At the end of oauth callback, it saves session in session storage with access token, shop name, etc.
 * 4. if the app is installed in store on shopify side but somehow you lost the session in your db, user won't go through oauth process again. Shopify will handle oauth process under the hood and will call your oauth callback url so you can save the session in your db again.
 */
app.get(shopify.config.auth.path, shopify.auth.begin());
// shopify utilizes secure cookies to verify the
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
app.get(
  "/",
  shopify.ensureInstalledOnShop(), // if root is accessed, meaning entry of the app is accessed, check if user is authorized before serving the app. if not, it will redirect to shopify auth page.
  shopify.cspHeaders(), // add Content-Security-Policy header to protect from clickjacking
  async (req, res, next) => {
    // be aware, shopify won't allow you to redirect user to http protocol on admin panel, even for dev mode.
    // shopify calls your app with bunch of query params as following, you have to pass host to frontend since AppBridge uses it for security reasons. Host is base64 encoded host name of the app.
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
    // getOfflineId is pk of the session in session storage. it's derived from shop name and has following format: offline_<shop>
    // const sessionId = shopify.api.session.getOfflineId(
    //   req.query.shop as string
    // );
    // get session from session storage db
    // const {accessToken} = await shopify.config.sessionStorage.loadSession(sessionId);
    next();
  }
);

// protect all api routes except /api/auth, /api/auth/callback and webhooks. Webhooks have different validator on their own.
// This makes sure all requests are originating from Shopify admin panel and will deny unauthorized requests.
app.use("/api/*", shopify.validateAuthenticatedSession());
// END OF SHOPIFY SETUP

// if dev, add cors headers to be able to work with localhosted frontend
if (IS_DEV) {
  app.use(addCorsHeaders());
}

// urlencoded will parse the body of the request if it's urlencoded. Urlencoded data is sent by forms and has the following format: key1=value1&key2=value2
// json will parse the body of the request if it's json. Json data is sent by frontend and has the following format: {"key1": "value1", "key2": "value2"}
app.use(express.urlencoded({ extended: true }), express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Success!" });
});
app.use("/api/products", productRouter);
app.use("/api/remove-background", removeBackgroundRouter);

// connect to services and start the express app
const createServer = async () => {
  // connect redis, postgresql, etc.

  if (IS_DEV) {
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
