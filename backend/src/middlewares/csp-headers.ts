import { Shopify } from "@shopify/shopify-api";
import { NextFunction, Request, Response } from "express";

import { CspHeadersMiddleware } from "./types";

interface CspHeadersParams {
  api: Shopify;
}

export function cspHeaders({ api }: CspHeadersParams): CspHeadersMiddleware {
  return function cspHeaders() {
    return async (req: Request, res: Response, next: NextFunction) => {
      addCSPHeader(api, req, res);
      next();
    };
  };
}

export function addCSPHeader(api: Shopify, req: Request, res: Response) {
  const shop = api.utils.sanitizeShop(req.query.shop as string);
  if (api.config.isEmbeddedApp && shop) {
    res.setHeader(
      "Content-Security-Policy",
      `frame-ancestors https://${encodeURIComponent(
        shop
      )} https://admin.shopify.com https://*.spin.dev;`
    );
  } else {
    res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
  }
}
