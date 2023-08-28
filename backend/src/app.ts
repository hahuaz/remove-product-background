import express, { Application } from "express";

// import redis from "./config/redis";

import {
  organizationRouter,
  personRouter,
  testRouter,
  skillRouter,
} from "./routes";

const app: Application = express();
const EXPRESS_PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (_req, res) => {
  res.send("Hello World!");
});
app.use("/api", testRouter);
// app.use("/organizations", organizationRouter);
// app.use("/skills", skillRouter);
// app.use("/persons", personRouter);

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
