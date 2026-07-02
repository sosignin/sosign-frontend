import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, problem, solution, prompt: userPrompt } = body;

    const topic = userPrompt || title || problem || "Community action petition";

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { message: "Petition title or prompt is required for image generation" },
        { status: 400 }
      );
    }

    // 1. Use Gemini to craft a photojournalistic visual prompt
    let visualPrompt = topic;

    if (GEMINI_API_KEY) {
      const systemPrompt = `You are an award-winning photojournalist creating image descriptions for real petition campaign photos.
Based on the petition topic: "${topic.replace(/"/g, "")}", write a descriptive prompt for an authentic, real-life documentary photograph.

Strict Rules:
- Describe a realistic, candid, real-world scene (e.g. real stray animals being cared for, real community action, natural environmental scene).
- The image MUST look like a real photograph taken with a DSLR camera (35mm lens, natural daylight).
- Absolutely NO digital art, illustration, painting, CGI, 3D render, cartoon, or stylized art.
- Do NOT include any text, typography, letters, logos, or watermarks.
- Keep it under 40 words.
- Output ONLY the raw prompt text, nothing else.`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const geminiRes = await fetch(GEMINI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 150,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const gPrompt = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (gPrompt && gPrompt.length > 5) {
            visualPrompt = gPrompt.replace(/^["']|["']$/g, "").trim();
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Gemini prompt enhancement warning (fallback to topic):", err.message);
      }
    }

    // 2. Build a photorealistic, real-life documentary photo prompt
    const finalPrompt = `A real authentic documentary photo of ${visualPrompt}, photojournalism, 35mm DSLR camera lens, natural daylight, candid photo, realistic textures, highly detailed real life photography, no digital painting, no cgi, no 3d render, no drawing, no illustration, no cartoon`;
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`;

    // 3. Fetch the generated realistic photo
    const imgController = new AbortController();
    const imgTimeoutId = setTimeout(() => imgController.abort(), 35000);

    let imgRes;
    try {
      imgRes = await fetch(imageUrl, { signal: imgController.signal });
    } catch (fetchErr) {
      clearTimeout(imgTimeoutId);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json(
          { message: "Image generation timed out. Please try again." },
          { status: 408 }
        );
      }
      throw fetchErr;
    }

    clearTimeout(imgTimeoutId);

    if (!imgRes.ok) {
      return NextResponse.json(
        { message: "Failed to generate image. Please try again." },
        { status: 500 }
      );
    }

    const imageBuffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const imageDataUrl = `data:${contentType};base64,${base64Image}`;

    return NextResponse.json(
      {
        success: true,
        imageDataUrl,
        prompt: visualPrompt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    return NextResponse.json(
      { message: "An error occurred while generating the image." },
      { status: 500 }
    );
  }
}
