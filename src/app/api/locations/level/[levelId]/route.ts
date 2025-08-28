// src/app/api/locations/level/[levelId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchLocationsByLevelId } from "@/services/location.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { levelId: string } }
) {
  try {
    console.log("GET /api/locations/level/[levelId] - Starting with levelId:", params.levelId);
    const locations = await fetchLocationsByLevelId(params.levelId);
    console.log("GET /api/locations/level/[levelId] - Success:", locations.length, "locations found");
    return NextResponse.json(locations);
  } catch (error: any) {
    console.error("GET /api/locations/level/[levelId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch locations for level" },
      { status: 500 }
    );
  }
}
