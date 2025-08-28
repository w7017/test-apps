// src/app/api/equipments/code/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchEquipmentByCode } from "@/services/equipment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    console.log("GET /api/equipments/code/[code] - Starting with code:", params.code);
    const equipment = await fetchEquipmentByCode(params.code);
    console.log("GET /api/equipments/code/[code] - Success:", equipment);
    return NextResponse.json(equipment);
  } catch (error: any) {
    console.error("GET /api/equipments/code/[code] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipment by code" },
      { status: 500 }
    );
  }
}
