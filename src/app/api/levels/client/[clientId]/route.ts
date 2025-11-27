// src/app/api/levels/client/[clientId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchLevelsByClientId } from "@/services/level.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    console.log("GET /api/levels/client/[clientId] - Starting with clientId:", params.clientId);
    const levels = await fetchLevelsByClientId(params.clientId);
    console.log("GET /api/levels/client/[clientId] - Success:", levels.length, "levels found");
    return NextResponse.json(levels);
  } catch (error: any) {
    console.error("GET /api/levels/client/[clientId] - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch levels for client" },
      { status: 500 }
    );
  }
}