// src/repositories/location.repository.ts
import prisma from "@/db/client";

export const getAllLocations = async () => {
  try {
    console.log("Repository: getAllLocations - Starting");
    const locations = await prisma.location.findMany({
      include: {
        level: {
          include: {
            building: {
              include: {
                site: {
                  include: {
                    client: true
                  }
                }
              }
            }
          }
        },
        equipments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getAllLocations - Success:", locations.length, "locations found");
    return locations;
  } catch (error) {
    console.error("Repository: getAllLocations - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getLocationsByLevelId = async (levelId: string) => {
  try {
    console.log("Repository: getLocationsByLevelId - Starting with levelId:", levelId);
    const locations = await prisma.location.findMany({
      where: { levelId },
      include: {
        level: {
          include: {
            building: {
              include: {
                site: {
                  include: {
                    client: true
                  }
                }
              }
            }
          }
        },
        equipments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getLocationsByLevelId - Success:", locations.length, "locations found");
    return locations;
  } catch (error) {
    console.error("Repository: getLocationsByLevelId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getLocationById = async (id: string) => {
  try {
    console.log("Repository: getLocationById - Starting with id:", id);
    
    const location = await prisma.location.findUnique({
      where: { id },
      include: { 
        level: {
          include: {
            building: {
              include: {
                site: {
                  include: {
                    client: true
                  }
                }
              }
            }
          }
        },
        equipments: true
      }
    });
    
    if (!location) {
      console.log("Repository: getLocationById - Location not found");
      throw new Error("Location not found");
    }
    
    console.log("Repository: getLocationById - Success:", location);
    return location;
  } catch (error) {
    console.error("Repository: getLocationById - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const createLocation = async (data: {
  name: string;
  image?: string;
  levelId: string;
}) => {
  try {
    console.log("Repository: createLocation - Starting with data:", data);
    
    await prisma.$connect();
    console.log("Repository: createLocation - Database connected");
    
    const locationData = {
      name: data.name.trim(),
      image: data.image?.trim() || null,
      levelId: data.levelId,
    };
    
    console.log("Repository: createLocation - Prepared data:", locationData);
    
    const newLocation = await prisma.location.create({
      data: locationData,
      include: {
        level: {
          include: {
            building: {
              include: {
                site: {
                  include: {
                    client: true
                  }
                }
              }
            }
          }
        },
        equipments: true
      }
    });
    
    console.log("Repository: createLocation - Success:", newLocation);
    return newLocation;
    
  } catch (error) {
    console.error("Repository: createLocation - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A location with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateLocation = async (id: string, data: {
  name?: string;
  image?: string;
}) => {
  try {
    console.log("Repository: updateLocation - Starting with id:", id, "and data:", data);
    
    await prisma.$connect();
    console.log("Repository: updateLocation - Database connected");
    
    const existingLocation = await prisma.location.findUnique({
      where: { id }
    });
    
    if (!existingLocation) {
      throw new Error("Location not found");
    }
    
    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.image !== undefined) {
      updateData.image = data.image?.trim() || null;
    }
    
    console.log("Repository: updateLocation - Prepared update data:", updateData);
    
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: updateData,
      include: {
        level: {
          include: {
            building: {
              include: {
                site: {
                  include: {
                    client: true
                  }
                }
              }
            }
          }
        },
        equipments: true
      }
    });
    
    console.log("Repository: updateLocation - Success:", updatedLocation);
    return updatedLocation;
    
  } catch (error) {
    console.error("Repository: updateLocation - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A location with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteLocation = async (id: string) => {
  try {
    console.log("Repository: deleteLocation - Starting with id:", id);
    
    await prisma.$connect();
    console.log("Repository: deleteLocation - Database connected");
    
    const existingLocation = await prisma.location.findUnique({
      where: { id },
      include: { equipments: true }
    });
    
    if (!existingLocation) {
      throw new Error("Location not found");
    }
    
    if (existingLocation.equipments.length > 0) {
      throw new Error("Cannot delete location with existing equipments. Please delete all equipments first.");
    }
    
    console.log("Repository: deleteLocation - Location found, proceeding with deletion");
    
    const deletedLocation = await prisma.location.delete({
      where: { id },
    });
    
    console.log("Repository: deleteLocation - Success:", deletedLocation);
    return deletedLocation;
    
  } catch (error) {
    console.error("Repository: deleteLocation - Prisma error:", error);
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
