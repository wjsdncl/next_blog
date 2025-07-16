import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryString = url.search;

    // 백엔드 GitHub OAuth URL로 리디렉션
    const githubAuthUrl = `${BACKEND_URL}/auth/github${queryString}`;

    return NextResponse.redirect(githubAuthUrl);
  } catch (error) {
    return NextResponse.json({ error: "Failed to process GitHub auth" }, { status: 500 });
  }
}
