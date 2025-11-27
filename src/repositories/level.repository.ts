// src/repositories/level.repository.ts
import prisma from "@/db/client";

export const getAllLevels = async () => {
  try {
    console.log("Repository: getAllLevels - Starting");
    const levels = await prisma.level.findMany({
      include: {
        building: {
          include: {
            site: {
              include: {
                client: true
              }
            }
          }
        },
        locations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getAllLevels - Success:", levels.length, "levels found");
    return levels;
  } catch (error) {
    console.error("Repository: getAllLevels - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getLevelsByBuildingId = async (buildingId: string) => {
  try {
    console.log("Repository: getLevelsByBuildingId - Starting with buildingId:", buildingId);
    const levels = await prisma.level.findMany({
      where: { buildingId },
      include: {
        building: {
          include: {
            site: {
              include: {
                client: true
              }
            }
          }
        },
        locations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getLevelsByBuildingId - Success:", levels.length, "levels found");
    return levels;
  } catch (error) {
    console.error("Repository: getLevelsByBuildingId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getLevelsBySiteId = async (siteId: string) => {
  try {
    console.log("Repository: getLevelsBySiteId - Starting with siteId:", siteId);
    const levels = await prisma.level.findMany({
      where: {
        building: {
          siteId
        }
      },
      include: {
        building: {
          include: {
            site: {
              include: {
                client: true
              }
            }
          }
        },
        locations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getLevelsBySiteId - Success:", levels.length, "levels found");
    return levels;
  } catch (error) {
    console.error("Repository: getLevelsBySiteId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getLevelsByClientId = async (clientId: string) => {
  try {
    console.log("Repository: getLevelsByClientId - Starting with clientId:", clientId);
    const levels = await prisma.level.findMany({
      where: {
        building: {
          site: {
            clientId
          }
        }
      },
      include: {
        building: {
          include: {
            site: {
              include: {
                client: true
              }
            }
          }
        },
        locations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getLevelsByClientId - Success:", levels.length, "levels found");
    return levels;
  } catch (error) {
    console.error("Repository: getLevelsByClientId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getLevelById = async (id: string) => {
  try {
    console.log("Repository: getLevelById - Starting with id:", id);
    
    const level = await prisma.level.findUnique({
      where: { id },
      include: { 
        building: {
          include: {
            site: {
              include: {
                client: true
              }
            }
          }
        },
        locations: {
          include: {
            equipments: true
          }
        }
      }
    });
    
    if (!level) {
      console.log("Repository: getLevelById - Level not found");
      throw new Error("Level not found");
    }
    
    console.log("Repository: getLevelById - Success:", level);
    return level;
  } catch (error) {
    console.error("Repository: getLevelById - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const createLevel = async (data: {
  name: string;
  image?: string;
  buildingId: string;
}) => {
  try {
    console.log("Repository: createLevel - Starting with data:", data);
    
    await prisma.$connect();
    console.log("Repository: createLevel - Database connected");
    
    const levelData = {
      name: data.name.trim(),
      image: data.image?.trim() || null,
      buildingId: data.buildingId,
    };
    
    console.log("Repository: createLevel - Prepared data:", levelData);
    
    const newLevel = await prisma.level.create({
      data: levelData,
      include: {
        building: {
          include: {
            site: {
              include: {
                client: true
              }
            }
          }
        },
        locations: true
      }
    });
    
    console.log("Repository: createLevel - Success:", newLevel);
    return newLevel;
    
  } catch (error) {
    console.error("Repository: createLevel - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A level with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateLevel = async (id: string, data: {
  name?: string;
  image?: string;
}) => {
  try {
    console.log("Repository: updateLevel - Starting with id:", id, "and data:", data);
    
    await prisma.$connect();
    console.log("Repository: updateLevel - Database connected");
    
    const existingLevel = await prisma.level.findUnique({
      where: { id }
    });
    
    if (!existingLevel) {
      throw new Error("Level not found");
    }
    
    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.image !== undefined) {
      updateData.image = data.image?.trim() || null;
    }
    
    console.log("Repository: updateLevel - Prepared update data:", updateData);
    
    const updatedLevel = await prisma.level.update({
      where: { id },
      data: updateData,
      include: {
        building: {
          include: {
            site: {
              include: {
                client: true
              }
            }
          }
        },
        locations: true
      }
    });
    
    console.log("Repository: updateLevel - Success:", updatedLevel);
    return updatedLevel;
    
  } catch (error) {
    console.error("Repository: updateLevel - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A level with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteLevel = async (id: string) => {
  try {
    console.log("Repository: deleteLevel - Starting with id:", id);
    
    await prisma.$connect();
    console.log("Repository: deleteLevel - Database connected");
    
    const existingLevel = await prisma.level.findUnique({
      where: { id },
      include: { locations: true }
    });
    
    if (!existingLevel) {
      throw new Error("Level not found");
    }
    
    if (existingLevel.locations.length > 0) {
      throw new Error("Cannot delete level with existing locations. Please delete all locations first.");
    }
    
    console.log("Repository: deleteLevel - Level found, proceeding with deletion");
    
    const deletedLevel = await prisma.level.delete({
      where: { id },
    });
    
    console.log("Repository: deleteLevel - Success:", deletedLevel);
    return deletedLevel;
    
  } catch (error) {
    console.error("Repository: deleteLevel - Prisma error:", error);
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