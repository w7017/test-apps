// src/app/api/buildings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllBuildings, addBuilding } from "@/services/building.service";

export async function GET() {
  try {
    console.log("GET /api/buildings - Starting");
    const buildings = await fetchAllBuildings();
    console.log("GET /api/buildings - Success:", buildings.length, "buildings found");
    return NextResponse.json(buildings);
  } catch (error) {
    console.error("GET /api/buildings - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/buildings - Starting");
    const body = await req.json();
    console.log("POST /api/buildings - Body received:", body);
    
    // Validate required fields
    if (!body.name) {
      console.error("POST /api/buildings - Missing name field");
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!body.siteId) {
      console.error("POST /api/buildings - Missing siteId field");
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }
    
    console.log("POST /api/buildings - Calling addBuilding service");
    const newBuilding = await addBuilding(body);
    console.log("POST /api/buildings - Success:", newBuilding);
    
    return NextResponse.json(newBuilding, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/buildings - Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
