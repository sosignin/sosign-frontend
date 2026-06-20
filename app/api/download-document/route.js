// @desc    Proxy download for Cloudinary raw documents (PDFs)
// This avoids CORS issues when fetching raw files from Cloudinary

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "document.pdf";

  if (!url) {
    return new Response(JSON.stringify({ error: "URL parameter is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Only allow Cloudinary URLs for security
  if (!url.includes("res.cloudinary.com")) {
    return new Response(JSON.stringify({ error: "Only Cloudinary URLs are allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch document" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to download document" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
