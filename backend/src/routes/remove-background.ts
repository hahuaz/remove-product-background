import express from "express";

import prisma from "../config/prisma";
// import redis from "../config/redis";

const router = express.Router();

// get all services
router.get("/test", async (req, res) => {
  console.log("server hit");
  res.json({ message: "success" });
});

export default router;
