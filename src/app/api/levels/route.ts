// src/app/api/levels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllLevels, addLevel } from "@/services/level.service";

export async function GET() {
  try {
    console.log("GET /api/levels - Starting");
    const levels = await fetchAllLevels();
    console.log("GET /api/levels - Success:", levels.length, "levels found");
    return NextResponse.json(levels);
  } catch (error) {
    console.error("GET /api/levels - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch levels" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/levels - Starting");
    const body = await req.json();
    console.log("POST /api/levels - Body received:", body);
    
    // Validate required fields
    if (!body.name) {
      console.error("POST /api/levels - Missing name field");
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!body.buildingId) {
      console.error("POST /api/levels - Missing buildingId field");
      return NextResponse.json(
        { error: "Building ID is required" },
        { status: 400 }
      );
    }
    
    console.log("POST /api/levels - Calling addLevel service");
    const newLevel = await addLevel(body);
    console.log("POST /api/levels - Success:", newLevel);
    
    return NextResponse.json(newLevel, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/levels - Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
