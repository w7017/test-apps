// src/repositories/client.repository.ts
import prisma from "@/db/client";

export const getAllClients = async () => {
  try {
    console.log("Repository: getAllClients - Starting");
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getAllClients - Success:", clients.length, "clients found");
    return clients;
  } catch (error) {
    console.error("Repository: getAllClients - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getClientById = async (id: string) => {
  try {
    console.log("Repository: getClientById - Starting with id:", id);
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: { sites: true }
    });
    
    if (!client) {
      console.log("Repository: getClientById - Client not found");
      throw new Error("Client not found");
    }
    
    console.log("Repository: getClientById - Success:", client);
    return client;
  } catch (error) {
    console.error("Repository: getClientById - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const createClient = async (data: {
  name: string;
  description?: string;
}) => {
  try {
    console.log("Repository: createClient - Starting with data:", data);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Repository: createClient - Database connected");
    
    const clientData = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
    };
    
    console.log("Repository: createClient - Prepared data:", clientData);
    
    const newClient = await prisma.client.create({
      data: clientData,
    });
    
    console.log("Repository: createClient - Success:", newClient);
    return newClient;
    
  } catch (error) {
    console.error("Repository: createClient - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A client with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateClient = async (id: string, data: {
  name?: string;
  description?: string;
}) => {
  try {
    console.log("Repository: updateClient - Starting with id:", id, "and data:", data);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Repository: updateClient - Database connected");
    
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id }
    });
    
    if (!existingClient) {
      throw new Error("Client not found");
    }
    
    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }
    
    console.log("Repository: updateClient - Prepared update data:", updateData);
    
    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
    });
    
    console.log("Repository: updateClient - Success:", updatedClient);
    return updatedClient;
    
  } catch (error) {
    console.error("Repository: updateClient - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A client with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteClient = async (id: string) => {
  try {
    console.log("Repository: deleteClient - Starting with id:", id);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Repository: deleteClient - Database connected");
    
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: { sites: true }
    });
    
    if (!existingClient) {
      throw new Error("Client not found");
    }
    
    // Check if client has sites
    if (existingClient.sites.length > 0) {
      throw new Error("Cannot delete client with existing sites. Please delete all sites first.");
    }
    
    console.log("Repository: deleteClient - Client found, proceeding with deletion");
    
    const deletedClient = await prisma.client.delete({
      where: { id },
    });
    
    console.log("Repository: deleteClient - Success:", deletedClient);
    return deletedClient;
    
  } catch (error) {
    console.error("Repository: deleteClient - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};