// src/services/level.service.ts
import { createLevel, getAllLevels, getLevelsByBuildingId, getLevelById, updateLevel, deleteLevel } from "@/repositories/level.repository";
import { Level } from "@prisma/client";

export const fetchAllLevels = async (): Promise<Level[]> => {
  try {
    console.log("Service: fetchAllLevels - Starting");
    const levels = await getAllLevels();
    console.log("Service: fetchAllLevels - Success:", levels.length, "levels");
    return levels;
  } catch (error) {
    console.error("Service: fetchAllLevels - Error:", error);
    throw error;
  }
};

export const fetchLevelsByBuildingId = async (buildingId: string): Promise<Level[]> => {
  try {
    console.log("Service: fetchLevelsByBuildingId - Starting with buildingId:", buildingId);
    
    // Validation
    if (!buildingId || typeof buildingId !== "string") {
      console.error("Service: fetchLevelsByBuildingId - Invalid buildingId:", buildingId);
      throw new Error("Building ID is required and must be a string.");
    }
    
    if (buildingId.trim().length === 0) {
      console.error("Service: fetchLevelsByBuildingId - Empty buildingId after trim");
      throw new Error("Building ID cannot be empty.");
    }

    console.log("Service: fetchLevelsByBuildingId - Validation passed, calling repository");
    const levels = await getLevelsByBuildingId(buildingId);
    console.log("Service: fetchLevelsByBuildingId - Success:", levels.length, "levels");
    
    return levels;
  } catch (error) {
    console.error("Service: fetchLevelsByBuildingId - Error:", error);
    throw error;
  }
};

export const fetchLevelById = async (id: string): Promise<Level> => {
  try {
    console.log("Service: fetchLevelById - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: fetchLevelById - Invalid id:", id);
      throw new Error("Level ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: fetchLevelById - Empty id after trim");
      throw new Error("Level ID cannot be empty.");
    }

    console.log("Service: fetchLevelById - Validation passed, calling repository");
    const level = await getLevelById(id);
    console.log("Service: fetchLevelById - Success:", level);
    
    return level;
  } catch (error) {
    console.error("Service: fetchLevelById - Error:", error);
    throw error;
  }
};

export const addLevel = async (data: {
  name: string;
  image?: string;
  buildingId: string;
}): Promise<Level> => {
  try {
    console.log("Service: addLevel - Starting with data:", data);
    
    // Validation
    if (!data.name || typeof data.name !== "string") {
      console.error("Service: addLevel - Invalid name:", data.name);
      throw new Error("Level name is required and must be a string.");
    }
    
    if (data.name.trim().length === 0) {
      console.error("Service: addLevel - Empty name after trim");
      throw new Error("Level name cannot be empty.");
    }

    if (!data.buildingId || typeof data.buildingId !== "string") {
      console.error("Service: addLevel - Invalid buildingId:", data.buildingId);
      throw new Error("Building ID is required and must be a string.");
    }
    
    if (data.buildingId.trim().length === 0) {
      console.error("Service: addLevel - Empty buildingId after trim");
      throw new Error("Building ID cannot be empty.");
    }

    console.log("Service: addLevel - Validation passed, calling repository");
    const newLevel = await createLevel(data);
    console.log("Service: addLevel - Success:", newLevel);
    
    return newLevel;
  } catch (error) {
    console.error("Service: addLevel - Error:", error);
    throw error;
  }
};

export const modifyLevel = async (id: string, data: {
  name?: string;
  image?: string;
}): Promise<Level> => {
  try {
    console.log("Service: modifyLevel - Starting with id:", id, "and data:", data);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: modifyLevel - Invalid id:", id);
      throw new Error("Level ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: modifyLevel - Empty id after trim");
      throw new Error("Level ID cannot be empty.");
    }
    
    if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
      console.error("Service: modifyLevel - Invalid name:", data.name);
      throw new Error("Level name must be a non-empty string if provided.");
    }

    console.log("Service: modifyLevel - Validation passed, calling repository");
    const updatedLevel = await updateLevel(id, data);
    console.log("Service: modifyLevel - Success:", updatedLevel);
    
    return updatedLevel;
  } catch (error) {
    console.error("Service: modifyLevel - Error:", error);
    throw error;
  }
};

export const removeLevel = async (id: string): Promise<Level> => {
  try {
    console.log("Service: removeLevel - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: removeLevel - Invalid id:", id);
      throw new Error("Level ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: removeLevel - Empty id after trim");
      throw new Error("Level ID cannot be empty.");
    }

    console.log("Service: removeLevel - Validation passed, calling repository");
    const deletedLevel = await deleteLevel(id);
    console.log("Service: removeLevel - Success:", deletedLevel);
    
    return deletedLevel;
  } catch (error) {
    console.error("Service: removeLevel - Error:", error);
    throw error;
  }
};
