import { accessKeyClient, accessKeyOwner } from "@/config";
import { Context, Next } from "hono";

export async function OwnerMiddleware(c: Context, next: Next) {
  const secretToken = c.req.header("access-token");

  if (secretToken !== accessKeyOwner) {
    return c.json({ message: "Access Denied." }, 403);
  }

  return next();
}

export async function ClientMiddleware(c: Context, next: Next) {
  const secretToken = c.req.header("access-token");

  if (secretToken !== accessKeyClient) {
    return c.json({ message: "Access Denied." }, 403);
  }

  return next();
}
