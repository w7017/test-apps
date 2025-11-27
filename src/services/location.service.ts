// src/services/location.service.ts
import { 
  createLocation, 
  getAllLocations, 
  getLocationsByLevelId,
  getLocationsByBuildingId,
  getLocationsBySiteId,
  getLocationsByClientId,
  getLocationById, 
  updateLocation, 
  deleteLocation 
} from "@/repositories/location.repository";
import { Location } from "@prisma/client";

export const fetchAllLocations = async (): Promise<Location[]> => {
  try {
    console.log("Service: fetchAllLocations - Starting");
    const locations = await getAllLocations();
    console.log("Service: fetchAllLocations - Success:", locations.length, "locations");
    return locations;
  } catch (error) {
    console.error("Service: fetchAllLocations - Error:", error);
    throw error;
  }
};

export const fetchLocationsByLevelId = async (levelId: string): Promise<Location[]> => {
  try {
    console.log("Service: fetchLocationsByLevelId - Starting with levelId:", levelId);
    
    // Validation
    if (!levelId || typeof levelId !== "string") {
      console.error("Service: fetchLocationsByLevelId - Invalid levelId:", levelId);
      throw new Error("Level ID is required and must be a string.");
    }
    
    if (levelId.trim().length === 0) {
      console.error("Service: fetchLocationsByLevelId - Empty levelId after trim");
      throw new Error("Level ID cannot be empty.");
    }

    console.log("Service: fetchLocationsByLevelId - Validation passed, calling repository");
    const locations = await getLocationsByLevelId(levelId);
    console.log("Service: fetchLocationsByLevelId - Success:", locations.length, "locations");
    
    return locations;
  } catch (error) {
    console.error("Service: fetchLocationsByLevelId - Error:", error);
    throw error;
  }
};

export const fetchLocationsByBuildingId = async (buildingId: string): Promise<Location[]> => {
  try {
    console.log("Service: fetchLocationsByBuildingId - Starting with buildingId:", buildingId);
    
    // Validation
    if (!buildingId || typeof buildingId !== "string") {
      console.error("Service: fetchLocationsByBuildingId - Invalid buildingId:", buildingId);
      throw new Error("Building ID is required and must be a string.");
    }
    
    if (buildingId.trim().length === 0) {
      console.error("Service: fetchLocationsByBuildingId - Empty buildingId after trim");
      throw new Error("Building ID cannot be empty.");
    }

    console.log("Service: fetchLocationsByBuildingId - Validation passed, calling repository");
    const locations = await getLocationsByBuildingId(buildingId);
    console.log("Service: fetchLocationsByBuildingId - Success:", locations.length, "locations");
    
    return locations;
  } catch (error) {
    console.error("Service: fetchLocationsByBuildingId - Error:", error);
    throw error;
  }
};

export const fetchLocationsBySiteId = async (siteId: string): Promise<Location[]> => {
  try {
    console.log("Service: fetchLocationsBySiteId - Starting with siteId:", siteId);
    
    // Validation
    if (!siteId || typeof siteId !== "string") {
      console.error("Service: fetchLocationsBySiteId - Invalid siteId:", siteId);
      throw new Error("Site ID is required and must be a string.");
    }
    
    if (siteId.trim().length === 0) {
      console.error("Service: fetchLocationsBySiteId - Empty siteId after trim");
      throw new Error("Site ID cannot be empty.");
    }

    console.log("Service: fetchLocationsBySiteId - Validation passed, calling repository");
    const locations = await getLocationsBySiteId(siteId);
    console.log("Service: fetchLocationsBySiteId - Success:", locations.length, "locations");
    
    return locations;
  } catch (error) {
    console.error("Service: fetchLocationsBySiteId - Error:", error);
    throw error;
  }
};

