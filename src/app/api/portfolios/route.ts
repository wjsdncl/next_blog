import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type Portfolio } from "@/types/portfolioType";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

export interface PortfolioResponse {
  success: boolean;
  data: Portfolio[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryString = url.search;

    const response = await fetch(`${BACKEND_URL}/portfolios${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch portfolios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/portfolios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create portfolio" }, { status: 500 });
  }
}
