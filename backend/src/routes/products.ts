import { Prisma } from "@prisma/client";
import axios from "axios";
import express from "express";

// import prisma from "../config/prisma";
// import shopify from "../shopify";

const router = express.Router();

router.get("/", async (req, res) => {
  // get shopify from locals which is set in shopify.validateAuthenticatedSession middleware
  // TODO get type from prisma
  const { shop, accessToken } = res.locals.shopify
    .session as Prisma.$shopify_sessionsPayload["scalars"];

  const shopifyProductParams: any = {
    fields: "id,title,created_at,images,status",
  };

  // get products via shopify api
  const { data } = await axios.get(
    `https://${shop}/admin/api/2023-04/products.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
      params: shopifyProductParams,
    }
  );

  // return products
  res.json(data.products);
});

router.get("/:id", async (req, res) => {
  const { shop, accessToken } = res.locals.shopify
    .session as Prisma.$shopify_sessionsPayload["scalars"];

  const { data } = await axios.get(
    `https://${shop}/admin/api/2023-04/products/${req.params.id}.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    }
  );

  res.json(data);
});

export default router;
