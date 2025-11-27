// src/app/api/locations/client/[clientId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchLocationsByClientId } from "@/services/location.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    console.log("GET /api/locations/client/[clientId] - Starting with clientId:", params.clientId);
    const locations = await fetchLocationsByClientId(params.clientId);
    console.log("GET /api/locations/client/[clientId] - Success:", locations.length, "locations found");
    return NextResponse.json(locations);
  } catch (error: any) {
    console.error("GET /api/locations/client/[clientId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch locations for client" },
      { status: 500 }
    );
  }
}