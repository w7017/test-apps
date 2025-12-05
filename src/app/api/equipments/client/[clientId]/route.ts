// src/app/api/equipments/client/[clientId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchEquipmentsByClientId } from "@/services/equipment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const equipments = await fetchEquipmentsByClientId(params.clientId);
    return NextResponse.json(equipments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipments" },
      { status: 500 }
    );
  }
}