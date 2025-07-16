import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryString = url.search;

    const response = await fetch(`${BACKEND_URL}/users/me${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user info" }, { status: 500 });
  }
}
