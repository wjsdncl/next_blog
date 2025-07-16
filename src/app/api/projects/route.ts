import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type Project } from "@/types/PortfolioType";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

export interface ProjectResponse {
  success: boolean;
  data: Project[];
  meta: {
    pagination: {
      total: number;
      offset: number;
      limit: number;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryString = url.search;

    const response = await fetch(`${BACKEND_URL}/projects${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
