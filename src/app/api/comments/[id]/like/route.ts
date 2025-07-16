import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${BACKEND_URL}/comments/${params.id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to like comment" }, { status: 500 });
  }
}
