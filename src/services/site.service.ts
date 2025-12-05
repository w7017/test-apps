// src/services/site.service.ts
import prisma from "@/db/client";
import { createSite, getAllSites, getSitesByClientId, getSiteById, updateSite, deleteSite } from "@/repositories/site.repository";
import { Site } from "@prisma/client";

export const fetchAllSites = async (): Promise<Site[]> => {
  try {
    console.log("Service: fetchAllSites - Starting");
    const sites = await getAllSites();
    console.log("Service: fetchAllSites - Success:", sites.length, "sites");
    return sites;
  } catch (error) {
    console.error("Service: fetchAllSites - Error:", error);
    throw error;
  }
};

export const fetchSitesByClientId = async (clientId: string): Promise<Site[]> => {
  try {
    console.log("Service: fetchSitesByClientId - Starting with clientId:", clientId);
    
    // Validation
    if (!clientId || typeof clientId !== "string") {
      console.error("Service: fetchSitesByClientId - Invalid clientId:", clientId);
      throw new Error("Client ID is required and must be a string.");
    }
    
    if (clientId.trim().length === 0) {
      console.error("Service: fetchSitesByClientId - Empty clientId after trim");
      throw new Error("Client ID cannot be empty.");
    }

    console.log("Service: fetchSitesByClientId - Validation passed, calling repository");
    const sites = await getSitesByClientId(clientId);
    console.log("Service: fetchSitesByClientId - Success:", sites.length, "sites");
    
    return sites;
  } catch (error) {
    console.error("Service: fetchSitesByClientId - Error:", error);
    throw error;
  }
};

export const fetchSiteById = async (id: string): Promise<Site> => {
  try {
    console.log("Service: fetchSiteById - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: fetchSiteById - Invalid id:", id);
      throw new Error("Site ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: fetchSiteById - Empty id after trim");
      throw new Error("Site ID cannot be empty.");
    }

    console.log("Service: fetchSiteById - Validation passed, calling repository");
    const site = await getSiteById(id);
    console.log("Service: fetchSiteById - Success:", site);
    
    return site;
  } catch (error) {
    console.error("Service: fetchSiteById - Error:", error);
    throw error;
  }
};

export const addSite = async (data: {
  name: string;
  address: any;
  codeClient: any;
  codeAffaire: any;
  codeContrat: any;
  image?: string;
  clientId: string;
}): Promise<Site> => {
  try {
    console.log("Service: addSite - Starting with data:", data);
    
    // Validation
    if (!data.name || typeof data.name !== "string") {
      console.error("Service: addSite - Invalid name:", data.name);
      throw new Error("Site name is required and must be a string.");
    }
    
    if (data.name.trim().length === 0) {
      console.error("Service: addSite - Empty name after trim");
      throw new Error("Site name cannot be empty.");
    }

    if (!data.clientId || typeof data.clientId !== "string") {
      console.error("Service: addSite - Invalid clientId:", data.clientId);
      throw new Error("Client ID is required and must be a string.");
    }
    
    if (data.clientId.trim().length === 0) {
      console.error("Service: addSite - Empty clientId after trim");
      throw new Error("Client ID cannot be empty.");
    }

    console.log("Service: addSite - Validation passed, calling repository");
    const newSite = await createSite(data);
    console.log("Service: addSite - Success:", newSite);
    
    return newSite;
  } catch (error) {
    console.error("Service: addSite - Error:", error);
    throw error;
  }
};

export const modifySite = async (id: string, data: {
  address: any;
  codeClient: any;
  codeAffaire: any;
  codeContrat: any;
  name?: string;
  image?: string;
}): Promise<Site> => {
  try {
    console.log("Service: modifySite - Starting with id:", id, "and data:", data);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: modifySite - Invalid id:", id);
      throw new Error("Site ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: modifySite - Empty id after trim");
      throw new Error("Site ID cannot be empty.");
    }
    
    if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
      console.error("Service: modifySite - Invalid name:", data.name);
      throw new Error("Site name must be a non-empty string if provided.");
    }

    console.log("Service: modifySite - Validation passed, calling repository");
    const updatedSite = await updateSite(id, data);
    console.log("Service: modifySite - Success:", updatedSite);
    
    return updatedSite;
  } catch (error) {
    console.error("Service: modifySite - Error:", error);
    throw error;
  }
};

export const removeSite = async (id: string): Promise<Site> => {
  try {
    console.log("Service: removeSite - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: removeSite - Invalid id:", id);
      throw new Error("Site ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: removeSite - Empty id after trim");
      throw new Error("Site ID cannot be empty.");
    }

    console.log("Service: removeSite - Validation passed, calling repository");
    const deletedSite = await deleteSite(id);
    console.log("Service: removeSite - Success:", deletedSite);
    
    return deletedSite;
  } catch (error) {
    console.error("Service: removeSite - Error:", error);
    throw error;
  }
};

// Add this new function to your site.service.ts

export const fetchSitesByClientIdWithFullHierarchy = async (clientId: string): Promise<Site[]> => {
  try {
    console.log("Service: fetchSitesByClientIdWithFullHierarchy - Starting with clientId:", clientId);
    
    // Validation
    if (!clientId || typeof clientId !== "string") {
      console.error("Service: fetchSitesByClientIdWithFullHierarchy - Invalid clientId:", clientId);
      throw new Error("Client ID is required and must be a string.");
    }
    
    if (clientId.trim().length === 0) {
      console.error("Service: fetchSitesByClientIdWithFullHierarchy - Empty clientId after trim");
      throw new Error("Client ID cannot be empty.");
    }

    console.log("Service: fetchSitesByClientIdWithFullHierarchy - Validation passed, calling repository");
    const sites = await getSitesByClientIdWithFullHierarchy(clientId);
    console.log("Service: fetchSitesByClientIdWithFullHierarchy - Success:", sites.length, "sites");
    
    return sites;
  } catch (error) {
    console.error("Service: fetchSitesByClientIdWithFullHierarchy - Error:", error);
    throw error;
  }
};

export const getSitesByClientIdWithFullHierarchy = async (clientId: string) => {
  try {
    console.log("Repository: getSitesByClientIdWithFullHierarchy - Starting with clientId:", clientId);
    const sites = await prisma.site.findMany({
      where: { clientId },
      include: {
        client: true,
        buildings: {
          include: {
            levels: {
              include: {
                locations: {
                  include: {
                    equipments: {
                      include: {
                        audits: {
                          orderBy: { version: 'desc' },
                          take: 1 // Get only the latest audit
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getSitesByClientIdWithFullHierarchy - Success:", sites.length, "sites found");
    return sites;
  } catch (error) {
    console.error("Repository: getSitesByClientIdWithFullHierarchy - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};
