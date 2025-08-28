// src/app/api/sites/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchSiteById, modifySite, removeSite } from "@/services/site.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("GET /api/sites/[id] - Starting with id:", params.id);
    const site = await fetchSiteById(params.id);
    console.log("GET /api/sites/[id] - Success:", site);
    return NextResponse.json(site);
  } catch (error: any) {
    console.error("GET /api/sites/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch site" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/sites/[id] - Starting with id:", params.id);
    const body = await req.json();
    console.log("PUT /api/sites/[id] - Body received:", body);
    
    const updatedSite = await modifySite(params.id, body);
    console.log("PUT /api/sites/[id] - Success:", updatedSite);
    
    return NextResponse.json(updatedSite);
  } catch (error: any) {
    console.error("PUT /api/sites/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update site" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE /api/sites/[id] - Starting with id:", params.id);
    
    const deletedSite = await removeSite(params.id);
    console.log("DELETE /api/sites/[id] - Success:", deletedSite);
    
    return NextResponse.json(deletedSite);
  } catch (error: any) {
    console.error("DELETE /api/sites/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete site" },
      { status: 500 }
    );
  }
}
