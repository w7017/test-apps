// src/repositories/equipment.repository.ts
import prisma from "@/db/client";

export const getAllEquipments = async () => {
  try {
    console.log("Repository: getAllEquipments - Starting");
    const equipments = await prisma.equipment.findMany({
      include: {
        location: {
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
            }
          }
        },
        audits: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getAllEquipments - Success:", equipments.length, "equipments found");
    return equipments;
  } catch (error) {
    console.error("Repository: getAllEquipments - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getEquipmentsByLocationId = async (locationId: string) => {
  try {
    console.log("Repository: getEquipmentsByLocationId - Starting with locationId:", locationId);
    const equipments = await prisma.equipment.findMany({
      where: { locationId },
      include: {
        location: {
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
            }
          }
        },
        audits: true
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log("Repository: getEquipmentsByLocationId - Success:", equipments.length, "equipments found");
    return equipments;
  } catch (error) {
    console.error("Repository: getEquipmentsByLocationId - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getEquipmentById = async (id: string) => {
  try {
    console.log("Repository: getEquipmentById - Starting with id:", id);
    
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: { 
        location: {
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
            }
          }
        },
        audits: {
          orderBy: { version: 'desc' }
        }
      }
    });
    
    if (!equipment) {
      console.log("Repository: getEquipmentById - Equipment not found");
      throw new Error("Equipment not found");
    }
    
    console.log("Repository: getEquipmentById - Success:", equipment);
    return equipment;
  } catch (error) {
    console.error("Repository: getEquipmentById - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getEquipmentByCode = async (code: string) => {
  try {
    console.log("Repository: getEquipmentByCode - Starting with code:", code);
    
    const equipment = await prisma.equipment.findUnique({
      where: { code },
      include: { 
        location: {
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
            }
          }
        },
        audits: {
          orderBy: { version: 'desc' }
        }
      }
    });
    
    if (!equipment) {
      console.log("Repository: getEquipmentByCode - Equipment not found");
      throw new Error("Equipment not found");
    }
    
    console.log("Repository: getEquipmentByCode - Success:", equipment);
    return equipment;
  } catch (error) {
    console.error("Repository: getEquipmentByCode - Prisma error:", error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const createEquipment = async (data: {
  code: string;
  libelle: string;
  image?: string;
  qrCode?: string;
  locationId: string;
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
}) => {
  try {
    console.log("Repository: createEquipment - Starting with data:", data);
    
    await prisma.$connect();
    console.log("Repository: createEquipment - Database connected");
    
    const equipmentData = {
      code: data.code.trim(),
      libelle: data.libelle.trim(),
      image: data.image?.trim() || null,
      qrCode: data.qrCode?.trim() || null,
      locationId: data.locationId,
      zone: data.zone?.trim() || null,
      reseau: data.reseau?.trim() || null,
      localisationPrecise: data.localisationPrecise?.trim() || null,
      localisationDetaillee: data.localisationDetaillee?.trim() || null,
      inclureGMAO: data.inclureGMAO ?? true,
      absentReferentiel: data.absentReferentiel ?? false,
      inventaireP3: data.inventaireP3 ?? false,
      codeBIM: data.codeBIM?.trim() || null,
      numIdentification: data.numIdentification?.trim() || null,
      quantite: data.quantite ?? 1,
      statut: data.statut?.trim() || "En service",
      etatSante: data.etatSante?.trim() || "Bon",
      equipementSensible: data.equipementSensible ?? false,
      domaineGMAO: data.domaineGMAO?.trim() || null,
      famille: data.famille?.trim() || null,
      sousFamille: data.sousFamille?.trim() || null,
      typeEquipement: data.typeEquipement?.trim() || null,
      marque: data.marque?.trim() || null,
      modele: data.modele?.trim() || null,
      reference: data.reference?.trim() || null,
      numeroSerie: data.numeroSerie?.trim() || null,
      photoUrl: data.photoUrl?.trim() || null,
      domaineDate: data.domaineDate?.trim() || null,
      dateInstallation: data.dateInstallation || null,
      dateFinGarantie: data.dateFinGarantie || null,
      frequenceMaintenance: data.frequenceMaintenance || null,
    };
    
    console.log("Repository: createEquipment - Prepared data:", equipmentData);
    
    const newEquipment = await prisma.equipment.create({
      data: equipmentData,
      include: {
        location: {
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
            }
          }
        },
        audits: true
      }
    });
    
    console.log("Repository: createEquipment - Success:", newEquipment);
    return newEquipment;
    
  } catch (error) {
    console.error("Repository: createEquipment - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('An equipment with this code already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const updateEquipment = async (id: string, data: {
  code?: string;
  libelle?: string;
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
}) => {
  try {
    console.log("Repository: updateEquipment - Starting with id:", id, "and data:", data);
    
    await prisma.$connect();
    console.log("Repository: updateEquipment - Database connected");
    
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id }
    });
    
    if (!existingEquipment) {
      throw new Error("Equipment not found");
    }
    
    const updateData: any = {};
    if (data.code !== undefined) updateData.code = data.code.trim();
    if (data.libelle !== undefined) updateData.libelle = data.libelle.trim();
    if (data.image !== undefined) updateData.image = data.image?.trim() || null;
    if (data.qrCode !== undefined) updateData.qrCode = data.qrCode?.trim() || null;
    if (data.zone !== undefined) updateData.zone = data.zone?.trim() || null;
    if (data.reseau !== undefined) updateData.reseau = data.reseau?.trim() || null;
    if (data.localisationPrecise !== undefined) updateData.localisationPrecise = data.localisationPrecise?.trim() || null;
    if (data.localisationDetaillee !== undefined) updateData.localisationDetaillee = data.localisationDetaillee?.trim() || null;
    if (data.inclureGMAO !== undefined) updateData.inclureGMAO = data.inclureGMAO;
    if (data.absentReferentiel !== undefined) updateData.absentReferentiel = data.absentReferentiel;
    if (data.inventaireP3 !== undefined) updateData.inventaireP3 = data.inventaireP3;
    if (data.codeBIM !== undefined) updateData.codeBIM = data.codeBIM?.trim() || null;
    if (data.numIdentification !== undefined) updateData.numIdentification = data.numIdentification?.trim() || null;
    if (data.quantite !== undefined) updateData.quantite = data.quantite;
    if (data.statut !== undefined) updateData.statut = data.statut?.trim() || "En service";
    if (data.etatSante !== undefined) updateData.etatSante = data.etatSante?.trim() || "Bon";
    if (data.equipementSensible !== undefined) updateData.equipementSensible = data.equipementSensible;
    if (data.domaineGMAO !== undefined) updateData.domaineGMAO = data.domaineGMAO?.trim() || null;
    if (data.famille !== undefined) updateData.famille = data.famille?.trim() || null;
    if (data.sousFamille !== undefined) updateData.sousFamille = data.sousFamille?.trim() || null;
    if (data.typeEquipement !== undefined) updateData.typeEquipement = data.typeEquipement?.trim() || null;
    if (data.marque !== undefined) updateData.marque = data.marque?.trim() || null;
    if (data.modele !== undefined) updateData.modele = data.modele?.trim() || null;
    if (data.reference !== undefined) updateData.reference = data.reference?.trim() || null;
    if (data.numeroSerie !== undefined) updateData.numeroSerie = data.numeroSerie?.trim() || null;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl?.trim() || null;
    if (data.domaineDate !== undefined) updateData.domaineDate = data.domaineDate?.trim() || null;
    if (data.dateInstallation !== undefined) updateData.dateInstallation = data.dateInstallation;
    if (data.dateFinGarantie !== undefined) updateData.dateFinGarantie = data.dateFinGarantie;
    if (data.frequenceMaintenance !== undefined) updateData.frequenceMaintenance = data.frequenceMaintenance;
    
    console.log("Repository: updateEquipment - Prepared update data:", updateData);
    
    const updatedEquipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
      include: {
        location: {
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
            }
          }
        },
        audits: {
          orderBy: { version: 'desc' }
        }
      }
    });
    
    console.log("Repository: updateEquipment - Success:", updatedEquipment);
    return updatedEquipment;
    
  } catch (error) {
    console.error("Repository: updateEquipment - Prisma error:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2002') {
      throw new Error('An equipment with this code already exists.');
    }
    
    throw new Error(`Database error: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteEquipment = async (id: string) => {
  try {
    console.log("Repository: deleteEquipment - Starting with id:", id);
    
    await prisma.$connect();
    console.log("Repository: deleteEquipment - Database connected");
    
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
      include: { audits: true }
    });
    
    if (!existingEquipment) {
      throw new Error("Equipment not found");
    }
    
    if (existingEquipment.audits.length > 0) {
      throw new Error("Cannot delete equipment with existing audits. Please delete all audits first.");
    }
    
    console.log("Repository: deleteEquipment - Equipment found, proceeding with deletion");
    
    const deletedEquipment = await prisma.equipment.delete({
      where: { id },
    });
    
    console.log("Repository: deleteEquipment - Success:", deletedEquipment);
    return deletedEquipment;
    
  } catch (error) {
    console.error("Repository: deleteEquipment - Prisma error:", error);
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

export const getEquipmentsByLevelId = async (levelId: string) => {
  try {
    const equipments = await prisma.equipment.findMany({
      where: { 
        location: {
          levelId: levelId
        }
      },
      include: {
        location: {
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
            }
          }
        },
        audits: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return equipments;
  } catch (error: any) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getEquipmentsByClientId = async (clientId: string) => {
  try {
    const equipments = await prisma.equipment.findMany({
      where: { 
        location: {
          level: {
            building: {
              site: {
                clientId: clientId
              }
            }
          }
        }
      },
      include: {
        location: {
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
            }
          }
        },
        audits: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return equipments;
  } catch (error: any) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getEquipmentsBySiteId = async (siteId: string) => {
  try {
    const equipments = await prisma.equipment.findMany({
      where: { 
        location: {
          level: {
            building: {
              siteId: siteId
            }
          }
        }
      },
      include: {
        location: {
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
            }
          }
        },
        audits: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return equipments;
  } catch (error: any) {
    throw new Error(`Database error: ${error.message}`);
  }
};

export const getEquipmentsByBuildingId = async (buildingId: string) => {
  try {
    const equipments = await prisma.equipment.findMany({
      where: { 
        location: {
          level: {
            buildingId: buildingId
          }
        }
      },
      include: {
        location: {
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
            }
          }
        },
        audits: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return equipments;
  } catch (error: any) {
    throw new Error(`Database error: ${error.message}`);
  }
};
