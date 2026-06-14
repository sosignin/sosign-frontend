import { NextRequest, NextResponse } from "next/server";
import config from "../../../../../config/api.js";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    // Get the Authorization header from the request
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    // Read optional referralCode and constituencyNumber from request body
    let body = null;
    try {
      const json = await request.json().catch(() => null);
      if (json && typeof json === "object") {
        body = JSON.stringify({
          referralCode: json.referralCode,
          constituencyNumber: json.constituencyNumber,
          aadharNumber: json.aadharNumber,
          aadhaarVerificationToken: json.aadhaarVerificationToken,
          aadharVerificationToken: json.aadharVerificationToken,
        });
      }
    } catch (e) {
      body = null;
    }

    // Forward the request to the backend with the Authorization header and body
    const backendResponse = await fetch(
      `${config.API_BASE_URL}/api/petitions/${id}/sign`,
      {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body,
      }
    );

    const result = await backendResponse.json();

    if (backendResponse.ok) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: backendResponse.status });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
