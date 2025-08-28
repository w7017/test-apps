// src/app/api/locations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllLocations, addLocation } from "@/services/location.service";

export async function GET() {
  try {
    console.log("GET /api/locations - Starting");
    const locations = await fetchAllLocations();
    console.log("GET /api/locations - Success:", locations.length, "locations found");
    return NextResponse.json(locations);
  } catch (error) {
    console.error("GET /api/locations - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/locations - Starting");
    const body = await req.json();
    console.log("POST /api/locations - Body received:", body);
    
    // Validate required fields
    if (!body.name) {
      console.error("POST /api/locations - Missing name field");
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!body.levelId) {
      console.error("POST /api/locations - Missing levelId field");
      return NextResponse.json(
        { error: "Level ID is required" },
        { status: 400 }
      );
    }
    
    console.log("POST /api/locations - Calling addLocation service");
    const newLocation = await addLocation(body);
    console.log("POST /api/locations - Success:", newLocation);
    
    return NextResponse.json(newLocation, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/locations - Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
