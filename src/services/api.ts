import { apiConfig, endpoints } from '../config/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.token = localStorage.getItem('gmao_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: apiConfig.timeout,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('gmao_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('gmao_token');
  }

  // Auth methods
  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ user: any; token: string }>(
      endpoints.login,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request(endpoints.logout, { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // Buildings - CORRECTED METHODS
  async getBuilding(id: string) {
    try {
      // Get building with all levels, locals, and equipment in one call
      const buildingData = await this.request<any>(`/buildings/${id}`);
      
      // Get levels for this building
      const levels = await this.getBuildingLevels(id);
      
      // For each level, get locals with equipment
      const levelsWithData = await Promise.all(
        levels.map(async (level: any) => {
          try {
            // Get locals for this level
            const locals = await this.getLevelLocals(level.id);
            
            // For each local, get equipment
            const localsWithEquipment = await Promise.all(
              locals.map(async (local: any) => {
                try {
                  const equipment = await this.getLocalEquipment(local.id);
                  return { ...local, equipment };
                } catch (error) {
                  console.warn(`Failed to load equipment for local ${local.id}:`, error);
                  return { ...local, equipment: [] };
                }
              })
            );
            
            return { ...level, locals: localsWithEquipment };
          } catch (error) {
            console.warn(`Failed to load locals for level ${level.id}:`, error);
            return { ...level, locals: [] };
          }
        })
      );
      
      return { ...buildingData, levels: levelsWithData };
    } catch (error) {
      console.error('Error fetching building details:', error);
      throw error;
    }
  }

  async updateBuilding(id: string, buildingData: any) {
    return this.request<any>(`/buildings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildingData),
    });
  }

  async deleteBuilding(id: string) {
    return this.request<any>(`/buildings/${id}`, {
      method: 'DELETE',
    });
  }

  // Levels
  async getBuildingLevels(buildingId: string) {
    return this.request<any[]>(endpoints.buildingLevels(buildingId));
  }

  async getLevel(id: string) {
    return this.request<any>(`${endpoints.levels}/${id}`);
  }

  async createLevel(levelData: any) {
    return this.request<any>(endpoints.levels, {
      method: 'POST',
      body: JSON.stringify(levelData),
    });
  }

  async updateLevel(id: string, levelData: any) {
    return this.request<any>(`${endpoints.levels}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(levelData),
    });
  }

  async deleteLevel(id: string) {
    return this.request<any>(`${endpoints.levels}/${id}`, {
      method: 'DELETE',
    });
  }

  // Locals
  async getLevelLocals(levelId: string) {
    return this.request<any[]>(endpoints.levelLocals(levelId));
  }

  async getLocal(id: string) {
    return this.request<any>(`${endpoints.locals}/${id}`);
  }

  async createLocal(localData: any) {
    return this.request<any>(endpoints.locals, {
      method: 'POST',
      body: JSON.stringify(localData),
    });
  }

  async updateLocal(id: string, localData: any) {
    return this.request<any>(`${endpoints.locals}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(localData),
    });
  }

  async deleteLocal(id: string) {
    return this.request<any>(`${endpoints.locals}/${id}`, {
      method: 'DELETE',
    });
  }

  async getLocalEquipment(localId: string) {
    return this.request<any[]>(endpoints.localEquipment(localId));
  }

  async addEquipmentToLocal(localId: string, equipments: any[], buildingId: string) {
    return this.request<{ equipments: any[] }>(endpoints.localEquipment(localId), {
      method: 'POST',
      body: JSON.stringify({ equipments, building_id: buildingId }),
    });
  }

  // Clients
  async getClients(params?: { search?: string; page?: number; limit?: number }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<{ clients: any[]; pagination: any }>(
      `${endpoints.clients}${queryString ? `?${queryString}` : ''}`
    );
  }

  async getClient(id: string) {
    return this.request<any>(`${endpoints.clients}/${id}`);
  }

  async createClient(clientData: any) {
    return this.request<any>(endpoints.clients, {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: any) {
    return this.request<any>(`${endpoints.clients}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string) {
    return this.request<any>(`${endpoints.clients}/${id}`, {
      method: 'DELETE',
    });
  }

  // Sites
  async getSites(params?: { client_id?: string; search?: string; page?: number; limit?: number }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<{ sites: any[]; pagination: any }>(
      `${endpoints.sites}${queryString ? `?${queryString}` : ''}`
    );
  }

  async getSite(id: string) {
    return this.request<any>(`${endpoints.sites}/${id}`);
  }

  async createSite(siteData: any) {
    return this.request<any>(endpoints.sites, {
      method: 'POST',
      body: JSON.stringify(siteData),
    });
  }

  async getSiteBuildings(siteId: string) {
    return this.request<any[]>(`${endpoints.sites}/${siteId}/buildings`);
  }

  async addBuildingsToSite(siteId: string, buildings: any[]) {
    return this.request<{ buildings: any[] }>(`${endpoints.sites}/${siteId}/buildings`, {
      method: 'POST',
      body: JSON.stringify({ buildings }),
    });
  }

  // Equipment
  async getEquipment(params?: {
    site_id?: string;
    building_id?: string;
    domain_id?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<{ equipment: any[]; pagination: any }>(
      `${endpoints.equipment}${queryString ? `?${queryString}` : ''}`
    );
  }

  async getEquipmentById(id: string) {
    return this.request<any>(`${endpoints.equipment}/${id}`);
  }

  async createEquipment(equipmentData: any) {
    return this.request<any>(endpoints.equipment, {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    });
  }

  async updateEquipment(id: string, equipmentData: any) {
    return this.request<any>(`${endpoints.equipment}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipmentData),
    });
  }

  async duplicateEquipment(id: string, data: { new_reference: string; new_location: string }) {
    return this.request<any>(`${endpoints.equipment}/${id}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Audits
  async getAudits(params?: {
    equipment_id?: string;
    site_id?: string;
    building_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<{ audits: any[]; pagination: any }>(
      `${endpoints.audits}${queryString ? `?${queryString}` : ''}`
    );
  }

  async getAudit(id: string) {
    return this.request<any>(`${endpoints.audits}/${id}`);
  }

  async createAudit(auditData: any) {
    return this.request<any>(endpoints.audits, {
      method: 'POST',
      body: JSON.stringify(auditData),
    });
  }

  async uploadAuditPhotos(auditId: string, photos: File[], description?: string) {
    const formData = new FormData();
    photos.forEach(photo => formData.append('photos', photo));
    if (description) formData.append('description', description);

    return this.request<{ photos: any[] }>(endpoints.auditPhotos(auditId), {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async processOCR(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request<any>(endpoints.auditOCR, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getAuditStats(params?: { site_id?: string; start_date?: string; end_date?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<any>(
      `${endpoints.auditStats}${queryString ? `?${queryString}` : ''}`
    );
  }

  // Deliverables
  async getDeliverables(params?: {
    site_id?: string;
    client_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<{ deliverables: any[]; pagination: any }>(
      `${endpoints.deliverables}${queryString ? `?${queryString}` : ''}`
    );
  }

  async generateDeliverable(data: {
    site_id: string;
    period_start: string;
    period_end: string;
    title: string;
  }) {
    return this.request<any>(endpoints.generateDeliverable, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings() {
    return this.request<any>(endpoints.settings);
  }

  async updateSetting(key: string, value: string) {
    return this.request<any>(`${endpoints.settings}/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async getTechnicalDomains() {
    return this.request<any[]>(endpoints.technicalDomains);
  }

  async createTechnicalDomain(domainData: any) {
    return this.request<any>(endpoints.technicalDomains, {
      method: 'POST',
      body: JSON.stringify(domainData),
    });
  }

  // AI Services
  async chatWithAI(message: string, context?: any) {
    return this.request<{ response: string; suggestions: string[] }>(endpoints.aiChat, {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getEquipmentSuggestions(partialData: any, domain: string) {
    return this.request<{ suggestions: any[]; confidence: number }>(endpoints.aiEquipmentSuggest, {
      method: 'POST',
      body: JSON.stringify({ partial_data: partialData, domain }),
    });
  }

  async generateAuditChecklist(equipmentType: string, domain: string) {
    return this.request<{ checklist: any[] }>(endpoints.aiAuditChecklist, {
      method: 'POST',
      body: JSON.stringify({ equipment_type: equipmentType, domain }),
    });
  }

  async getDataMapping(columns: string[], sampleData: any[]) {
    return this.request<{ mapping: any[]; confidence: number; warnings: string[] }>(endpoints.aiDataMapping, {
      method: 'POST',
      body: JSON.stringify({ columns, sample_data: sampleData }),
    });
  }
}

export const apiService = new ApiService();