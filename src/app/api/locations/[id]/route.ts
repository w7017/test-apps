// src/app/api/locations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchLocationById, modifyLocation, removeLocation } from "@/services/location.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("GET /api/locations/[id] - Starting with id:", params.id);
    const location = await fetchLocationById(params.id);
    console.log("GET /api/locations/[id] - Success:", location);
    return NextResponse.json(location);
  } catch (error: any) {
    console.error("GET /api/locations/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch location" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/locations/[id] - Starting with id:", params.id);
    const body = await req.json();
    console.log("PUT /api/locations/[id] - Body received:", body);
    
    const updatedLocation = await modifyLocation(params.id, body);
    console.log("PUT /api/locations/[id] - Success:", updatedLocation);
    
    return NextResponse.json(updatedLocation);
  } catch (error: any) {
    console.error("PUT /api/locations/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE /api/locations/[id] - Starting with id:", params.id);
    
    const deletedLocation = await removeLocation(params.id);
    console.log("DELETE /api/locations/[id] - Success:", deletedLocation);
    
    return NextResponse.json(deletedLocation);
  } catch (error: any) {
    console.error("DELETE /api/locations/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete location" },
      { status: 500 }
    );
  }
}
