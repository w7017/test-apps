// src/app/api/equipments/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllEquipments } from "@/services/equipment.service";

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/equipments/stats - Starting");
    
    // Get all equipment
    const equipments = await fetchAllEquipments();
    
    // Calculate statistics
    const totalCount = equipments.length;
    
    // Status distribution
    const statusStats = equipments.reduce((acc, equipment) => {
      acc[equipment.statut] = (acc[equipment.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Health state distribution
    const healthStats = equipments.reduce((acc, equipment) => {
      acc[equipment.etatSante] = (acc[equipment.etatSante] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Family distribution
    const familyStats = equipments.reduce((acc, equipment) => {
      const family = equipment.famille || 'Non spécifié';
      acc[family] = (acc[family] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // GMAO inclusion stats
    const gmaoStats = {
      included: equipments.filter(e => e.inclureGMAO).length,
      excluded: equipments.filter(e => !e.inclureGMAO).length
    };
    
    // Sensitive equipment stats
    const sensitiveStats = {
      sensitive: equipments.filter(e => e.equipementSensible).length,
      normal: equipments.filter(e => !e.equipementSensible).length
    };
    
    // Location distribution
    const locationStats = equipments.reduce((acc, equipment) => {
      const location = equipment.location.name;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Client distribution
    const clientStats = equipments.reduce((acc, equipment) => {
      const client = equipment.location.level.building.site.client.name;
      acc[client] = (acc[client] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Maintenance frequency analysis
    const maintenanceStats = {
      withFrequency: equipments.filter(e => e.frequenceMaintenance && e.frequenceMaintenance > 0).length,
      withoutFrequency: equipments.filter(e => !e.frequenceMaintenance || e.frequenceMaintenance <= 0).length,
      averageFrequency: equipments
        .filter(e => e.frequenceMaintenance && e.frequenceMaintenance > 0)
        .reduce((sum, e) => sum + (e.frequenceMaintenance || 0), 0) / 
        equipments.filter(e => e.frequenceMaintenance && e.frequenceMaintenance > 0).length || 0
    };
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentActivity = {
      created: equipments.filter(e => new Date(e.createdAt) > thirtyDaysAgo).length,
      updated: equipments.filter(e => new Date(e.updatedAt) > thirtyDaysAgo).length
    };
    
    // Equipment with audits
    const auditStats = {
      withAudits: equipments.filter(e => e.audits && e.audits.length > 0).length,
      withoutAudits: equipments.filter(e => !e.audits || e.audits.length === 0).length,
      totalAudits: equipments.reduce((sum, e) => sum + (e.audits?.length || 0), 0)
    };
    
    const stats = {
      total: totalCount,
      status: statusStats,
      health: healthStats,
      family: familyStats,
      gmao: gmaoStats,
      sensitive: sensitiveStats,
      location: locationStats,
      client: clientStats,
      maintenance: maintenanceStats,
      recentActivity,
      audits: auditStats,
      generatedAt: new Date().toISOString()
    };
    
    console.log("GET /api/equipments/stats - Success:", {
      totalCount,
      statusCount: Object.keys(statusStats).length,
      healthCount: Object.keys(healthStats).length,
      familyCount: Object.keys(familyStats).length
    });
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error: any) {
    console.error("GET /api/equipments/stats - Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to get equipment statistics",
        code: "STATS_ERROR"
      },
      { status: 500 }
    );
  }
}
