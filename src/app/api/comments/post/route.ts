import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type Comment } from "@/types/BlogType";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

export interface CommentResponse {
  success: boolean;
  data: Comment[];
  meta: {
    totalCount: number;
    offset: number;
    limit: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const queryString = url.search;

    const response = await fetch(`${BACKEND_URL}/comments/${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: response.status });
    }

    const data: CommentResponse = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
