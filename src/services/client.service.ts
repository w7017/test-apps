// src/services/client.service.ts
import { createClient, getAllClients } from "@/repositories/client.repository";
import { Client } from "@prisma/client";

export const fetchAllClients = async (): Promise<Client[]> => {
  try {
    console.log("Service: fetchAllClients - Starting");
    const clients = await getAllClients();
    console.log("Service: fetchAllClients - Success:", clients.length, "clients");
    return clients;
  } catch (error) {
    console.error("Service: fetchAllClients - Error:", error);
    throw error;
  }
};

export const addClient = async (data: {
  name: string;
  description?: string;
}): Promise<Client> => {
  try {
    console.log("Service: addClient - Starting with data:", data);
    
    // Validation
    if (!data.name || typeof data.name !== "string") {
      console.error("Service: addClient - Invalid name:", data.name);
      throw new Error("Client name is required and must be a string.");
    }
    
    if (data.name.trim().length === 0) {
      console.error("Service: addClient - Empty name after trim");
      throw new Error("Client name cannot be empty.");
    }

    console.log("Service: addClient - Validation passed, calling repository");
    const newClient = await createClient(data);
    console.log("Service: addClient - Success:", newClient);
    
    return newClient;
  } catch (error) {
    console.error("Service: addClient - Error:", error);
    throw error;
  }
};