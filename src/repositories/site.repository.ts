// src/repositories/site.repository.ts
import prisma from "@/db/client";

export const getAllSites = async () => {
  try {
    console.log("Repository: getAllSites - Starting");
    const sites = await prisma.site.findMany({
      include: {
        client: true,
        buildings: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getAllSites - Success:", sites.length, "sites found");
    return sites;
  } catch (error) {
    console.error("Repository: getAllSites - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getSitesByClientId = async (clientId: string) => {
  try {
    console.log("Repository: getSitesByClientId - Starting with clientId:", clientId);
    const sites = await prisma.site.findMany({
      where: { clientId },
      include: {
        client: true,
        buildings: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getSitesByClientId - Success:", sites.length, "sites found");
    return sites;
  } catch (error) {
    console.error("Repository: getSitesByClientId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getSiteById = async (id: string) => {
  try {
    console.log("Repository: getSiteById - Starting with id:", id);
    
    const site = await prisma.site.findUnique({
      where: { id },
      include: { 
        client: true,
        buildings: {
          include: {
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
        }
      }
    });
    
    if (!site) {
      console.log("Repository: getSiteById - Site not found");
      throw new Error("Site not found");
    }
    
    console.log("Repository: getSiteById - Success:", site);
    return site;
  } catch (error) {
    console.error("Repository: getSiteById - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const createSite = async (data: {
  name: string;
  image?: string;
  clientId: string;
}) => {
  try {
    console.log("Repository: createSite - Starting with data:", data);
    
    await prisma.$connect();
    console.log("Repository: createSite - Database connected");
    
    const siteData = {
      name: data.name.trim(),
      image: data.image?.trim() || null,
      clientId: data.clientId,
    };
    
    console.log("Repository: createSite - Prepared data:", siteData);
    
    const newSite = await prisma.site.create({
      data: siteData,
      include: {
        client: true,
        buildings: true
      }
    });
    
    console.log("Repository: createSite - Success:", newSite);
    return newSite;
    
  } catch (error) {
    console.error("Repository: createSite - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A site with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateSite = async (id: string, data: {
  name?: string;
  image?: string;
}) => {
  try {
    console.log("Repository: updateSite - Starting with id:", id, "and data:", data);
    
    await prisma.$connect();
    console.log("Repository: updateSite - Database connected");
    
    const existingSite = await prisma.site.findUnique({
      where: { id }
    });
    
    if (!existingSite) {
      throw new Error("Site not found");
    }
    
    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.image !== undefined) {
      updateData.image = data.image?.trim() || null;
    }
    
    console.log("Repository: updateSite - Prepared update data:", updateData);
    
    const updatedSite = await prisma.site.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        buildings: true
      }
    });
    
    console.log("Repository: updateSite - Success:", updatedSite);
    return updatedSite;
    
  } catch (error) {
    console.error("Repository: updateSite - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('A site with this information already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteSite = async (id: string) => {
  try {
    console.log("Repository: deleteSite - Starting with id:", id);
    
    await prisma.$connect();
    console.log("Repository: deleteSite - Database connected");
    
    const existingSite = await prisma.site.findUnique({
      where: { id },
      include: { buildings: true }
    });
    
    if (!existingSite) {
      throw new Error("Site not found");
    }
    
    if (existingSite.buildings.length > 0) {
      throw new Error("Cannot delete site with existing buildings. Please delete all buildings first.");
    }
    
    console.log("Repository: deleteSite - Site found, proceeding with deletion");
    
    const deletedSite = await prisma.site.delete({
      where: { id },
    });
    
    console.log("Repository: deleteSite - Success:", deletedSite);
    return deletedSite;
    
  } catch (error) {
    console.error("Repository: deleteSite - Prisma error:", error);
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
