// src/app/api/locations/site/[siteId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchLocationsBySiteId } from "@/services/location.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const locations = await fetchLocationsBySiteId(params.siteId);
    return NextResponse.json(locations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch locations" },
      { status: 500 }
    );
  }
}