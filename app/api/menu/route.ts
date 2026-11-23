import { NextResponse } from "next/server";
import { getRestaurantMenuState } from "@/lib/rms-menu";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const menuState = await getRestaurantMenuState();
    return NextResponse.json(
      {
        success: true,
        data: menuState,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load RMS menu";
    console.error("API /api/menu error:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
