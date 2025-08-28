// src/app/api/buildings/site/[siteId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchBuildingsBySiteId } from "@/services/building.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    console.log("GET /api/buildings/site/[siteId] - Starting with siteId:", params.siteId);
    const buildings = await fetchBuildingsBySiteId(params.siteId);
    console.log("GET /api/buildings/site/[siteId] - Success:", buildings.length, "buildings found");
    return NextResponse.json(buildings);
  } catch (error: any) {
    console.error("GET /api/buildings/site/[siteId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch buildings for site" },
      { status: 500 }
    );
  }
}
