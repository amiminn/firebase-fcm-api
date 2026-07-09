import { Hono } from "hono";
import { routes } from "./routes";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

app.use(
  "*",
  cors({
    origin: ["*", "http://localhost:5173"],
    allowHeaders: ["Content-Type", "Authorization", "Client-Key"], // Header yang diizinkan
    credentials: true, // Jika menggunakan cookie atau auth token
  })
);

app.get("/", (c: any) => {
  return c.json({
    author: "amiminn",
    official: "https://amiminn.my.id",
    github: "https://github.com/amiminn",
  });
});

app.route("/api", routes);

app.all("*", (c) => {
  return c.json({ message: "404 Not Found" }, 404);
});

console.log("run bun ..😎");

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
