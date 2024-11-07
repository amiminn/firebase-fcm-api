import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import {
  FcmSendNotification,
  FcmSendNotificationUser,
  responseFailed,
  responseSuccess,
} from "./utils";

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
  const { topic, title, body, image, data } = validationResult.data;

  try {
    const payload = { topic, title, body, image, data };
    await FcmSendNotification(payload);

    return c.json(responseSuccess);
  } catch (error) {
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
  const { token, title, body, image, data } = validationResult.data;

  try {
    const payload = { token, title, body, image, data };
    await FcmSendNotificationUser(payload);

    return c.json(responseSuccess);
  } catch (error) {
    return c.json(responseFailed, 400);
  }
});

app.all("*", (c) => {
  return c.json({ message: "404 Not Found" }, 404);
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
  data: z.record(z.string(), z.any()).optional(),
});

const sendNotificationUserSchema = z.object({
  token: z.string({ required_error: "Device Token is required" }),
  title: z.string({ required_error: "Title is required" }),
  body: z.string({ required_error: "Body is required" }),
  image: z.string().url().optional(),
  data: z.record(z.string(), z.any()).optional(),
});
