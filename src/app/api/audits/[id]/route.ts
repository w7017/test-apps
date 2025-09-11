// src/app/api/audits/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAuditById, updateAudit, deleteAudit } from "@/services/audit.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("GET /api/audits/[id] - Starting with id:", params.id);
    const audit = await fetchAuditById(params.id);
    console.log("GET /api/audits/[id] - Success:", audit);
    return NextResponse.json(audit);
  } catch (error: any) {
    console.error("GET /api/audits/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/audits/[id] - Starting with id:", params.id);
    const body = await req.json();
    console.log("PUT /api/audits/[id] - Body received:", body);
    
    const updatedAudit = await updateAudit(params.id, body);
    console.log("PUT /api/audits/[id] - Success:", updatedAudit);
    
    return NextResponse.json(updatedAudit);
  } catch (error: any) {
    console.error("PUT /api/audits/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update audit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE /api/audits/[id] - Starting with id:", params.id);
    
    const deletedAudit = await deleteAudit(params.id);
    console.log("DELETE /api/audits/[id] - Success:", deletedAudit);
    
    return NextResponse.json(deletedAudit);
  } catch (error: any) {
    console.error("DELETE /api/audits/[id] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete audit" },
      { status: 500 }
    );
  }
}