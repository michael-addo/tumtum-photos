import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";

const SHOOT_TYPES = ["solo", "duo", "group", "after-party", "dinner", "location", "other"] as const;
const BUDGETS = ["ghc-400", "ghc-500", "ghc-600", "ghc-700", "ghc-1000-plus", "unsure"] as const;

const enquirySchema = z.object({
  name: z.string().min(2, "Please tell us your name.").max(120, "Please keep your name under 120 characters."),
  email: z.string().email("That email address doesn't look right.").max(254),
  phone: z.string().max(40).optional().or(z.literal("")),
  shootType: z.enum(SHOOT_TYPES, { message: "Pick the kind of shoot you're interested in." }),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date format YYYY-MM-DD.")
    .refine((d) => {
      const year = Number(d.slice(0, 4));
      return year >= 2000 && year <= 2100;
    }, "That date looks out of range.")
    .optional()
    .or(z.literal("")),
  budget: z.enum(BUDGETS).optional().or(z.literal("")),
  message: z.string().min(10, "Tell us a little more — at least 10 characters.").max(4000),
});

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, scope: "enquiries" });

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const check = limiter(req, ip);
  if (!check.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many messages from this connection. Please try again in a few minutes.",
        retryAfter: check.retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": String(check.retryAfter) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "The request body was not valid JSON." },
      { status: 400 },
    );
  }

  // Honeypot
  if (typeof body === "object" && body !== null && !Array.isArray(body)) {
    const hp = (body as Record<string, unknown>).website;
    if (typeof hp === "string" && hp.trim() !== "") {
      return NextResponse.json({
        ok: true,
        id: null,
        message: "Thanks — we'll be in touch.",
      });
    }
  }

  const result = enquirySchema.safeParse(body);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      errors[path] = issue.message;
    }
    return NextResponse.json(
      { error: "invalid_enquiry", errors },
      { status: 422 },
    );
  }

  const data = result.data;
  try {
    const record = await prisma.enquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone === "" || data.phone === undefined ? null : data.phone,
        shootType: data.shootType,
        eventDate: data.eventDate === "" || data.eventDate === undefined ? null : new Date(`${data.eventDate}T00:00:00Z`),
        budget: data.budget === "" || data.budget === undefined ? null : data.budget,
        message: data.message,
      },
    });

    console.log(`[enquiry] ${record.id} · ${record.shootType} · ${record.email}`);

    return NextResponse.json(
      {
        ok: true,
        id: record.id,
        message: "Thanks — we'll reply within one working day.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Enquiry save error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Something went wrong on our end." },
      { status: 500 },
    );
  }
}