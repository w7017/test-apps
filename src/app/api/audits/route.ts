// src/app/api/audits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { addAudit } from "@/services/audit.service";

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/audits - Starting");
    const body = await req.json();
    console.log("POST /api/audits - Body received:", body);
    
    const newAudit = await addAudit(body);
    console.log("POST /api/audits - Success:", newAudit);
    
    return NextResponse.json(newAudit);
  } catch (error: any) {
    console.error("POST /api/audits - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create audit" },
      { status: 500 }
    );
  }
}