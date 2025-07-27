const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
};

export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  
  // Users
  users: '/users',
  
  // Clients
  clients: '/clients',
  
  // Sites
  sites: '/sites',
  
  // Buildings - MISSING ENDPOINTS ADDED
  buildings: '/buildings',
  building: (id: string) => `/buildings/${id}`,
  buildingWithLevels: (id: string) => `/buildings/${id}/detailed`, // For getting building with all levels/locals/equipment
  
  // Equipment
  equipment: '/equipment',
  
  // Audits
  audits: '/audits',
  auditPhotos: (id: string) => `/audits/${id}/photos`,
  auditOCR: '/audits/ocr',
  auditStats: '/audits/stats/overview',
  
  // Deliverables
  deliverables: '/deliverables',
  generateDeliverable: '/deliverables/generate',
  downloadDeliverable: (id: string, type: string) => `/deliverables/${id}/download/${type}`,
  
  // Settings
  settings: '/settings',
  technicalDomains: '/settings/domains/technical',
  defectTypes: '/settings/defects/types',
  
  // AI
  aiChat: '/ai/chat',
  aiEquipmentSuggest: '/ai/equipment/suggest',
  aiAuditChecklist: '/ai/audit/checklist',
  aiDataMapping: '/ai/data/mapping',
  aiMaintenanceRecommend: '/ai/maintenance/recommend',
  
  // Levels
  levels: '/levels',
  buildingLevels: (buildingId: string) => `/levels/building/${buildingId}`,
  createLevel: '/levels', // POST endpoint for creating levels
  
  // Locals
  locals: '/locals',
  levelLocals: (levelId: string) => `/locals/level/${levelId}`,
  localEquipment: (localId: string) => `/locals/${localId}/equipment`,
  createLocal: '/locals', // POST endpoint for creating locals
  addEquipmentToLocal: (localId: string) => `/locals/${localId}/equipment`, // POST endpoint
};