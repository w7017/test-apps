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