// src/services/building.service.ts
import { getBuildingsBySiteId, getBuildingById, createBuilding, updateBuilding, deleteBuilding, getBuildingsByClientId } from '@/repositories/building.repository';
import { Building } from '@prisma/client';

export const fetchBuildingsBySiteId = async (siteId: string): Promise<Building[]> => {
  try {
    console.log("Service: fetchBuildingsBySiteId - Starting with siteId:", siteId);
    
    // Validation
    if (!siteId || typeof siteId !== "string") {
      console.error("Service: fetchBuildingsBySiteId - Invalid siteId:", siteId);
      throw new Error("Site ID is required and must be a string.");
    }
    
    if (siteId.trim().length === 0) {
      console.error("Service: fetchBuildingsBySiteId - Empty siteId after trim");
      throw new Error("Site ID cannot be empty.");
    }

    console.log("Service: fetchBuildingsBySiteId - Validation passed, calling repository");
    const buildings = await getBuildingsBySiteId(siteId);
    console.log("Service: fetchBuildingsBySiteId - Success:", buildings.length, "buildings");
    
    return buildings;
  } catch (error) {
    console.error("Service: fetchBuildingsBySiteId - Error:", error);
    throw error;
  }
};

export const fetchBuildingsByClientId = async (clientId: string) => {
  try {
    console.log("Service: fetchBuildingsByClientId - Starting with clientId:", clientId);

    // Validation
    if (!clientId || typeof clientId !== "string") {
      console.error("Service: fetchBuildingsByClientId - Invalid clientId:", clientId);
      throw new Error("Client ID is required and must be a string.");
    }

    if (clientId.trim().length === 0) {
      console.error("Service: fetchBuildingsByClientId - Empty clientId after trim");
      throw new Error("Client ID cannot be empty.");
    }

    console.log("Service: fetchBuildingsByClientId - Validation passed, calling repository");
    const buildings = await getBuildingsByClientId(clientId);

    console.log(
      "Service: fetchBuildingsByClientId - Success:",
      buildings.length,
      "buildings"
    );

    return buildings;
  } catch (error) {
    console.error("Service: fetchBuildingsByClientId - Error:", error);
    throw error;
  }
};

export const fetchBuildingById = async (id: string): Promise<Building> => {
  try {
    console.log("Service: fetchBuildingById - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: fetchBuildingById - Invalid id:", id);
      throw new Error("Building ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: fetchBuildingById - Empty id after trim");
      throw new Error("Building ID cannot be empty.");
    }

    console.log("Service: fetchBuildingById - Validation passed, calling repository");
    const building = await getBuildingById(id);
    console.log("Service: fetchBuildingById - Success:", building);
    
    return building;
  } catch (error) {
    console.error("Service: fetchBuildingById - Error:", error);
    throw error;
  }
};

export const addBuilding = async (data: {
  name: string;
  image?: string;
  siteId: string;
}): Promise<Building> => {
  try {
    console.log("Service: addBuilding - Starting with data:", data);
    
    // Validation
    if (!data.name || typeof data.name !== "string") {
      console.error("Service: addBuilding - Invalid name:", data.name);
      throw new Error("Building name is required and must be a string.");
    }
    
    if (data.name.trim().length === 0) {
      console.error("Service: addBuilding - Empty name after trim");
      throw new Error("Building name cannot be empty.");
    }

    if (!data.siteId || typeof data.siteId !== "string") {
      console.error("Service: addBuilding - Invalid siteId:", data.siteId);
      throw new Error("Site ID is required and must be a string.");
    }
    
    if (data.siteId.trim().length === 0) {
      console.error("Service: addBuilding - Empty siteId after trim");
      throw new Error("Site ID cannot be empty.");
    }

    console.log("Service: addBuilding - Validation passed, calling repository");
    const newBuilding = await createBuilding(data);
    console.log("Service: addBuilding - Success:", newBuilding);
    
    return newBuilding;
  } catch (error) {
    console.error("Service: addBuilding - Error:", error);
    throw error;
  }
};

export const modifyBuilding = async (id: string, data: {
  name?: string;
  image?: string;
}): Promise<Building> => {
  try {
    console.log("Service: modifyBuilding - Starting with id:", id, "and data:", data);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: modifyBuilding - Invalid id:", id);
      throw new Error("Building ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: modifyBuilding - Empty id after trim");
      throw new Error("Building ID cannot be empty.");
    }
    
    if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
      console.error("Service: modifyBuilding - Invalid name:", data.name);
      throw new Error("Building name must be a non-empty string if provided.");
    }

    console.log("Service: modifyBuilding - Validation passed, calling repository");
    const updatedBuilding = await updateBuilding(id, data);
    console.log("Service: modifyBuilding - Success:", updatedBuilding);
    
    return updatedBuilding;
  } catch (error) {
    console.error("Service: modifyBuilding - Error:", error);
    throw error;
  }
};

export const removeBuilding = async (id: string): Promise<Building> => {
  try {
    console.log("Service: removeBuilding - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: removeBuilding - Invalid id:", id);
      throw new Error("Building ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: removeBuilding - Empty id after trim");
      throw new Error("Building ID cannot be empty.");
    }

    console.log("Service: removeBuilding - Validation passed, calling repository");
    const deletedBuilding = await deleteBuilding(id);
    console.log("Service: removeBuilding - Success:", deletedBuilding);
    
    return deletedBuilding;
  } catch (error) {
    console.error("Service: removeBuilding - Error:", error);
    throw error;
  }
};