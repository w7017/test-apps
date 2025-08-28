// src/app/api/sites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllSites, addSite } from "@/services/site.service";

export async function GET() {
  try {
    console.log("GET /api/sites - Starting");
    const sites = await fetchAllSites();
    console.log("GET /api/sites - Success:", sites.length, "sites found");
    return NextResponse.json(sites);
  } catch (error) {
    console.error("GET /api/sites - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sites" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/sites - Starting");
    const body = await req.json();
    console.log("POST /api/sites - Body received:", body);
    
    // Validate required fields
    if (!body.name) {
      console.error("POST /api/sites - Missing name field");
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!body.clientId) {
      console.error("POST /api/sites - Missing clientId field");
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }
    
    console.log("POST /api/sites - Calling addSite service");
    const newSite = await addSite(body);
    console.log("POST /api/sites - Success:", newSite);
    
    return NextResponse.json(newSite, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/sites - Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
