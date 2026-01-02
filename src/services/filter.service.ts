// src/services/filter.service.ts

export interface SiteFilters {
    estPlanifie?: boolean;
    avancement?: string[];
    codeClient?: string;
    city?: string;
    postalCode?: string;
  }
  
  export interface BuildingFilters {
    hasLevels?: boolean;
  }
  
  export interface LevelFilters {
    hasLocations?: boolean;
  }
  
  export interface LocationFilters {
    hasEquipments?: boolean;
  }
  
  export interface EquipmentFilters {
    statut?: string[];
    typeEquipement?: string;
    marque?: string;
    equipementSensible?: boolean;
  }
  
  /**
   * Apply site-specific filters to a list of sites
   */
  export function applySiteFilters(sites: any[], filters: SiteFilters): any[] {
    let filtered = [...sites];
  
    if (filters.estPlanifie !== undefined) {
      filtered = filtered.filter(site => site.estPlanifie === filters.estPlanifie);
    }
  
    if (filters.avancement && filters.avancement.length > 0) {
      filtered = filtered.filter(site => 
        filters.avancement!.includes(site.avancement)
      );
    }
  
    if (filters.codeClient) {
      const searchTerm = filters.codeClient.toLowerCase();
      filtered = filtered.filter(site =>
        site.codeClient?.toLowerCase().includes(searchTerm)
      );
    }
  
    if (filters.city) {
      const searchTerm = filters.city.toLowerCase();
      filtered = filtered.filter(site => {
        const address = site.address?.toLowerCase() || '';
        return address.includes(searchTerm);
      });
    }
  
    if (filters.postalCode) {
      filtered = filtered.filter(site => {
        const address = site.address || '';
        return address.includes(filters.postalCode!);
      });
    }
  
    return filtered;
  }
  
  /**
   * Apply building-specific filters
   */
  export function applyBuildingFilters(buildings: any[], filters: BuildingFilters): any[] {
    let filtered = [...buildings];
  
    if (filters.hasLevels !== undefined) {
      filtered = filtered.filter(building => {
        const hasLevels = (building.levels?.length || 0) > 0;
        return filters.hasLevels ? hasLevels : !hasLevels;
      });
    }
  
    return filtered;
  }
  
  /**
   * Apply level-specific filters
   */
  export function applyLevelFilters(levels: any[], filters: LevelFilters): any[] {
    let filtered = [...levels];
  
    if (filters.hasLocations !== undefined) {
      filtered = filtered.filter(level => {
        const hasLocations = (level.locations?.length || 0) > 0;
        return filters.hasLocations ? hasLocations : !hasLocations;
      });
    }
  
    return filtered;
  }
  
  /**
   * Apply location-specific filters
   */
  export function applyLocationFilters(locations: any[], filters: LocationFilters): any[] {
    let filtered = [...locations];
  
    if (filters.hasEquipments !== undefined) {
      filtered = filtered.filter(location => {
        const hasEquipments = (location.equipments?.length || 0) > 0;
        return filters.hasEquipments ? hasEquipments : !hasEquipments;
      });
    }
  
    return filtered;
  }
  
  /**
   * Apply equipment-specific filters
   */
  export function applyEquipmentFilters(equipments: any[], filters: EquipmentFilters): any[] {
    let filtered = [...equipments];
  
    if (filters.statut && filters.statut.length > 0) {
      filtered = filtered.filter(equipment =>
        filters.statut!.includes(equipment.statut)
      );
    }
  
    if (filters.typeEquipement) {
      const searchTerm = filters.typeEquipement.toLowerCase();
      filtered = filtered.filter(equipment =>
        equipment.typeEquipement?.toLowerCase().includes(searchTerm)
      );
    }
  
    if (filters.marque) {
      const searchTerm = filters.marque.toLowerCase();
      filtered = filtered.filter(equipment =>
        equipment.marque?.toLowerCase().includes(searchTerm)
      );
    }
  
    if (filters.equipementSensible !== undefined) {
      filtered = filtered.filter(equipment =>
        equipment.equipementSensible === filters.equipementSensible
      );
    }
  
    return filtered;
  }
  
  /**
   * Build query string from filter object
   */
  export function buildFilterQueryString(filters: Record<string, any>): string {
    const params = new URLSearchParams();
  
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (value !== '' && value !== null && value !== undefined) {
        params.set(key, String(value));
      }
    });
  
    return params.toString();
  }