// src/app/api/buildings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchBuildingById, modifyBuilding, removeBuilding } from "@/services/building.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("GET /api/buildings/[id] - Starting with id:", params.id);
    const building = await fetchBuildingById(params.id);
    console.log("GET /api/buildings/[id] - Success:", building);
    return NextResponse.json(building);
  } catch (error: any) {
    console.error("GET /api/buildings/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch building" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/buildings/[id] - Starting with id:", params.id);
    const body = await req.json();
    console.log("PUT /api/buildings/[id] - Body received:", body);
    
    const updatedBuilding = await modifyBuilding(params.id, body);
    console.log("PUT /api/buildings/[id] - Success:", updatedBuilding);
    
    return NextResponse.json(updatedBuilding);
  } catch (error: any) {
    console.error("PUT /api/buildings/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update building" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE /api/buildings/[id] - Starting with id:", params.id);
    
    const deletedBuilding = await removeBuilding(params.id);
    console.log("DELETE /api/buildings/[id] - Success:", deletedBuilding);
    
    return NextResponse.json(deletedBuilding);
  } catch (error: any) {
    console.error("DELETE /api/buildings/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete building" },
      { status: 500 }
    );
  }
}
