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
    
    // Enhanced validation
    const validationErrors: string[] = [];
    
    // Required fields validation
    if (!body.code || typeof body.code !== 'string' || body.code.trim().length === 0) {
      validationErrors.push("Code is required and must be a non-empty string");
    }
    
    if (!body.libelle || typeof body.libelle !== 'string' || body.libelle.trim().length === 0) {
      validationErrors.push("Libelle is required and must be a non-empty string");
    }
    
    if (!body.locationId || typeof body.locationId !== 'string' || body.locationId.trim().length === 0) {
      validationErrors.push("Location ID is required and must be a non-empty string");
    }
    
    // Optional field validation
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
      console.error("POST /api/equipments - Validation errors:", validationErrors);
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    
    console.log("POST /api/equipments - Validation passed, calling addEquipment service");
    const newEquipment = await addEquipment(body);
    console.log("POST /api/equipments - Success:", newEquipment);
    
    return NextResponse.json({
      success: true,
      message: "Equipment created successfully",
      data: newEquipment
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/equipments - Error:", error);
    
    // Handle specific Prisma errors
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { 
          error: "Equipment with this code already exists",
          code: "DUPLICATE_CODE"
        },
        { status: 409 }
      );
    }
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { 
          error: "Location not found",
          code: "LOCATION_NOT_FOUND"
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || "An error occurred while creating equipment",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}
