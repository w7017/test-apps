// src/app/api/equipments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllEquipments, addEquipment } from "@/services/equipment.service";

export async function GET() {
  try {
    console.log("GET /api/equipments - Starting");
    const equipments = await fetchAllEquipments();
    console.log("GET /api/equipments - Success:", equipments.length, "equipments found");
    return NextResponse.json(equipments);
  } catch (error) {
    console.error("GET /api/equipments - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/equipments - Starting");
    const body = await req.json();
    console.log("POST /api/equipments - Body received:", body);
    
    // Validate required fields
    if (!body.code) {
      console.error("POST /api/equipments - Missing code field");
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    if (!body.libelle) {
      console.error("POST /api/equipments - Missing libelle field");
      return NextResponse.json(
        { error: "Libelle is required" },
        { status: 400 }
      );
    }

    if (!body.locationId) {
      console.error("POST /api/equipments - Missing locationId field");
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }
    
    console.log("POST /api/equipments - Calling addEquipment service");
    const newEquipment = await addEquipment(body);
    console.log("POST /api/equipments - Success:", newEquipment);
    
    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/equipments - Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
