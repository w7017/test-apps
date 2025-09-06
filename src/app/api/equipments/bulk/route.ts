// src/app/api/equipments/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { modifyEquipment, removeEquipment } from "@/services/equipment.service";

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/equipments/bulk - Starting");
    const body = await req.json();
    console.log("POST /api/equipments/bulk - Body received:", body);
    
    const { operation, equipmentIds, data } = body;
    
    // Validation
    if (!operation || typeof operation !== 'string') {
      return NextResponse.json(
        { 
          error: "Operation is required and must be a string",
          code: "INVALID_OPERATION"
        },
        { status: 400 }
      );
    }
    
    if (!equipmentIds || !Array.isArray(equipmentIds) || equipmentIds.length === 0) {
      return NextResponse.json(
        { 
          error: "Equipment IDs are required and must be a non-empty array",
          code: "INVALID_IDS"
        },
        { status: 400 }
      );
    }
    
    const validOperations = ['update', 'delete', 'updateStatus', 'updateHealth'];
    if (!validOperations.includes(operation)) {
      return NextResponse.json(
        { 
          error: `Operation must be one of: ${validOperations.join(', ')}`,
          code: "INVALID_OPERATION"
        },
        { status: 400 }
      );
    }
    
    const results = [];
    const errors = [];
    
    console.log(`POST /api/equipments/bulk - Processing ${operation} for ${equipmentIds.length} equipment`);
    
    for (const equipmentId of equipmentIds) {
      try {
        let result;
        
        switch (operation) {
          case 'update':
            if (!data) {
              throw new Error("Data is required for update operation");
            }
            result = await modifyEquipment(equipmentId, data);
            break;
            
          case 'delete':
            result = await removeEquipment(equipmentId);
            break;
            
          case 'updateStatus':
            if (!data?.statut) {
              throw new Error("Status is required for updateStatus operation");
            }
            result = await modifyEquipment(equipmentId, { statut: data.statut });
            break;
            
          case 'updateHealth':
            if (!data?.etatSante) {
              throw new Error("Health state is required for updateHealth operation");
            }
            result = await modifyEquipment(equipmentId, { etatSante: data.etatSante });
            break;
        }
        
        results.push({
          id: equipmentId,
          success: true,
          data: result
        });
        
      } catch (error: any) {
        console.error(`POST /api/equipments/bulk - Error for equipment ${equipmentId}:`, error);
        errors.push({
          id: equipmentId,
          success: false,
          error: error.message || "Unknown error"
        });
      }
    }
    
    const successCount = results.length;
    const errorCount = errors.length;
    
    console.log(`POST /api/equipments/bulk - Completed: ${successCount} success, ${errorCount} errors`);
    
    return NextResponse.json({
      success: true,
      message: `Bulk operation completed: ${successCount} successful, ${errorCount} failed`,
      results,
      errors,
      summary: {
        total: equipmentIds.length,
        successful: successCount,
        failed: errorCount
      }
    });
    
  } catch (error: any) {
    console.error("POST /api/equipments/bulk - Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to perform bulk operation",
        code: "BULK_OPERATION_ERROR"
      },
      { status: 500 }
    );
  }
}
