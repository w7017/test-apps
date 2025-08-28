// src/app/api/levels/building/[buildingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchLevelsByBuildingId } from "@/services/level.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { buildingId: string } }
) {
  try {
    console.log("GET /api/levels/building/[buildingId] - Starting with buildingId:", params.buildingId);
    const levels = await fetchLevelsByBuildingId(params.buildingId);
    console.log("GET /api/levels/building/[buildingId] - Success:", levels.length, "levels found");
    return NextResponse.json(levels);
  } catch (error: any) {
    console.error("GET /api/levels/building/[buildingId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch levels for building" },
      { status: 500 }
    );
  }
}
