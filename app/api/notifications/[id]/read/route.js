import { NextRequest, NextResponse } from "next/server";
import config from "../../../../../config/api.js";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header is required" },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${config.API_BASE_URL}/api/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const result = await backendResponse.json();
    return NextResponse.json(result, { status: backendResponse.status });
  } catch (error) {
    console.error("Notification Read Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
