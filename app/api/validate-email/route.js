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

    // The API might return lowercase or uppercase keys
    const apiIsValid = validationData.isValid !== undefined ? validationData.isValid : validationData.IsValid;
    const apiScore = validationData.score !== undefined ? validationData.score : validationData.Score;
    const apiDisposable = validationData.disposable !== undefined ? validationData.disposable : validationData.Disposable;
    const apiState = validationData.state !== undefined ? validationData.state : validationData.State;
    const apiReason = validationData.reason !== undefined ? validationData.reason : validationData.Reason;
    const apiFree = validationData.free !== undefined ? validationData.free : validationData.Free;
    const apiRole = validationData.role !== undefined ? validationData.role : validationData.Role;

    const isValid = apiIsValid === true && (apiScore || 0) >= 80;
    const isDisposable = apiDisposable === true;

    return Response.json({
      isValid: isValid && !isDisposable,
      score: apiScore || 0,
      state: apiState || "Unknown",
      reason: apiReason || "",
      disposable: isDisposable,
      free: apiFree || false,
      role: apiRole || false,
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
