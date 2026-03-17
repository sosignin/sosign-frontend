import { NextResponse } from "next/server";
import config from "../../../../config/api.js";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));

    const backendResponse = await fetch(
      `${config.API_BASE_URL}/api/aadhaar/send-otp`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body || {}),
      },
    );

    const text = await backendResponse.text();
    let result;

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text || "Failed to parse backend response" };
    }

    return NextResponse.json(result, { status: backendResponse.status });
  } catch (error) {
    console.error("Aadhaar Send OTP API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
