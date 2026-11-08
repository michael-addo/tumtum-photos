import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";

export const SHOOT_TYPES = [
  "solo",
  "duo",
  "group",
  "after-party",
  "dinner",
  "location",
  "other",
] as const;

export type ShootType = (typeof SHOOT_TYPES)[number];

export const BUDGETS = ["ghc-400", "ghc-500", "ghc-600", "ghc-700", "ghc-1000-plus", "unsure"] as const;

export type Budget = (typeof BUDGETS)[number];

export interface EnquiryFields {
  name: string;
  email: string;
  phone: string | null;
  shootType: ShootType;
  eventDate: string | null;
  budget: Budget | null;
  message: string;
}

export interface EnquiryRecord extends EnquiryFields {
  id: string;
  receivedAt: string;
}

export type ValidationResult =
  | { ok: true; value: EnquiryFields }
  | { ok: false; errors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const STORE_FILE = path.join(config.dataDir, "enquiries.jsonl");

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isOneOf<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

export function validateEnquiry(payload: unknown): ValidationResult {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, errors: { _form: "Expected a JSON object." } };
  }

  const body = payload as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const name = asText(body.name);
  if (name.length < 2) {
    errors.name = "Please tell us your name.";
  } else if (name.length > 120) {
    errors.name = "Please keep your name under 120 characters.";
  }

  const email = asText(body.email);
  if (email === "") {
    errors.email = "An email address is required.";
  } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = "That email address doesn't look right.";
  }

  const phone = asText(body.phone);
  if (phone.length > 40) {
    errors.phone = "Please keep the phone number under 40 characters.";
  }

  const shootRaw = asText(body.shootType);
  const shootType = isOneOf(SHOOT_TYPES, shootRaw) ? shootRaw : null;
  if (!shootType) {
    errors.shootType = "Pick the kind of shoot you're interested in.";
  }

  const eventDateRaw = asText(body.eventDate);
  let eventDate: string | null = null;
  if (eventDateRaw !== "") {
    const year = Number(eventDateRaw.slice(0, 4));
    const parsed = DATE_PATTERN.test(eventDateRaw)
      ? Date.parse(`${eventDateRaw}T00:00:00Z`)
      : Number.NaN;
    if (!DATE_PATTERN.test(eventDateRaw)) {
      errors.eventDate = "Use the date format YYYY-MM-DD.";
    } else if (Number.isNaN(parsed) || year < 2000 || year > 2100) {
      errors.eventDate = "That date looks out of range.";
    } else {
      eventDate = eventDateRaw;
    }
  }

  const budgetRaw = asText(body.budget);
  let budget: Budget | null = null;
  if (budgetRaw !== "") {
    if (isOneOf(BUDGETS, budgetRaw)) {
      budget = budgetRaw;
    } else {
      errors.budget = "Pick a budget range from the list.";
    }
  }

  const message = asText(body.message);
  if (message.length < 10) {
    errors.message = "Tell us a little more — at least 10 characters.";
  } else if (message.length > 4000) {
    errors.message = "Please keep your message under 4000 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      phone: phone === "" ? null : phone,
      shootType: shootType as ShootType,
      eventDate,
      budget,
      message,
    },
  };
}

export function createEnquiry(fields: EnquiryFields): EnquiryRecord {
  return {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    ...fields,
  };
}

// Serialise appends so concurrent submissions can't interleave partial lines.
let writeChain: Promise<void> = Promise.resolve();

export function saveEnquiry(record: EnquiryRecord): Promise<void> {
  const line = `${JSON.stringify(record)}\n`;
  const next = writeChain.then(async () => {
    await fs.mkdir(config.dataDir, { recursive: true });
    await fs.appendFile(STORE_FILE, line, "utf8");
  });
  writeChain = next.catch(() => undefined);
  return next;
}

export async function listEnquiries(limit = 200): Promise<EnquiryRecord[]> {
  let raw: string;
  try {
    raw = await fs.readFile(STORE_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const records: EnquiryRecord[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    try {
      records.push(JSON.parse(trimmed) as EnquiryRecord);
    } catch {
      // Ignore a partially written trailing line rather than failing the whole listing.
    }
  }

  const safeLimit = Math.min(1000, Math.max(1, limit));
  return records.reverse().slice(0, safeLimit);
}
