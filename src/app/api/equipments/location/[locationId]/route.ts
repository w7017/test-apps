// src/app/api/equipments/location/[locationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchEquipmentsByLocationId } from "@/services/equipment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    console.log("GET /api/equipments/location/[locationId] - Starting with locationId:", params.locationId);
    const equipments = await fetchEquipmentsByLocationId(params.locationId);
    console.log("GET /api/equipments/location/[locationId] - Success:", equipments.length, "equipments found");
    return NextResponse.json(equipments);
  } catch (error: any) {
    console.error("GET /api/equipments/location/[locationId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipments for location" },
      { status: 500 }
    );
  }
}
