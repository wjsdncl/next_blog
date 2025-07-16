import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      return NextResponse.json({ error: "Authorization code is required" }, { status: 400 });
    }

    // 백엔드에 콜백 처리 요청
    const response = await fetch(`${BACKEND_URL}/auth/github/callback?code=${code}&state=${state || ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "GitHub authentication failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process GitHub callback" }, { status: 500 });
  }
}
