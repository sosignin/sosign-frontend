import { NextResponse } from "next/server";
import config from "../../../../../config/api.js";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization") || "";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "";
    const userAgent = request.headers.get("user-agent") || "";

    const headers = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }
    if (ip) {
      headers["X-Forwarded-For"] = ip;
    }
    if (userAgent) {
      headers["User-Agent"] = userAgent;
    }

    const backendResponse = await fetch(
      `${config.API_BASE_URL}/api/petitions/${id}/view`,
      {
        method: "POST",
        headers,
      }
    );

    const result = await backendResponse.json();

    if (backendResponse.ok) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: backendResponse.status });
    }
  } catch (error) {
    console.error("API Error (record petition view):", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
