// src/services/client.service.ts
import { createClient, getAllClients, getClientById, updateClient, deleteClient } from "@/repositories/client.repository";
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

export const fetchClientById = async (id: string): Promise<Client> => {
  try {
    console.log("Service: fetchClientById - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: fetchClientById - Invalid id:", id);
      throw new Error("Client ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: fetchClientById - Empty id after trim");
      throw new Error("Client ID cannot be empty.");
    }

    console.log("Service: fetchClientById - Validation passed, calling repository");
    const client = await getClientById(id);
    console.log("Service: fetchClientById - Success:", client);
    
    return client;
  } catch (error) {
    console.error("Service: fetchClientById - Error:", error);
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

export const modifyClient = async (id: string, data: {
  name?: string;
  description?: string;
}): Promise<Client> => {
  try {
    console.log("Service: modifyClient - Starting with id:", id, "and data:", data);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: modifyClient - Invalid id:", id);
      throw new Error("Client ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: modifyClient - Empty id after trim");
      throw new Error("Client ID cannot be empty.");
    }
    
    if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
      console.error("Service: modifyClient - Invalid name:", data.name);
      throw new Error("Client name must be a non-empty string if provided.");
    }

    console.log("Service: modifyClient - Validation passed, calling repository");
    const updatedClient = await updateClient(id, data);
    console.log("Service: modifyClient - Success:", updatedClient);
    
    return updatedClient;
  } catch (error) {
    console.error("Service: modifyClient - Error:", error);
    throw error;
  }
};

export const removeClient = async (id: string): Promise<Client> => {
  try {
    console.log("Service: removeClient - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: removeClient - Invalid id:", id);
      throw new Error("Client ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: removeClient - Empty id after trim");
      throw new Error("Client ID cannot be empty.");
    }

    console.log("Service: removeClient - Validation passed, calling repository");
    const deletedClient = await deleteClient(id);
    console.log("Service: removeClient - Success:", deletedClient);
    
    return deletedClient;
  } catch (error) {
    console.error("Service: removeClient - Error:", error);
    throw error;
  }
};