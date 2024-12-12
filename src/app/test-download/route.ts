import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://myscrbuckethst.s3.us-east-1.amazonaws.com/chromium-v131.0.1-pack.tar";

  try {
    const response = await fetch(url);

    if (response.ok) {
      const contentLength = response.headers.get("content-length");
      return NextResponse.json({
        success: true,
        status: response.status,
        contentLength,
        message: "Download successful from Vercel environment.",
      });
    } else {
      return NextResponse.json({
        success: false,
        status: response.status,
        message: "Failed to download from S3.",
      });
    }
  } catch (error) {
    console.error("Error downloading from S3:", error);
    return NextResponse.json({
      success: false,
      message: "Error during download from S3.",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
