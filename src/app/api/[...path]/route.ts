import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://blog-api-xhk1.onrender.com";

function getAuthHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const authorization = request.headers.get("Authorization");
  const refreshToken = request.headers.get("X-Refresh-Token");
  if (authorization) headers["Authorization"] = authorization;
  if (refreshToken) headers["X-Refresh-Token"] = refreshToken;
  return headers;
}

async function proxyRequest(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  const queryString = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${queryString}`;

  const authHeaders = getAuthHeaders(request);
  const contentType = request.headers.get("Content-Type");
  const isFormData = contentType?.includes("multipart/form-data");

  const headers: Record<string, string> = { ...authHeaders };
  if (contentType && !isFormData) {
    headers["Content-Type"] = contentType;
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = isFormData ? await request.arrayBuffer() : await request.text();
    if (isFormData && contentType) {
      headers["Content-Type"] = contentType;
    }
  }

  const response = await fetch(targetUrl, fetchOptions);

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("Location");
    if (location) {
      return NextResponse.redirect(location, response.status);
    }
  }

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!["transfer-encoding", "connection", "keep-alive"].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const PUT = proxyRequest;
