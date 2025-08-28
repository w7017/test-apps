// src/app/api/equipments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchEquipmentById, modifyEquipment, removeEquipment } from "@/services/equipment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("GET /api/equipments/[id] - Starting with id:", params.id);
    const equipment = await fetchEquipmentById(params.id);
    console.log("GET /api/equipments/[id] - Success:", equipment);
    return NextResponse.json(equipment);
  } catch (error: any) {
    console.error("GET /api/equipments/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/equipments/[id] - Starting with id:", params.id);
    const body = await req.json();
    console.log("PUT /api/equipments/[id] - Body received:", body);
    
    const updatedEquipment = await modifyEquipment(params.id, body);
    console.log("PUT /api/equipments/[id] - Success:", updatedEquipment);
    
    return NextResponse.json(updatedEquipment);
  } catch (error: any) {
    console.error("PUT /api/equipments/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update equipment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE /api/equipments/[id] - Starting with id:", params.id);
    
    const deletedEquipment = await removeEquipment(params.id);
    console.log("DELETE /api/equipments/[id] - Success:", deletedEquipment);
    
    return NextResponse.json(deletedEquipment);
  } catch (error: any) {
    console.error("DELETE /api/equipments/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete equipment" },
      { status: 500 }
    );
  }
}
