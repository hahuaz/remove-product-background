import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import serveStatic from "serve-static";
import ViteExpress from "vite-express";

import { addCorsHeaders } from "./middlewares";
// import PrivacyWebhookHandlers from "./privacy";
import { productsRouter, removeBackgroundRouter } from "./routes";
import shopify from "./shopify";

const IS_DEV = process.env.NODE_ENV === "production" ? false : true;
const EXPRESS_PORT = 3001;

const app = express();

// app.use(async (req, res, next) => {
// TODO log every request
//   next();
// });

// START OF SHOPIFY OAUTH SETUP
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
// END OF SHOPIFY OAUTH SETUP

// currently you don't need to add cors since both frontend and backend are served on the same port.
// if (IS_DEV) {
//   app.use(addCorsHeaders());
// }

// urlencoded will parse the body of the request if it's urlencoded. Urlencoded data is sent by forms and has the following format: key1=value1&key2=value2
// json will parse the body of the request if it's json. Json data is sent by frontend and has the following format: {"key1": "value1", "key2": "value2"}
app.use(express.urlencoded({ extended: true }), express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Success!" });
});
app.use("/api/products", productsRouter);
app.use("/api/remove-background", removeBackgroundRouter);

const createServer = async () => {
  // connect redis, postgresql, etc.

  if (IS_DEV) {
    // work with only one port instead of spinning up two servers just for development
    // reason why viteexpress used instead of creating proxy in vite is that we want to emulate production environment as much as possible. By this approach, we check if user is authorized before serving the app. If vite would serve the app, it would be served before the user is authorized.
    ViteExpress.config({
      // TODO tailwind.config.js should be in the root of the project. in this case, it should be in the root of the backend folder. it seems to can't be configured via api for now.
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
