// src/app/api/equipments/site/[siteId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchEquipmentsBySiteId } from "@/services/equipment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const equipments = await fetchEquipmentsBySiteId(params.siteId);
    return NextResponse.json(equipments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipments" },
      { status: 500 }
    );
  }
}