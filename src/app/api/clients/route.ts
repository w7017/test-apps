// src/app/api/clients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllClients, addClient } from "@/services/client.service";

export async function GET() {
  try {
    console.log("GET /api/clients - Starting");
    const clients = await fetchAllClients();
    console.log("GET /api/clients - Success:", clients.length, "clients found");
    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/clients - Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/clients - Starting");
    const body = await req.json();
    console.log("POST /api/clients - Body received:", body);
    
    // Validate required fields
    if (!body.name) {
      console.error("POST /api/clients - Missing name field");
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    console.log("POST /api/clients - Calling addClient service");
    const newClient = await addClient(body);
    console.log("POST /api/clients - Success:", newClient);
    
    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/clients - Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}