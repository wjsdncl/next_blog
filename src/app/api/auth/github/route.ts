import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

export async function GET(request: NextRequest) {
  try {
    const githubAuthUrl = `${BACKEND_URL}/auth/oauth?type=github`;
    return NextResponse.redirect(githubAuthUrl);
  } catch (error) {
    return NextResponse.json({ error: "Failed to process GitHub auth" }, { status: 500 });
  }
}
