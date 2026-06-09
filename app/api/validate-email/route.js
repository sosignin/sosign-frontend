export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { isValid: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Make server-side request to ValidEmail API
    const validationResponse = await fetch(
      `https://api.ValidEmail.net/?email=${encodeURIComponent(email)}&token=2bfb71cea3dc47ea8f4cf47b5862fa60`
    );

    if (!validationResponse.ok) {
      return Response.json(
        { isValid: false, message: "Email validation service error" },
        { status: 500 }
      );
    }

    const validationData = await validationResponse.json();

    return Response.json({
      isValid: validationData.isValid || false,
      data: validationData,
    });
  } catch (error) {
    console.error("Email validation error:", error);
    return Response.json(
      { isValid: false, message: "Failed to validate email" },
      { status: 500 }
    );
  }
}
