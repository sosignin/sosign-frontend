import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { path, secret } = await request.json();

    const expectedSecret = process.env.VALID_EMAIL_TOKEN || "2bfb71cea3dc47ea8f4cf47b5862fa60";

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ message: "Unauthorized. Invalid secret." }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ message: "Path parameter is required." }, { status: 400 });
    }

    // Trigger on-demand revalidation for the specific path
    revalidatePath(path);

    console.log(`[On-Demand Revalidation] Revalidated path: ${path}`);
    return NextResponse.json({ revalidated: true, path, now: Date.now() }, { status: 200 });
  } catch (error) {
    console.error("Revalidation Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
