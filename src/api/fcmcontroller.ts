import {
  FcmSendNotification,
  FcmSendNotificationUser,
  responseFailed,
  responseSuccess,
} from "@/lib/fcmservice";
import { Context } from "hono";
import { z } from "zod";

export async function fcmSendNotification(c: Context) {
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
}

export async function fcmSendNotificationUser(c: Context) {
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
}

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