export const fetchLocationsByClientId = async (clientId: string): Promise<Location[]> => {
  try {
    console.log("Service: fetchLocationsByClientId - Starting with clientId:", clientId);
    
    // Validation
    if (!clientId || typeof clientId !== "string") {
      console.error("Service: fetchLocationsByClientId - Invalid clientId:", clientId);
      throw new Error("Client ID is required and must be a string.");
    }
    
    if (clientId.trim().length === 0) {
      console.error("Service: fetchLocationsByClientId - Empty clientId after trim");
      throw new Error("Client ID cannot be empty.");
    }

    console.log("Service: fetchLocationsByClientId - Validation passed, calling repository");
    const locations = await getLocationsByClientId(clientId);
    console.log("Service: fetchLocationsByClientId - Success:", locations.length, "locations");
    
    return locations;
  } catch (error) {
    console.error("Service: fetchLocationsByClientId - Error:", error);
    throw error;
  }
};

export const fetchLocationById = async (id: string): Promise<Location> => {
  try {
    console.log("Service: fetchLocationById - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: fetchLocationById - Invalid id:", id);
      throw new Error("Location ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: fetchLocationById - Empty id after trim");
      throw new Error("Location ID cannot be empty.");
    }

    console.log("Service: fetchLocationById - Validation passed, calling repository");
    const location = await getLocationById(id);
    console.log("Service: fetchLocationById - Success:", location);
    
    return location;
  } catch (error) {
    console.error("Service: fetchLocationById - Error:", error);
    throw error;
  }
};

export const addLocation = async (data: {
  name: string;
  image?: string;
  levelId: string;
}): Promise<Location> => {
  try {
    console.log("Service: addLocation - Starting with data:", data);
    
    // Validation
    if (!data.name || typeof data.name !== "string") {
      console.error("Service: addLocation - Invalid name:", data.name);
      throw new Error("Location name is required and must be a string.");
    }
    
    if (data.name.trim().length === 0) {
      console.error("Service: addLocation - Empty name after trim");
      throw new Error("Location name cannot be empty.");
    }

    if (!data.levelId || typeof data.levelId !== "string") {
      console.error("Service: addLocation - Invalid levelId:", data.levelId);
      throw new Error("Level ID is required and must be a string.");
    }
    
    if (data.levelId.trim().length === 0) {
      console.error("Service: addLocation - Empty levelId after trim");
      throw new Error("Level ID cannot be empty.");
    }

    console.log("Service: addLocation - Validation passed, calling repository");
    const newLocation = await createLocation(data);
    console.log("Service: addLocation - Success:", newLocation);
    
    return newLocation;
  } catch (error) {
    console.error("Service: addLocation - Error:", error);
    throw error;
  }
};

export const modifyLocation = async (id: string, data: {
  name?: string;
  image?: string;
}): Promise<Location> => {
  try {
    console.log("Service: modifyLocation - Starting with id:", id, "and data:", data);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: modifyLocation - Invalid id:", id);
      throw new Error("Location ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: modifyLocation - Empty id after trim");
      throw new Error("Location ID cannot be empty.");
    }
    
    if (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length === 0)) {
      console.error("Service: modifyLocation - Invalid name:", data.name);
      throw new Error("Location name must be a non-empty string if provided.");
    }

    console.log("Service: modifyLocation - Validation passed, calling repository");
    const updatedLocation = await updateLocation(id, data);
    console.log("Service: modifyLocation - Success:", updatedLocation);
    
    return updatedLocation;
  } catch (error) {
    console.error("Service: modifyLocation - Error:", error);
    throw error;
  }
};

export const removeLocation = async (id: string): Promise<Location> => {
  try {
    console.log("Service: removeLocation - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: removeLocation - Invalid id:", id);
      throw new Error("Location ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: removeLocation - Empty id after trim");
      throw new Error("Location ID cannot be empty.");
    }

    console.log("Service: removeLocation - Validation passed, calling repository");
    const deletedLocation = await deleteLocation(id);
    console.log("Service: removeLocation - Success:", deletedLocation);
    
    return deletedLocation;
  } catch (error) {
    console.error("Service: removeLocation - Error:", error);
    throw error;
  }
};