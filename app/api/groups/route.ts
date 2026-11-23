import { NextResponse } from "next/server";
import { getRestaurantGroups } from "@/lib/rms-menu";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const groups = await getRestaurantGroups();
    return NextResponse.json(
      {
        success: true,
        data: groups,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load groups";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
