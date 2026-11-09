import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function GET(req: NextRequest) {
  const token = getBearerToken(req);
  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { error: "unauthorized", message: "A valid admin token is required." },
      { status: 401 },
    );
  }

  const rawLimit = req.nextUrl.searchParams.get("limit");
  const limit = rawLimit ? Math.min(1000, Math.max(1, Number(rawLimit) || 200)) : 200;

  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Admin enquiries error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Could not load enquiries." },
      { status: 500 },
    );
  }
}