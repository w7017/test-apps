import { NextRequest, NextResponse } from "next/server";
import { fetchEquipmentsByLevelId } from "@/services/equipment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { levelId: string } }
) {
  try {
    const equipments = await fetchEquipmentsByLevelId(params.levelId);
    return NextResponse.json(equipments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipments" },
      { status: 500 }
    );
  }
}