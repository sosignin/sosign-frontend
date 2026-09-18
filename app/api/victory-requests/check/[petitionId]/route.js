import { NextResponse } from "next/server";
import config from "@/config/api";

// Check victory request status for a petition
export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");
    const { petitionId } = await params;

    const response = await fetch(
      `${config.API_BASE_URL}/api/victory-requests/check/${petitionId}`,
      {
        headers: {
          ...(authHeader && { Authorization: authHeader }),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error checking victory request status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
