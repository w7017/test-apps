// src/app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchClientById, modifyClient, removeClient } from "@/services/client.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("GET /api/clients/[id] - Starting with id:", params.id);
    
    if (!params.id) {
      console.error("GET /api/clients/[id] - Missing id parameter");
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }
    
    console.log("GET /api/clients/[id] - Calling fetchClientById service");
    const client = await fetchClientById(params.id);
    console.log("GET /api/clients/[id] - Success:", client);
    
    return NextResponse.json(client);
  } catch (error: any) {
    console.error("GET /api/clients/[id] - Error:", error);
    
    if (error.message === "Client not found") {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT /api/clients/[id] - Starting with id:", params.id);
    
    if (!params.id) {
      console.error("PUT /api/clients/[id] - Missing id parameter");
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    console.log("PUT /api/clients/[id] - Body received:", body);
    
    // Validate that at least one field is provided
    if (!body.name && body.description === undefined) {
      console.error("PUT /api/clients/[id] - No fields to update");
      return NextResponse.json(
        { error: "At least one field (name or description) must be provided" },
        { status: 400 }
      );
    }
    
    // Validate name if provided
    if (body.name !== undefined && (!body.name || typeof body.name !== "string")) {
      console.error("PUT /api/clients/[id] - Invalid name field");
      return NextResponse.json(
        { error: "Name must be a non-empty string if provided" },
        { status: 400 }
      );
    }
    
    console.log("PUT /api/clients/[id] - Calling modifyClient service");
    const updatedClient = await modifyClient(params.id, body);
    console.log("PUT /api/clients/[id] - Success:", updatedClient);
    
    return NextResponse.json(updatedClient);
  } catch (error: any) {
    console.error("PUT /api/clients/[id] - Error:", error);
    
    if (error.message === "Client not found") {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }
    
    if (error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE /api/clients/[id] - Starting with id:", params.id);
    
    if (!params.id) {
      console.error("DELETE /api/clients/[id] - Missing id parameter");
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }
    
    console.log("DELETE /api/clients/[id] - Calling removeClient service");
    const deletedClient = await removeClient(params.id);
    console.log("DELETE /api/clients/[id] - Success:", deletedClient);
    
    return NextResponse.json(
      { message: "Client deleted successfully", client: deletedClient },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/clients/[id] - Error:", error);
    
    if (error.message === "Client not found") {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }
    
    if (error.message.includes("existing sites")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to delete client" },
      { status: 500 }
    );
  }
}
