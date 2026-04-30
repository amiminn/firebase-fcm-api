import { DeviceRow, sql } from "@/lib/db";
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

    const devices = (await sql`
      SELECT *
      FROM "Device"
      WHERE "deviceKey" = ${result.data.deviceKey}
      LIMIT 1
    `) as DeviceRow[];
    const [device] = devices;

    if (!device) {
      await sql`
        INSERT INTO "Device" (
          "id",
          "deviceKey",
          "token",
          "topic",
          "updatedAt"
        )
        VALUES (
          ${crypto.randomUUID()},
          ${result.data.deviceKey},
          ${result.data.token},
          ${result.data.topic},
          CURRENT_TIMESTAMP
        )
      `;

      return c.json(responseSuccess("device baru dibuat."), 201);
    }

    return c.json(responseSuccess("device ditemukan."));
  } catch (error) {
    return c.json(responseError("An unexpected error occurred."), 500);
  }
}
