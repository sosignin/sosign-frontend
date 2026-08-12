import { NextResponse } from "next/server";
import config from "../../../../config/api.js";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Forward the request to the backend
    const backendResponse = await fetch(
      `${config.API_BASE_URL}/api/petitions/${id}`,
      {
        method: "GET",
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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Forward Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(
      `${config.API_BASE_URL}/api/petitions/${id}`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "X-HTTP-Method-Override": "DELETE",
        },
      }
    );

    const text = await backendResponse.text();
    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text || "" };
    }

    return NextResponse.json(result, { status: backendResponse.status });
  } catch (error) {
    console.error("API Error (DELETE):", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    // Forward Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    const methodOverride = request.headers.get("x-http-method-override") || "PUT";
    const headers = { 
      Authorization: authHeader,
      "X-HTTP-Method-Override": methodOverride,
    };
    let body;

    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else if (contentType.includes("application/json")) {
      body = JSON.stringify(await request.json());
      headers["Content-Type"] = "application/json";
    } else {
      try {
        body = await request.formData();
      } catch {
        try {
          body = JSON.stringify(await request.json());
          headers["Content-Type"] = "application/json";
        } catch {
          body = await request.text();
        }
      }
    }

    const backendResponse = await fetch(
      `${config.API_BASE_URL}/api/petitions/${id}`,
      {
        method: "POST",
        headers,
        body,
      }
    );

    const text = await backendResponse.text();
    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text || "" };
    }

    return NextResponse.json(result, { status: backendResponse.status });
  } catch (error) {
    console.error("API Error (PUT):", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  return PUT(request, context);
}
