// src/repositories/audit.repository.ts
import prisma from "@/db/client";

export const getAuditsByEquipmentId = async (equipmentId: string) => {
  try {
    console.log("Repository: getAuditsByEquipmentId - Starting with equipmentId:", equipmentId);
    const audits = await prisma.audit.findMany({
      where: { equipmentId },
      orderBy: { version: 'desc' }
    });
    console.log("Repository: getAuditsByEquipmentId - Success:", audits.length, "audits found");
    return audits;
  } catch (error) {
    console.error("Repository: getAuditsByEquipmentId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getLatestAuditByEquipmentId = async (equipmentId: string) => {
  try {
    console.log("Repository: getLatestAuditByEquipmentId - Starting with equipmentId:", equipmentId);
    const audit = await prisma.audit.findFirst({
      where: { equipmentId },
      orderBy: { version: 'desc' }
    });
    console.log("Repository: getLatestAuditByEquipmentId - Success:", audit);
    return audit;
  } catch (error) {
    console.error("Repository: getLatestAuditByEquipmentId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getAuditById = async (id: string) => {
  try {
    console.log("Repository: getAuditById - Starting with id:", id);
    
    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        equipment: {
          include: {
            location: {
              include: {
                level: {
                  include: {
                    building: {
                      include: {
                        site: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!audit) {
      console.log("Repository: getAuditById - Audit not found");
      throw new Error("Audit not found");
    }
    
    console.log("Repository: getAuditById - Success:", audit);
    return audit;
  } catch (error) {
    console.error("Repository: getAuditById - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const createAudit = async (data: {
  equipmentId: string;
  auditeur: string;
  statutGlobal: string;
  notesGlobales?: string;
  checklist: any;
  photos?: any;
}) => {
  try {
    console.log("Repository: createAudit - Starting with data:", data);
    
    await prisma.$connect();
    console.log("Repository: createAudit - Database connected");
    
    // Get the next version number for this equipment
    const lastAudit = await prisma.audit.findFirst({
      where: { equipmentId: data.equipmentId },
      orderBy: { version: 'desc' }
    });
    
    const nextVersion = (lastAudit?.version || 0) + 1;
    console.log("Repository: createAudit - Next version will be:", nextVersion);
    
    const auditData = {
      equipmentId: data.equipmentId,
      version: nextVersion,
      auditeur: data.auditeur.trim(),
      statutGlobal: data.statutGlobal,
      notesGlobales: data.notesGlobales?.trim() || null,
      checklist: data.checklist || [],
      photos: data.photos || [],
    };
    
    console.log("Repository: createAudit - Prepared data:", auditData);
    
    const newAudit = await prisma.audit.create({
      data: auditData,
      include: {
        equipment: {
          include: {
            location: {
              include: {
                level: {
                  include: {
                    building: {
                      include: {
                        site: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    console.log("Repository: createAudit - Success:", newAudit);
    return newAudit;
    
  } catch (error) {
    console.error("Repository: createAudit - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('An audit with this version already exists for this equipment.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateAuditById = async (id: string, data: {
  auditeur?: string;
  statutGlobal?: string;
  notesGlobales?: string;
  checklist?: any;
  photos?: any;
}) => {
  try {
    console.log("Repository: updateAudit - Starting with id:", id, "and data:", data);
    
    await prisma.$connect();
    console.log("Repository: updateAudit - Database connected");
    
    const existingAudit = await prisma.audit.findUnique({
      where: { id }
    });
    
    if (!existingAudit) {
      throw new Error("Audit not found");
    }
    
    const updateData: any = {};
    if (data.auditeur !== undefined) {
      updateData.auditeur = data.auditeur.trim();
    }
    if (data.statutGlobal !== undefined) {
      updateData.statutGlobal = data.statutGlobal;
    }
    if (data.notesGlobales !== undefined) {
      updateData.notesGlobales = data.notesGlobales?.trim() || null;
    }
    if (data.checklist !== undefined) {
      updateData.checklist = data.checklist;
    }
    if (data.photos !== undefined) {
      updateData.photos = data.photos;
    }
    
    console.log("Repository: updateAudit - Prepared update data:", updateData);
    
    const updatedAudit = await prisma.audit.update({
      where: { id },
      data: updateData,
      include: {
        equipment: {
          include: {
            location: {
              include: {
                level: {
                  include: {
                    building: {
                      include: {
                        site: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    console.log("Repository: updateAudit - Success:", updatedAudit);
    return updatedAudit;
    
  } catch (error) {
    console.error("Repository: updateAudit - Prisma error:", error);
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

export const deleteAuditById = async (id: string) => {
  try {
    console.log("Repository: deleteAudit - Starting with id:", id);
    
    await prisma.$connect();
    console.log("Repository: deleteAudit - Database connected");
    
    const existingAudit = await prisma.audit.findUnique({
      where: { id }
    });
    
    if (!existingAudit) {
      throw new Error("Audit not found");
    }
    
    console.log("Repository: deleteAudit - Audit found, proceeding with deletion");
    
    const deletedAudit = await prisma.audit.delete({
      where: { id },
    });
    
    console.log("Repository: deleteAudit - Success:", deletedAudit);
    return deletedAudit;
    
  } catch (error) {
    console.error("Repository: deleteAudit - Prisma error:", error);
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