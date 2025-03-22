import { Hono } from "hono";
import {
  fcmSendNotification,
  fcmSendNotificationUser,
} from "./api/fcmcontroller";
import { ClientMiddleware, OwnerMiddleware } from "./lib/middleware";

const api = new Hono();

api
  .post("fcm/send-notification", OwnerMiddleware, fcmSendNotification)
  .post(
    "fcm/send-notification-user",
    ClientMiddleware,
    fcmSendNotificationUser
  );

export { api as routes };
