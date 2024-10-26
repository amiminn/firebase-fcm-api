import { Hono } from "hono";
import { bearerToken, fcmUrl, getAccessToken } from "./getaccesstoken";
import { logger } from "hono/logger";
import axios from "axios";

const app = new Hono();
app.use(logger());

const TOKEN = process.env.TOKEN;
const ANTI_DDOS_TIMER = 1; // 1 detik
const requestTimestamps = new Map();

app.use("*", (c: any, next) => {
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
  return c.json({ author: "amiminn", github: "https://github.com/amiminn" });
});

app.post("/get-access-token", async (c) => {
  try {
    const accessToken = await getAccessToken();
    return c.json(accessToken);
  } catch (error) {
    return c.json({ error });
  }
});

app.post("/api/send-notification", async (c) => {
  const { topic, title, body, image } = await c.req.json();
  const data = {
    message: {
      topic,
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          image,
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          image,
        },
      },
      webpush: {
        headers: {
          image,
        },
      },
    },
  };

  try {
    const config = {
      headers: {
        Authorization: "Bearer " + (await bearerToken()),
      },
    };
    const res = await axios.post(fcmUrl, data, config);
    return c.json({ success: true, msg: "Notifikasi berhasil terkirim." });
  } catch (error) {
    await getAccessToken();
    return c.json(
      {
        success: false,
        msg: "Notifikasi gagal terkirim, silahkan cobalagi.",
      },
      400
    );
  }
});

app.post("/api/send-notification-user", async (c) => {
  const { title, body, image, deviceToken } = await c.req.json();
  const data = {
    message: {
      token: deviceToken,
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          image,
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          image,
        },
      },
      webpush: {
        headers: {
          image,
        },
      },
    },
  };

  try {
    const config = {
      headers: {
        Authorization: "Bearer " + (await bearerToken()),
      },
    };
    const res = await axios.post(fcmUrl, data, config);
    return c.json({ success: true, msg: "Notifikasi berhasil terkirim." });
  } catch (error) {
    await getAccessToken();
    return c.json(
      {
        success: false,
        msg: "Notifikasi gagal terkirim, silahkan cobalagi.",
      },
      400
    );
  }
});

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
