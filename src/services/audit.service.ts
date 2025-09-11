// src/services/audit.service.ts
import { Audit } from "@prisma/client";
import { 
  getAuditsByEquipmentId, 
  getLatestAuditByEquipmentId, 
  getAuditById,
  deleteAuditById,
  updateAuditById,
  createAudit
} from "@/repositories/audit.repository";

export const fetchAuditsByEquipmentId = async (equipmentId: string): Promise<Audit[]> => {
  try {
    console.log("Service: fetchAuditsByEquipmentId - Starting with equipmentId:", equipmentId);
    
    // Validation
    if (!equipmentId || typeof equipmentId !== "string") {
      console.error("Service: fetchAuditsByEquipmentId - Invalid equipmentId:", equipmentId);
      throw new Error("Equipment ID is required and must be a string.");
    }
    
    if (equipmentId.trim().length === 0) {
      console.error("Service: fetchAuditsByEquipmentId - Empty equipmentId after trim");
      throw new Error("Equipment ID cannot be empty.");
    }

    console.log("Service: fetchAuditsByEquipmentId - Validation passed, calling repository");
    const audits = await getAuditsByEquipmentId(equipmentId);
    console.log("Service: fetchAuditsByEquipmentId - Success:", audits.length, "audits");
    
    return audits;
  } catch (error) {
    console.error("Service: fetchAuditsByEquipmentId - Error:", error);
    throw error;
  }
};

export const fetchLatestAuditByEquipmentId = async (equipmentId: string): Promise<Audit | null> => {
  try {
    console.log("Service: fetchLatestAuditByEquipmentId - Starting with equipmentId:", equipmentId);
    
    // Validation
    if (!equipmentId || typeof equipmentId !== "string") {
      console.error("Service: fetchLatestAuditByEquipmentId - Invalid equipmentId:", equipmentId);
      throw new Error("Equipment ID is required and must be a string.");
    }
    
    if (equipmentId.trim().length === 0) {
      console.error("Service: fetchLatestAuditByEquipmentId - Empty equipmentId after trim");
      throw new Error("Equipment ID cannot be empty.");
    }

    console.log("Service: fetchLatestAuditByEquipmentId - Validation passed, calling repository");
    const audit = await getLatestAuditByEquipmentId(equipmentId);
    console.log("Service: fetchLatestAuditByEquipmentId - Success:", audit);
    
    return audit;
  } catch (error) {
    console.error("Service: fetchLatestAuditByEquipmentId - Error:", error);
    throw error;
  }
};

export const fetchAuditById = async (id: string): Promise<Audit> => {
  try {
    console.log("Service: fetchAuditById - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: fetchAuditById - Invalid id:", id);
      throw new Error("Audit ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: fetchAuditById - Empty id after trim");
      throw new Error("Audit ID cannot be empty.");
    }

    console.log("Service: fetchAuditById - Validation passed, calling repository");
    const audit = await getAuditById(id);
    console.log("Service: fetchAuditById - Success:", audit);
    
    return audit;
  } catch (error) {
    console.error("Service: fetchAuditById - Error:", error);
    throw error;
  }
};

export const addAudit = async (data: {
  equipmentId: string;
  auditeur: string;
  statutGlobal: string;
  notesGlobales?: string;
  checklist: any;
  photos?: any;
}): Promise<Audit> => {
  try {
    console.log("Service: addAudit - Starting with data:", data);
    
    // Validation
    if (!data.equipmentId || typeof data.equipmentId !== "string") {
      console.error("Service: addAudit - Invalid equipmentId:", data.equipmentId);
      throw new Error("Equipment ID is required and must be a string.");
    }
    
    if (data.equipmentId.trim().length === 0) {
      console.error("Service: addAudit - Empty equipmentId after trim");
      throw new Error("Equipment ID cannot be empty.");
    }

    if (!data.auditeur || typeof data.auditeur !== "string") {
      console.error("Service: addAudit - Invalid auditeur:", data.auditeur);
      throw new Error("Auditeur is required and must be a string.");
    }
    
    if (data.auditeur.trim().length === 0) {
      console.error("Service: addAudit - Empty auditeur after trim");
      throw new Error("Auditeur cannot be empty.");
    }

    if (!data.statutGlobal || typeof data.statutGlobal !== "string") {
      console.error("Service: addAudit - Invalid statutGlobal:", data.statutGlobal);
      throw new Error("Global status is required and must be a string.");
    }

    if (!data.checklist) {
      console.error("Service: addAudit - Missing checklist");
      throw new Error("Checklist is required.");
    }

    console.log("Service: addAudit - Validation passed, calling repository");
    const newAudit = await createAudit(data);
    console.log("Service: addAudit - Success:", newAudit);
    
    return newAudit;
  } catch (error) {
    console.error("Service: addAudit - Error:", error);
    throw error;
  }
};

export const modifyAudit = async (id: string, data: {
  auditeur?: string;
  statutGlobal?: string;
  notesGlobales?: string;
  checklist?: any;
  photos?: any;
}): Promise<Audit> => {
  try {
    console.log("Service: modifyAudit - Starting with id:", id, "and data:", data);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: modifyAudit - Invalid id:", id);
      throw new Error("Audit ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: modifyAudit - Empty id after trim");
      throw new Error("Audit ID cannot be empty.");
    }
    
    if (data.auditeur !== undefined && (typeof data.auditeur !== "string" || data.auditeur.trim().length === 0)) {
      console.error("Service: modifyAudit - Invalid auditeur:", data.auditeur);
      throw new Error("Auditeur must be a non-empty string if provided.");
    }

    if (data.statutGlobal !== undefined && (typeof data.statutGlobal !== "string" || data.statutGlobal.trim().length === 0)) {
      console.error("Service: modifyAudit - Invalid statutGlobal:", data.statutGlobal);
      throw new Error("Global status must be a non-empty string if provided.");
    }

    console.log("Service: modifyAudit - Validation passed, calling repository");
    const updatedAudit = await updateAuditById(id, data);
    console.log("Service: modifyAudit - Success:", updatedAudit);
    
    return updatedAudit;
  } catch (error) {
    console.error("Service: modifyAudit - Error:", error);
    throw error;
  }
};

export const removeAudit = async (id: string): Promise<Audit> => {
  try {
    console.log("Service: removeAudit - Starting with id:", id);
    
    // Validation
    if (!id || typeof id !== "string") {
      console.error("Service: removeAudit - Invalid id:", id);
      throw new Error("Audit ID is required and must be a string.");
    }
    
    if (id.trim().length === 0) {
      console.error("Service: removeAudit - Empty id after trim");
      throw new Error("Audit ID cannot be empty.");
    }

    console.log("Service: removeAudit - Validation passed, calling repository");
    const deletedAudit = await deleteAuditById(id);
    console.log("Service: removeAudit - Success:", deletedAudit);
    
    return deletedAudit;
  } catch (error) {
    console.error("Service: removeAudit - Error:", error);
    throw error;
  }
};