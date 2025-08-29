// src/app/api/sites/client/[clientId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchSitesByClientIdWithFullHierarchy } from "@/services/site.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    console.log("GET /api/sites/client/[clientId] - Starting with clientId:", params.clientId);
    const sites = await fetchSitesByClientIdWithFullHierarchy(params.clientId);
    console.log("GET /api/sites/client/[clientId] - Success:", sites.length, "sites found");
    return NextResponse.json(sites);
  } catch (error: any) {
    console.error("GET /api/sites/client/[clientId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sites for client" },
      { status: 500 }
    );
  }
}