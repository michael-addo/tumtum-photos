import express from "express";
import type { NextFunction, Request, Response } from "express";
import { config, isProduction } from "./config.js";
import { adminEnabled, requireAdmin } from "./admin.js";
import { createEnquiry, listEnquiries, saveEnquiry, validateEnquiry } from "./enquiries.js";
import { getGallery } from "./gallery.js";
import { rateLimit } from "./rate-limit.js";

const app = express();

app.disable("x-powered-by");
if (config.trustProxy) app.set("trust proxy", true);

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self'",
      "script-src 'self'",
      "connect-src 'self'",
      "font-src 'self'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  next();
});

app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "northlight-studio", time: new Date().toISOString() });
});

app.get("/api/gallery", async (_req, res, next) => {
  try {
    res.json(await getGallery());
  } catch (error) {
    next(error);
  }
});

const enquiryLimiter = rateLimit({ windowMs: 15 * 60_000, max: 8, scope: "enquiries" });

app.post("/api/enquiries", enquiryLimiter, async (req, res, next) => {
  try {
    const body: unknown = req.body;

    // Honeypot: real people never fill this in. Accept quietly so bots learn nothing.
    if (typeof body === "object" && body !== null) {
      const honeypot = (body as Record<string, unknown>).website;
      if (typeof honeypot === "string" && honeypot.trim() !== "") {
        res.status(201).json({ ok: true, id: null, message: "Thanks — we'll be in touch." });
        return;
      }
    }

    const result = validateEnquiry(body);
    if (!result.ok) {
      res.status(422).json({ error: "invalid_enquiry", errors: result.errors });
      return;
    }

    const record = createEnquiry(result.value);
    await saveEnquiry(record);
    console.log(`[enquiry] ${record.id} · ${record.shootType} · ${record.email}`);

    res.status(201).json({
      ok: true,
      id: record.id,
      message: "Thanks — we'll reply within one working day.",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/enquiries", requireAdmin, async (req, res, next) => {
  try {
    const raw = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : 200;
    const limit = Number.isFinite(raw) ? raw : 200;
    res.json({ enquiries: await listEnquiries(limit) });
  } catch (error) {
    next(error);
  }
});

app.use(
  express.static(config.publicDir, {
    extensions: ["html"],
    index: "index.html",
    maxAge: isProduction ? "1h" : 0,
  }),
);

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "not_found", message: "No such API route." });
    return;
  }
  res.status(404).type("text/plain").send("Not found");
});

// Express needs all four parameters to recognise this as an error handler.
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;

  const details = error as { status?: number; type?: string; message?: string };

  if (details.type === "entity.too.large" || details.status === 413) {
    res.status(413).json({ error: "payload_too_large", message: "That request was too large." });
    return;
  }

  if (details.type === "entity.parse.failed") {
    res.status(400).json({ error: "invalid_json", message: "The request body was not valid JSON." });
    return;
  }

  console.error("[error]", error);
  res.status(500).json({ error: "internal_error", message: "Something went wrong on our end." });
});

async function main(): Promise<void> {
  const gallery = await getGallery();
  console.log(
    `[gallery] ${gallery.images.length} images across ${gallery.collections.length} collections`,
  );

  const server = app.listen(config.port, config.host, () => {
    console.log(`TUMTUM PHOTOS → http://${config.host}:${config.port}`);
    console.log(`Admin → http://${config.host}:${config.port}/admin`);
    if (!adminEnabled()) {
      console.warn("[admin] ADMIN_TOKEN is not set, so /admin and the admin API return 503.");
    }
  });

  server.on("error", (error: Error) => {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EADDRINUSE") {
      console.error(`Port ${config.port} is already in use. Set PORT to something else.`);
    } else {
      console.error(`Server error: ${error.message}`);
    }
    process.exitCode = 1;
  });

  const shutdown = (signal: string): void => {
    console.log(`\n[${signal}] closing server`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error: unknown) => {
  console.error("Failed to start:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
