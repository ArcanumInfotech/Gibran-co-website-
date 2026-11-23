import { NextResponse } from "next/server";
import { getRestaurantCategories } from "@/lib/rms-menu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getRestaurantCategories();
    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load categories";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
