// src/app/api/sites/client/[clientId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchSitesByClientIdWithFullHierarchy } from "@/services/site.service";
import { fetchBuildingsByClientId } from "@/services/building.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    console.log("GET /api/buildings/client/[clientId] - Starting with clientId:", params.clientId);
    const buildings = await fetchBuildingsByClientId(params.clientId);
    console.log("GET /api/buildings/client/[clientId] - Success:", buildings.length, "buildings found");
    return NextResponse.json(buildings);
  } catch (error: any) {
    console.error("GET /api/buildings/client/[clientId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch buildings for client" },
      { status: 500 }
    );
  }
}