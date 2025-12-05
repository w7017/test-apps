import { NextRequest, NextResponse } from "next/server";
import { fetchLocationsByBuildingId } from "@/services/location.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { buildingId: string } }
) {
  try {
    const locations = await fetchLocationsByBuildingId(params.buildingId);
    return NextResponse.json(locations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch locations" },
      { status: 500 }
    );
  }
}