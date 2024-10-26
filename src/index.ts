import { Hono } from "hono";
import { bearerToken, fcmUrl, getAccessToken } from "./getaccesstoken";
import { logger } from "hono/logger";
import axios from "axios";
import { z } from "zod";
import {
  sendNotificationPayload,
  sendNotificationUserPayload,
} from "./payload";
import { responseFailed, responseSuccess } from "./response";

const app = new Hono();
app.use(logger());

const TOKEN = process.env.TOKEN;
const ANTI_DDOS_TIMER = 1; // 1 detik
const requestTimestamps = new Map();

app.use("/api/*", (c: any, next) => {
  const secretToken = c.req.header("access-token");

  if (secretToken !== TOKEN) {
    return c.json({ message: "Access Denied." }, 403);
  }

  return next();
});

app.use("*", (c: any, next) => {
  const clientIp = c.req.header("x-forwarded-for") || c.req.remoteAddr;

  const currentTime = Date.now();
  const lastRequestTime = requestTimestamps.get(clientIp) || 0;

  if (currentTime - lastRequestTime < ANTI_DDOS_TIMER * 1000) {
    return c.json(
      { message: "Too many requests, please try again later." },
      429
    );
  }

  requestTimestamps.set(clientIp, currentTime);

  return next();
});

app.get("/", async (c) => {
  return c.json({
    github: "https://github.com/amiminn/firebase-fcm-api",
  });
});

app.post("/api/send-notification", async (c) => {
  const validationResult = sendNotificationSchema.safeParse(await c.req.json());

  if (!validationResult.success) {
    return c.json({ error: validationResult.error.errors }, 400);
  }
  const { topic, title, body, image } = validationResult.data;
  const data = sendNotificationPayload({ topic, title, body, image });

  try {
    const config = {
      headers: {
        Authorization: "Bearer " + (await bearerToken()),
      },
    };
    const res = await axios.post(fcmUrl, data, config);
    return c.json(responseSuccess);
  } catch (error) {
    await getAccessToken();
    return c.json(responseFailed, 400);
  }
});

app.post("/api/send-notification-user", async (c) => {
  const validationResult = sendNotificationUserSchema.safeParse(
    await c.req.json()
  );

  if (!validationResult.success) {
    return c.json({ error: validationResult.error.errors }, 400);
  }
  const { deviceToken, title, body, image } = validationResult.data;
  const data = sendNotificationUserPayload({ deviceToken, title, body, image });

  try {
    const config = {
      headers: {
        Authorization: "Bearer " + (await bearerToken()),
      },
    };
    const res = await axios.post(fcmUrl, data, config);
    return c.json(responseSuccess);
  } catch (error) {
    await getAccessToken();
    return c.json(responseFailed, 400);
  }
});

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};

const sendNotificationSchema = z.object({
  topic: z.string({ required_error: "Topic is required" }),
  title: z.string({ required_error: "Title is required" }),
  body: z.string({ required_error: "Body is required" }),
  image: z.string().url().optional(),
});

const sendNotificationUserSchema = z.object({
  deviceToken: z.string({ required_error: "Device Token is required" }),
  title: z.string({ required_error: "Title is required" }),
  body: z.string({ required_error: "Body is required" }),
  image: z.string().url().optional(),
});
