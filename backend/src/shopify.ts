import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import { shopifyApp } from "@shopify/shopify-app-express";
import { PostgreSQLSessionStorage } from "@shopify/shopify-app-session-storage-postgresql";

if (process.env.DATABASE_URL == undefined) {
  throw new Error("Missing DATABASE_URL");
}

const { SHOPIFY_APP_ID, SHOPIFY_APP_SECRET, APP_URL } = process.env;
if (!SHOPIFY_APP_ID || !SHOPIFY_APP_SECRET || !APP_URL) {
  throw new Error("Missing or invalid environment variables.");
}

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  // https://github.com/Shopify/shopify-api-js/tree/main/packages/shopify-api
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: undefined, // or replace with billingConfig above to enable example billing
    apiKey: SHOPIFY_APP_ID,
    apiSecretKey: SHOPIFY_APP_SECRET,
    scopes: ["read_products", "write_products"],
    // hostName should be domain, url without protocol
    hostName: new URL(APP_URL).hostname,
    isEmbeddedApp: true,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // all the required functions are as following https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-session-storage/implementing-session-storage.md
  sessionStorage: new PostgreSQLSessionStorage(
    // 'postgres://username:password@host/database',
    process.env.DATABASE_URL
  ),
});

export default shopify;
