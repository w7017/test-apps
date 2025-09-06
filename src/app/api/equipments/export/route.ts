// src/app/api/equipments/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllEquipments } from "@/services/equipment.service";

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/equipments/export - Starting");
    
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const includeAudits = searchParams.get('includeAudits') === 'true';
    
    console.log("GET /api/equipments/export - Export params:", { format, includeAudits });
    
    // Get all equipment
    const equipments = await fetchAllEquipments();
    
    // Prepare data for export
    const exportData = equipments.map(equipment => {
      const baseData = {
        id: equipment.id,
        code: equipment.code,
        libelle: equipment.libelle,
        quantite: equipment.quantite,
        statut: equipment.statut,
        etatSante: equipment.etatSante,
        famille: equipment.famille,
        sousFamille: equipment.sousFamille,
        typeEquipement: equipment.typeEquipement,
        marque: equipment.marque,
        modele: equipment.modele,
        reference: equipment.reference,
        numeroSerie: equipment.numeroSerie,
        zone: equipment.zone,
        reseau: equipment.reseau,
        localisationPrecise: equipment.localisationPrecise,
        localisationDetaillee: equipment.localisationDetaillee,
        inclureGMAO: equipment.inclureGMAO,
        absentReferentiel: equipment.absentReferentiel,
        inventaireP3: equipment.inventaireP3,
        equipementSensible: equipment.equipementSensible,
        domaineGMAO: equipment.domaineGMAO,
        codeBIM: equipment.codeBIM,
        numIdentification: equipment.numIdentification,
        frequenceMaintenance: equipment.frequenceMaintenance,
        dateInstallation: equipment.dateInstallation,
        dateFinGarantie: equipment.dateFinGarantie,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
        // Location hierarchy
        location: {
          id: equipment.location.id,
          name: equipment.location.name,
          level: equipment.location.level.name,
          building: equipment.location.level.building.name,
          site: equipment.location.level.building.site.name,
          client: equipment.location.level.building.site.client.name
        }
      };
      
      // Include audits if requested
      if (includeAudits && equipment.audits) {
        return {
          ...baseData,
          audits: equipment.audits.map(audit => ({
            id: audit.id,
            version: audit.version,
            auditeur: audit.auditeur,
            statutGlobal: audit.statutGlobal,
            notesGlobales: audit.notesGlobales,
            date: audit.date
          }))
        };
      }
      
      return baseData;
    });
    
    console.log(`GET /api/equipments/export - Success: ${exportData.length} equipment exported`);
    
    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape CSV values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="equipments-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // Default JSON format
    return NextResponse.json({
      success: true,
      message: `Exported ${exportData.length} equipment successfully`,
      data: exportData,
      exportInfo: {
        format,
        includeAudits,
        totalCount: exportData.length,
        exportedAt: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    console.error("GET /api/equipments/export - Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to export equipment",
        code: "EXPORT_ERROR"
      },
      { status: 500 }
    );
  }
}
