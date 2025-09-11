// src/services/equipment.service.ts
import { Equipment } from "@prisma/client";
import { 
  getEquipmentById, 
  getAllEquipments, 
  getEquipmentsByLocationId, 
  createEquipment, 
  updateEquipment, 
  deleteEquipment 
} from "@/repositories/equipment.repository";

export const fetchEquipmentById = async (id: string): Promise<Equipment> => {
  try {
    console.log("Service: fetchEquipmentById - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: fetchEquipmentById - Invalid id:", id);
      throw new Error("Equipment ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: fetchEquipmentById - Empty id after trim");
      throw new Error("Equipment ID cannot be empty.");
    }

    console.log("Service: fetchEquipmentById - Validation passed, calling repository");
    const equipment = await getEquipmentById(id);
    console.log("Service: fetchEquipmentById - Success:", equipment);
    
    return equipment;
  } catch (error) {
    console.error("Service: fetchEquipmentById - Error:", error);
    throw error;
  }
};

export const fetchAllEquipments = async (): Promise<Equipment[]> => {
  try {
    console.log("Service: fetchAllEquipments - Starting");
    const equipments = await getAllEquipments();
    console.log("Service: fetchAllEquipments - Success:", equipments.length, "equipments");
    return equipments;
  } catch (error) {
    console.error("Service: fetchAllEquipments - Error:", error);
    throw error;
  }
};

export const fetchEquipmentsByLocationId = async (locationId: string): Promise<Equipment[]> => {
  try {
    console.log("Service: fetchEquipmentsByLocationId - Starting with locationId:", locationId);
    
    // Validation
    if (!locationId || typeof locationId !== "string") {
      console.error("Service: fetchEquipmentsByLocationId - Invalid locationId:", locationId);
      throw new Error("Location ID is required and must be a string.");
    }
    
    if (locationId.trim().length === 0) {
      console.error("Service: fetchEquipmentsByLocationId - Empty locationId after trim");
      throw new Error("Location ID cannot be empty.");
    }

    console.log("Service: fetchEquipmentsByLocationId - Validation passed, calling repository");
    const equipments = await getEquipmentsByLocationId(locationId);
    console.log("Service: fetchEquipmentsByLocationId - Success:", equipments.length, "equipments");
    
    return equipments;
  } catch (error) {
    console.error("Service: fetchEquipmentsByLocationId - Error:", error);
    throw error;
  }
};

export const addEquipment = async (data: {
  code: string;
  libelle: string;
  locationId: string;
  image?: string;
  qrCode?: string;
  zone?: string;
  reseau?: string;
  localisationPrecise?: string;
  localisationDetaillee?: string;
  inclureGMAO?: boolean;
  absentReferentiel?: boolean;
  inventaireP3?: boolean;
  codeBIM?: string;
  numIdentification?: string;
  quantite?: number;
  statut?: string;
  etatSante?: string;
  equipementSensible?: boolean;
  domaineGMAO?: string;
  famille?: string;
  sousFamille?: string;
  typeEquipement?: string;
  marque?: string;
  modele?: string;
  reference?: string;
  numeroSerie?: string;
  photoUrl?: string;
  domaineDate?: string;
  dateInstallation?: Date;
  dateFinGarantie?: Date;
  frequenceMaintenance?: number;
}): Promise<Equipment> => {
  try {
    console.log("Service: addEquipment - Starting with data:", data);
    
    // Validation
    if (!data.code || typeof data.code !== "string") {
      console.error("Service: addEquipment - Invalid code:", data.code);
      throw new Error("Equipment code is required and must be a string.");
    }
    
    if (data.code.trim().length === 0) {
      console.error("Service: addEquipment - Empty code after trim");
      throw new Error("Equipment code cannot be empty.");
    }

    if (!data.libelle || typeof data.libelle !== "string") {
      console.error("Service: addEquipment - Invalid libelle:", data.libelle);
      throw new Error("Equipment label is required and must be a string.");
    }
    
    if (data.libelle.trim().length === 0) {
      console.error("Service: addEquipment - Empty libelle after trim");
      throw new Error("Equipment label cannot be empty.");
    }

    if (!data.locationId || typeof data.locationId !== "string") {
      console.error("Service: addEquipment - Invalid locationId:", data.locationId);
      throw new Error("Location ID is required and must be a string.");
    }
    
    if (data.locationId.trim().length === 0) {
      console.error("Service: addEquipment - Empty locationId after trim");
      throw new Error("Location ID cannot be empty.");
    }

    console.log("Service: addEquipment - Validation passed, calling repository");
    const newEquipment = await createEquipment(data);
    console.log("Service: addEquipment - Success:", newEquipment);
    
    return newEquipment;
  } catch (error) {
    console.error("Service: addEquipment - Error:", error);
    throw error;
  }
};

export const modifyEquipment = async (id: string, data: any): Promise<Equipment> => {
  try {
    console.log("Service: modifyEquipment - Starting with id:", id, "and data:", data);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: modifyEquipment - Invalid id:", id);
      throw new Error("Equipment ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: modifyEquipment - Empty id after trim");
      throw new Error("Equipment ID cannot be empty.");
    }
    
    if (data.code !== undefined && (typeof data.code !== "string" || data.code.trim().length === 0)) {
      console.error("Service: modifyEquipment - Invalid code:", data.code);
      throw new Error("Equipment code must be a non-empty string if provided.");
    }

    if (data.libelle !== undefined && (typeof data.libelle !== "string" || data.libelle.trim().length === 0)) {
      console.error("Service: modifyEquipment - Invalid libelle:", data.libelle);
      throw new Error("Equipment label must be a non-empty string if provided.");
    }

    console.log("Service: modifyEquipment - Validation passed, calling repository");
    const updatedEquipment = await updateEquipment(id, data);
    console.log("Service: modifyEquipment - Success:", updatedEquipment);
    
    return updatedEquipment;
  } catch (error) {
    console.error("Service: modifyEquipment - Error:", error);
    throw error;
  }
};

export const removeEquipment = async (id: string): Promise<Equipment> => {
  try {
    console.log("Service: removeEquipment - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: removeEquipment - Invalid id:", id);
      throw new Error("Equipment ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: removeEquipment - Empty id after trim");
      throw new Error("Equipment ID cannot be empty.");
    }

    console.log("Service: removeEquipment - Validation passed, calling repository");
    const deletedEquipment = await deleteEquipment(id);
    console.log("Service: removeEquipment - Success:", deletedEquipment);
    
    return deletedEquipment;
  } catch (error) {
    console.error("Service: removeEquipment - Error:", error);
    throw error;
  }
};