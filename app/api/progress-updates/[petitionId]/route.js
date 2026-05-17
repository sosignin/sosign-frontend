import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// @desc    Get progress updates for a petition
// @route   GET /api/progress-updates/[petitionId]
export async function GET(request, { params }) {
  try {
    const { petitionId } = await params;

    const headers = {
      "Content-Type": "application/json",
    };

    // Forward auth header if present (for reaction status)
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/progress-updates/${petitionId}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch updates" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching progress updates:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// @desc    Create a progress update
// @route   POST /api/progress-updates/[petitionId]
export async function POST(request, { params }) {
  try {
    const { petitionId } = await params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    // Forward the FormData directly to the backend
    const formData = await request.formData();

    const response = await fetch(
      `${API_BASE_URL}/api/progress-updates/${petitionId}`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to create update" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating progress update:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
