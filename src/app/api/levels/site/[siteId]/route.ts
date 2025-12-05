// src/app/api/levels/site/[siteId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchLevelsBySiteId } from "@/services/level.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const levels = await fetchLevelsBySiteId(params.siteId);
    return NextResponse.json(levels);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch levels" },
      { status: 500 }
    );
  }
}