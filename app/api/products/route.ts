import { NextRequest, NextResponse } from "next/server";
import { getRestaurantProducts, RMSProductsParams } from "@/lib/rms-menu";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: RMSProductsParams = {};

    const groupId = searchParams.get("groupId");
    if (groupId) params.groupId = groupId;

    const subgroupId = searchParams.get("subgroupId");
    if (subgroupId) params.subgroupId = subgroupId;

    const categoryId = searchParams.get("categoryId");
    if (categoryId) params.categoryId = categoryId;

    const dietary = searchParams.get("dietary") as RMSProductsParams["dietary"];
    if (dietary) params.dietary = dietary;

    const q = searchParams.get("q");
    if (q) params.q = q;

    const page = searchParams.get("page");
    if (page) params.page = parseInt(page, 10);

    const limit = searchParams.get("limit");
    if (limit) params.limit = parseInt(limit, 10);

    const result = await getRestaurantProducts(params);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to query RMS products";
    console.error("API /api/products error:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
