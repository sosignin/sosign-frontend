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
    const validationToken = process.env.VALID_EMAIL_TOKEN || "2bfb71cea3dc47ea8f4cf47b5862fa60";
    const validationResponse = await fetch(
      `https://api.ValidEmail.net/?email=${encodeURIComponent(email)}&token=${validationToken}`
    );

    if (!validationResponse.ok) {
      // If the validation service is down, allow the email through
      // to avoid blocking users
      return Response.json({
        isValid: true,
        message: "Email validation service unavailable, allowing through",
      });
    }

    const validationData = await validationResponse.json();

    // The API returns "IsValid" (uppercase I), "Score", "State", etc.
    const isValid = validationData.IsValid === true && (validationData.Score || 0) >= 80;
    const isDisposable = validationData.Disposable === true;

    return Response.json({
      isValid: isValid && !isDisposable,
      score: validationData.Score || 0,
      state: validationData.State || "Unknown",
      reason: validationData.Reason || "",
      disposable: isDisposable,
      free: validationData.Free || false,
      role: validationData.Role || false,
      data: validationData,
    });
  } catch (error) {
    console.error("Email validation error:", error);
    // On error, allow the email through to avoid blocking users
    return Response.json({
      isValid: true,
      message: "Email validation failed, allowing through",
    });
  }
}
