// src/app/api/equipments/building/[buildingId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchEquipmentsByBuildingId } from "@/services/equipment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { buildingId: string } }
) {
  try {
    const equipments = await fetchEquipmentsByBuildingId(params.buildingId);
    return NextResponse.json(equipments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipments" },
      { status: 500 }
    );
  }
}