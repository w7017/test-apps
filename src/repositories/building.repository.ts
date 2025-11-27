// src/repositories/building.repository.ts

import prisma from "@/db/client";

export const getBuildingsBySiteId = async (siteId: string) => {
  try {
    console.log("Repository: getBuildingsBySiteId - Starting with siteId:", siteId);
    
    const buildings = await prisma.building.findMany({
      where: { siteId },
      include: {
        site: {
          include: {
            client: true
          }
        },
        levels: {
          include: {
            locations: {
              include: {
                equipments: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log("Repository: getBuildingsBySiteId - Success:", buildings.length, "buildings found");
    return buildings;
  } catch (error) {
    console.error("Repository: getBuildingsBySiteId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getBuildingsByClientId = async (clientId: string) => {
  try {
    console.log("Repository: getBuildingsByClientId - Starting with clientId:", clientId);
    
    const buildings = await prisma.building.findMany({
      where: { 
        site: {
          clientId: clientId
        }
      },
      include: {
        site: {
          include: {
            client: true
          }
        },
        levels: {
          include: {
            locations: {
              include: {
                equipments: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log("Repository: getBuildingsByClientId - Success:", buildings.length, "buildings found");
    return buildings;
  } catch (error) {
    console.error("Repository: getBuildingsByClientId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getBuildingById = async (id: string) => {
  try {
    console.log("Repository: getBuildingById - Starting with id:", id);
    
    const building = await prisma.building.findUnique({
      where: { id },
      include: { 
        site: {
          include: {
            client: true
          }
        },
        levels: {
          include: {
            locations: {
              include: {
                equipments: true
              }
            }
          }
        }
      }
    });
    
    if (!building) {
      console.log("Repository: getBuildingById - Building not found");
      throw new Error("Building not found");
    }
    
    console.log("Repository: getBuildingById - Success:", building);
    return building;
  } catch (error) {
    console.error("Repository: getBuildingById - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const createBuilding = async (data: {
  name: string;
  image?: string;
  siteId: string;
}) => {
  try {
    console.log("Repository: createBuilding - Starting with data:", data);
    
    await prisma.$connect();
    console.log("Repository: createBuilding - Database connected");
    
    const buildingData = {
      name: data.name.trim(),
      image: data.image?.trim() || null,
      siteId: data.siteId,
    };
    
    console.log("Repository: createBuilding - Prepared data:", buildingData);
    
    const newBuilding = await prisma.building.create({
      data: buildingData,
      include: {
        site: {
          include: {
            client: true
          }
        },
        levels: true
      }
    });
    
    console.log("Repository: createBuilding - Success:", newBuilding);
    return newBuilding;
    
  } catch (error) {
    console.error("Repository: createBuilding - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A building with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateBuilding = async (id: string, data: {
  name?: string;
  image?: string;
}) => {
  try {
    console.log("Repository: updateBuilding - Starting with id:", id, "and data:", data);
    
    await prisma.$connect();
    console.log("Repository: updateBuilding - Database connected");
    
    const existingBuilding = await prisma.building.findUnique({
      where: { id }
    });
    
    if (!existingBuilding) {
      throw new Error("Building not found");
    }
    
    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.image !== undefined) {
      updateData.image = data.image?.trim() || null;
    }
    
    console.log("Repository: updateBuilding - Prepared update data:", updateData);
    
    const updatedBuilding = await prisma.building.update({
      where: { id },
      data: updateData,
      include: {
        site: {
          include: {
            client: true
          }
        },
        levels: true
      }
    });
    
    console.log("Repository: updateBuilding - Success:", updatedBuilding);
    return updatedBuilding;
    
  } catch (error) {
    console.error("Repository: updateBuilding - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A building with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteBuilding = async (id: string) => {
  try {
    console.log("Repository: deleteBuilding - Starting with id:", id);
    
    await prisma.$connect();
    console.log("Repository: deleteBuilding - Database connected");
    
    const existingBuilding = await prisma.building.findUnique({
      where: { id },
      include: { levels: true }
    });
    
    if (!existingBuilding) {
      throw new Error("Building not found");
    }
    
    if (existingBuilding.levels.length > 0) {
      throw new Error("Cannot delete building with existing levels. Please delete all levels first.");
    }
    
    console.log("Repository: deleteBuilding - Building found, proceeding with deletion");
    
    const deletedBuilding = await prisma.building.delete({
      where: { id },
    });
    
    console.log("Repository: deleteBuilding - Success:", deletedBuilding);
    return deletedBuilding;
    
  } catch (error) {
    console.error("Repository: deleteBuilding - Prisma error:", error);
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