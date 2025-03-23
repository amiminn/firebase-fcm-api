import { db } from "@/lib/db";
import { responseError, responseSuccess } from "@/lib/response";
import { Context } from "hono";
import { z } from "zod";

const createdevice = z.object({
  token: z.string(),
  topic: z.string(),
  deviceKey: z.string(),
});

export async function createDevice(c: Context) {
  const result = createdevice.safeParse(await c.req.json());

  try {
    if (!result.success) {
      return c.json(result.error, 400);
    }

    const device = await db.device.findUnique({
      where: {
        deviceKey: result.data.deviceKey,
      },
    });

    if (!device) {
      await db.device.create({
        data: {
          token: result.data.token,
          topic: result.data.topic,
          deviceKey: result.data.deviceKey,
        },
      });

      return c.json(responseSuccess("device baru dibuat."), 201);
    }

    return c.json(responseSuccess("device ditemukan."));
  } catch (error) {
    return c.json(responseError("An unexpected error occurred."), 500);
  }
}
