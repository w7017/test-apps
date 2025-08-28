// src/app/api/levels/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchLevelById, modifyLevel, removeLevel } from "@/services/level.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("GET /api/levels/[id] - Starting with id:", params.id);
    const level = await fetchLevelById(params.id);
    console.log("GET /api/levels/[id] - Success:", level);
    return NextResponse.json(level);
  } catch (error: any) {
    console.error("GET /api/levels/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch level" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/levels/[id] - Starting with id:", params.id);
    const body = await req.json();
    console.log("PUT /api/levels/[id] - Body received:", body);
    
    const updatedLevel = await modifyLevel(params.id, body);
    console.log("PUT /api/levels/[id] - Success:", updatedLevel);
    
    return NextResponse.json(updatedLevel);
  } catch (error: any) {
    console.error("PUT /api/levels/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update level" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE /api/levels/[id] - Starting with id:", params.id);
    
    const deletedLevel = await removeLevel(params.id);
    console.log("DELETE /api/levels/[id] - Success:", deletedLevel);
    
    return NextResponse.json(deletedLevel);
  } catch (error: any) {
    console.error("DELETE /api/levels/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete level" },
      { status: 500 }
    );
  }
}
