import { NextRequest, NextResponse } from "next/server";
import config from "../../../../../config/api.js";

async function handleSignRequest(request, params, defaultMethod = "POST") {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

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

    // Send POST to backend first (bypasses WAF/proxy PUT blocking), fallback to PUT if needed
    let backendResponse = await fetch(
      `${config.API_BASE_URL}/api/petitions/${id}/sign`,
      {
        method: defaultMethod,
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body,
      }
    );

    // If method was rejected by proxy (405 or 403), retry with alternative HTTP method
    if (backendResponse.status === 405 || backendResponse.status === 403) {
      const fallbackMethod = defaultMethod === "POST" ? "PUT" : "POST";
      const retryResponse = await fetch(
        `${config.API_BASE_URL}/api/petitions/${id}/sign`,
        {
          method: fallbackMethod,
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body,
        }
      );
      if (retryResponse.ok || retryResponse.status !== 403) {
        backendResponse = retryResponse;
      }
    }

    let result;
    const contentType = backendResponse.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      result = await backendResponse.json();
    } else {
      const rawText = await backendResponse.text();
      // Remove HTML markup if server returned HTML error page (e.g. WAF 403)
      const cleanMessage = rawText.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
      result = { message: cleanMessage || `Server error (${backendResponse.status})` };
    }

    return NextResponse.json(result, { status: backendResponse.status });
  } catch (error) {
    console.error("API Sign Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  return handleSignRequest(request, params, "POST");
}

export async function POST(request, { params }) {
  return handleSignRequest(request, params, "POST");
}
