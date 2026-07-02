import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function POST(request) {
  try {
    const { title } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    // Sanitize the title - remove quotes that could break the prompt
    const sanitizedTitle = title.replace(/"/g, "").replace(/'/g, "");

    const prompt = `You are a petition title optimizer. Your ONLY job is to output a single corrected petition title.

Rules:
- Fix spelling and grammar mistakes
- Make it SEO-friendly, clear, and action-oriented
- Keep it under 150 characters
- Preserve the original meaning completely
- Do NOT add explanations, notes, alternatives, or commentary
- Do NOT add quotes around the output
- Output ONLY one single line with the improved title

INPUT TITLE: ${sanitizedTitle}

CORRECTED TITLE:`;

    // Add a 15-second timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            stopSequences: ["\n\n"],
          },
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { message: "Request timed out. Please try again." },
          { status: 408 }
        );
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", response.status, errorData);

      if (response.status === 429) {
        return NextResponse.json(
          {
            message:
              "AI service is busy. Please wait a few seconds and try again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: "AI service unavailable. Please try again later." },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Extract the generated text from Gemini's response
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { message: "Failed to generate optimized title. Please try again." },
        { status: 500 }
      );
    }

    // Post-process: take only the first line, strip quotes and prefixes
    let cleanTitle = rawText
      .split("\n")[0]                      // Take only the first line
      .trim()
      .replace(/^["']|["']$/g, "")         // Remove surrounding quotes
      .replace(/^(CORRECTED TITLE:\s*)/i, "") // Remove any echoed prefix
      .replace(/^(Title:\s*)/i, "")        // Remove "Title:" prefix
      .trim();

    // If the result is too short or looks like an error, return original
    if (cleanTitle.length < 5) {
      cleanTitle = title;
    }

    return NextResponse.json({ optimizedTitle: cleanTitle }, { status: 200 });
  } catch (error) {
    console.error("AI Title Optimization Error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
