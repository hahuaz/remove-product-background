import express, { Application } from "express";

// import redis from "./config/redis";

import { testRouter } from "./routes";

const app: Application = express();
const EXPRESS_PORT = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// TODO limit cors before prod
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

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
