// src/app/api/equipments/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllEquipments } from "@/services/equipment.service";

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/equipments/search - Starting");
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const statut = searchParams.get('statut') || '';
    const etatSante = searchParams.get('etatSante') || '';
    const famille = searchParams.get('famille') || '';
    const locationId = searchParams.get('locationId') || '';
    const inclureGMAO = searchParams.get('inclureGMAO');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    console.log("GET /api/equipments/search - Search params:", {
      search, statut, etatSante, famille, locationId, inclureGMAO, page, limit, sortBy, sortOrder
    });
    
    // Get all equipment first (in a real app, you'd want to implement proper database filtering)
    const allEquipments = await fetchAllEquipments();
    
    // Apply filters
    let filteredEquipments = allEquipments;
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEquipments = filteredEquipments.filter(equipment => 
        equipment.code.toLowerCase().includes(searchLower) ||
        equipment.libelle.toLowerCase().includes(searchLower) ||
        (equipment.marque && equipment.marque.toLowerCase().includes(searchLower)) ||
        (equipment.famille && equipment.famille.toLowerCase().includes(searchLower)) ||
        (equipment.typeEquipement && equipment.typeEquipement.toLowerCase().includes(searchLower))
      );
    }
    
    // Status filter
    if (statut) {
      filteredEquipments = filteredEquipments.filter(equipment => equipment.statut === statut);
    }
    
    // Health state filter
    if (etatSante) {
      filteredEquipments = filteredEquipments.filter(equipment => equipment.etatSante === etatSante);
    }
    
    // Family filter
    if (famille) {
      filteredEquipments = filteredEquipments.filter(equipment => 
        equipment.famille && equipment.famille.toLowerCase().includes(famille.toLowerCase())
      );
    }
    
    // Location filter
    if (locationId) {
      filteredEquipments = filteredEquipments.filter(equipment => equipment.locationId === locationId);
    }
    
    // GMAO filter
    if (inclureGMAO !== null) {
      const includeGMAO = inclureGMAO === 'true';
      filteredEquipments = filteredEquipments.filter(equipment => equipment.inclureGMAO === includeGMAO);
    }
    
    // Sort
    filteredEquipments.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEquipments = filteredEquipments.slice(startIndex, endIndex);
    
    const totalCount = filteredEquipments.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    console.log("GET /api/equipments/search - Success:", {
      totalCount,
      page,
      limit,
      totalPages,
      resultsCount: paginatedEquipments.length
    });
    
    return NextResponse.json({
      success: true,
      data: paginatedEquipments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        statut,
        etatSante,
        famille,
        locationId,
        inclureGMAO: inclureGMAO ? inclureGMAO === 'true' : null
      }
    });
  } catch (error: any) {
    console.error("GET /api/equipments/search - Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to search equipment",
        code: "SEARCH_ERROR"
      },
      { status: 500 }
    );
  }
}
