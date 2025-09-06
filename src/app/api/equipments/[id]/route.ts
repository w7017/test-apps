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
    
    // Enhanced validation for updates
    const validationErrors: string[] = [];
    
    // Validate ID
    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      validationErrors.push("Equipment ID is required and must be a valid string");
    }
    
    // Validate optional fields if provided
    if (body.code !== undefined && (typeof body.code !== 'string' || body.code.trim().length === 0)) {
      validationErrors.push("Code must be a non-empty string if provided");
    }
    
    if (body.libelle !== undefined && (typeof body.libelle !== 'string' || body.libelle.trim().length === 0)) {
      validationErrors.push("Libelle must be a non-empty string if provided");
    }
    
    if (body.quantite !== undefined && (typeof body.quantite !== 'number' || body.quantite < 1)) {
      validationErrors.push("Quantite must be a positive number if provided");
    }
    
    if (body.frequenceMaintenance !== undefined && (typeof body.frequenceMaintenance !== 'number' || body.frequenceMaintenance < 1)) {
      validationErrors.push("Frequence maintenance must be a positive number if provided");
    }
    
    // Date validation
    if (body.dateInstallation && isNaN(Date.parse(body.dateInstallation))) {
      validationErrors.push("Date installation must be a valid date");
    }
    
    if (body.dateFinGarantie && isNaN(Date.parse(body.dateFinGarantie))) {
      validationErrors.push("Date fin garantie must be a valid date");
    }
    
    if (validationErrors.length > 0) {
      console.error("PUT /api/equipments/[id] - Validation errors:", validationErrors);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    
    console.log("PUT /api/equipments/[id] - Validation passed, calling modifyEquipment service");
    const updatedEquipment = await modifyEquipment(params.id, body);
    console.log("PUT /api/equipments/[id] - Success:", updatedEquipment);
    
    return NextResponse.json({
      success: true,
      message: "Equipment updated successfully",
      data: updatedEquipment
    });
  } catch (error: any) {
    console.error("PUT /api/equipments/[id] - Error:", error);
    
    // Handle specific errors
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { 
          error: "Equipment not found",
          code: "EQUIPMENT_NOT_FOUND"
        },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { 
          error: "Equipment with this code already exists",
          code: "DUPLICATE_CODE"
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to update equipment",
        code: "INTERNAL_ERROR"
      },
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
    
    // Validate ID
    if (!params.id || typeof params.id !== 'string' || params.id.trim().length === 0) {
      return NextResponse.json(
        { 
          error: "Equipment ID is required and must be a valid string",
          code: "INVALID_ID"
        },
        { status: 400 }
      );
    }
    
    console.log("DELETE /api/equipments/[id] - Validation passed, calling removeEquipment service");
    const deletedEquipment = await removeEquipment(params.id);
    console.log("DELETE /api/equipments/[id] - Success:", deletedEquipment);
    
    return NextResponse.json({
      success: true,
      message: "Equipment deleted successfully",
      data: deletedEquipment
    });
  } catch (error: any) {
    console.error("DELETE /api/equipments/[id] - Error:", error);
    
    // Handle specific errors
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { 
          error: "Equipment not found",
          code: "EQUIPMENT_NOT_FOUND"
        },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('existing audits')) {
      return NextResponse.json(
        { 
          error: "Cannot delete equipment with existing audits. Please delete all audits first.",
          code: "HAS_AUDITS"
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to delete equipment",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}
