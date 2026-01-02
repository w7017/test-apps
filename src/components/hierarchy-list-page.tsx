'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FilterPanel, 
  SITE_FILTER_CONFIG, 
  BUILDING_FILTER_CONFIG, 
  LEVEL_FILTER_CONFIG, 
  LOCATION_FILTER_CONFIG, 
  EQUIPMENT_FILTER_CONFIG 
} from '@/components/filter-panel';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  Edit,
  Trash2,
  Building,
  Layers,
  DoorOpen,
  Server,
  Home,
  Search,
  Eye,
  Loader2,
  MapPin,
  Download,
  Filter,
  X,
} from 'lucide-react';

const HIERARCHY_CONFIG = {
  sites: {
    title: 'Sites',
    singular: 'Site',
    icon: Home,
    apiEndpoint: '/api/sites',
    columns: ['Image', 'Nom', 'Adresse', 'Code Postal', 'Ville', 'État', 'Code Client', 'Code Affaire', 'Code Contrat', 'Arborescence', 'Actions'],
    filters: [],
  },
  batiments: {
    title: 'Bâtiments',
    singular: 'Bâtiment',
    icon: Building,
    apiEndpoint: '/api/buildings',
    columns: ['Image', 'Nom', 'Type', 'Site', 'Sous-niveaux', 'Actions'],
    filters: ['site'],
  },
  niveaux: {
    title: 'Niveaux',
    singular: 'Niveau',
    icon: Layers,
    apiEndpoint: '/api/levels',
    columns: ['Nom', 'Bâtiment', 'Site', 'Sous-niveaux', 'Actions'],
    filters: ['site', 'building'],
  },
  locaux: {
    title: 'Locaux',
    singular: 'Local',
    icon: DoorOpen,
    apiEndpoint: '/api/locations',
    columns: ['Image', 'Nom', 'Niveau', 'Bâtiment', 'Site', 'Sous-niveaux', 'Actions'],
    filters: ['site', 'building', 'level'],
  },
  equipements: {
    title: 'Équipements',
    singular: 'Équipement',
    icon: Server,
    apiEndpoint: '/api/equipments',
    columns: ['Image', 'Code', 'Libellé', 'Type', 'Marque', 'Statut', 'GMAO', 'Local', 'Actions'],
    filters: ['site', 'building', 'level', 'location'],
  },
};

const extractCityAndPostalCode = (address: string) => {
  if (!address) return { city: '', postalCode: '' };
  
  const postalCodeMatch = address.match(/\b(\d{5})\b/);
  const postalCode = postalCodeMatch ? postalCodeMatch[1] : '';
  
  let city = '';
  if (postalCode) {
    const parts = address.split(postalCode);
    city = parts[1]?.trim().split(',')[0] || '';
  } else {
    const parts = address.split(',');
    city = parts[parts.length - 1]?.trim() || '';
  }
  
  return { city, postalCode };
};

const getStatusInfo = (item: any) => {
  if (!item.estPlanifie) {
    return {
      label: 'Non planifié',
      bandColor: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    };
  }
  
  switch (item.avancement) {
    case 'commence':
      return {
        label: 'Commencé',
        bandColor: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
      };
    case 'en_cours':
      return {
        label: 'En cours',
        bandColor: 'bg-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
      };
    case 'termine':
      return {
        label: 'Terminé',
        bandColor: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
      };
    default:
      return {
        label: 'Non planifié',
        bandColor: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
      };
  }
};

const getAvancementColor = (avancement: string) => {
  switch (avancement) {
    case 'non_commence':
      return 'bg-gray-400';
    case 'commence':
      return 'bg-blue-400';
    case 'en_cours':
      return 'bg-yellow-400';
    case 'termine':
      return 'bg-green-400';
    default:
      return 'bg-gray-300';
  }
};

const getAvancementLabel = (avancement: string) => {
  switch (avancement) {
    case 'non_commence':
      return 'Non commencé';
    case 'commence':
      return 'Commencé';
    case 'en_cours':
      return 'En cours';
    case 'termine':
      return 'Terminé';
    default:
      return avancement;
  }
};

function SiteFormDialog({ site, onSave, trigger, selectedClient }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    codeClient: '',
    codeAffaire: '',
    codeContrat: '',
    image: '',
    estPlanifie: false,
    avancement: 'non_commence',
  });
  const [error, setError] = useState('');
  const isEditing = !!site;

  useEffect(() => {
    if (isOpen && site) {
      setFormData({
        name: site.name || '',
        address: site.address || '',
        codeClient: site.codeClient || '',
        codeAffaire: site.codeAffaire || '',
        codeContrat: site.codeContrat || '',
        image: site.image || '',
        estPlanifie: site.estPlanifie || false,
        avancement: site.avancement || 'non_commence',
      });
    } else if (isOpen && !site) {
      setFormData({
        name: '',
        address: '',
        codeClient: '',
        codeAffaire: '',
        codeContrat: '',
        image: '',
        estPlanifie: false,
        avancement: 'non_commence',
      });
    }
  }, [site, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        clientId: selectedClient?.id,
      };

      let response;
      if (isEditing) {
        response = await fetch(`/api/sites/${site.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save site');
      }

      const savedSite = await response.json();
      onSave(savedSite);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving site:', error);
      setError(error?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditing ? 'Modifier' : 'Ajouter'} un Site
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nom du site *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ex: Site de Production Alpha"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="123 Rue de la Production, 75001 Paris"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Code Client</label>
                  <input
                    type="text"
                    value={formData.codeClient}
                    onChange={(e) => setFormData({ ...formData, codeClient: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="CLI-001"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Code Affaire</label>
                  <input
                    type="text"
                    value={formData.codeAffaire}
                    onChange={(e) => setFormData({ ...formData, codeAffaire: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="AFF-2024-001"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Code Contrat</label>
                <input
                  type="text"
                  value={formData.codeContrat}
                  onChange={(e) => setFormData({ ...formData, codeContrat: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="CTR-2024-001"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-purple-100 rounded-lg">
                    📋
                  </span>
                  Planification
                </h3>

                {/* Site Planifié */}
                <div className="mb-4">
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all bg-gradient-to-r hover:from-purple-50 hover:to-blue-50">
                    <input
                      type="checkbox"
                      checked={formData.estPlanifie}
                      onChange={(e) => setFormData({ ...formData, estPlanifie: e.target.checked })}
                      disabled={isLoading}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 block">Site planifié</span>
                      <span className="text-xs text-gray-600">Ce site a été planifié et validé</span>
                    </div>
                  </label>
                </div>

                {/* Avancement */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Statut d'avancement
                  </label>
                  <select
                    value={formData.avancement}
                    onChange={(e) => setFormData({ ...formData, avancement: e.target.value })}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="non_commence">🔴 Non commencé</option>
                    <option value="commence">🔵 Commencé</option>
                    <option value="en_cours">🟡 En cours</option>
                    <option value="termine">🟢 Terminé</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Indique l'état d'avancement du projet sur ce site
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BuildingFormDialog({ building, onSave, trigger, selectedSite }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    image: '',
  });
  const [error, setError] = useState('');
  const isEditing = !!building;

  useEffect(() => {
    if (isOpen && building) {
      setFormData({
        name: building.name || '',
        type: building.type || '',
        image: building.image || '',
      });
    } else if (isOpen && !building) {
      setFormData({
        name: '',
        type: '',
        image: '',
      });
    }
  }, [building, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        siteId: selectedSite?.id,
      };

      let response;
      if (isEditing) {
        response = await fetch(`/api/buildings/${building.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/buildings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save building');
      }

      const savedBuilding = await response.json();
      onSave(savedBuilding);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving building:', error);
      setError(error?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Modifier' : 'Ajouter'} un Bâtiment
              </h2>
              {formData.image && (
                <div className="ml-4">
                  <Image
                    src={formData.image}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="rounded-xl object-cover shadow-md"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nom du bâtiment *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ex: Bâtiment Principal"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Type de bâtiment</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                >
                  <option value="">Sélectionner un type</option>
                  <option value="Bureau">Bureau</option>
                  <option value="Production">Production</option>
                  <option value="Entrepôt">Entrepôt</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Résidentiel">Résidentiel</option>
                  <option value="Industriel">Industriel</option>
                  <option value="Mixte">Mixte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LevelFormDialog({ level, onSave, trigger, selectedBuilding }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
  });
  const [error, setError] = useState('');
  const isEditing = !!level;

  useEffect(() => {
    if (isOpen && level) {
      setFormData({
        name: level.name || '',
        image: level.image || '',
      });
    } else if (isOpen && !level) {
      setFormData({
        name: '',
        image: '',
      });
    }
  }, [level, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        buildingId: selectedBuilding?.id,
      };

      let response;
      if (isEditing) {
        response = await fetch(`/api/levels/${level.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/levels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save level');
      }

      const savedLevel = await response.json();
      onSave(savedLevel);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving level:', error);
      setError(error?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditing ? 'Modifier' : 'Ajouter'} un Niveau
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nom du niveau *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ex: Rez-de-chaussée"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LocationFormDialog({ location, onSave, trigger, selectedLevel }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
  });
  const [error, setError] = useState('');
  const isEditing = !!location;

  useEffect(() => {
    if (isOpen && location) {
      setFormData({
        name: location.name || '',
        image: location.image || '',
      });
    } else if (isOpen && !location) {
      setFormData({
        name: '',
        image: '',
      });
    }
  }, [location, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        levelId: selectedLevel?.id,
      };

      let response;
      if (isEditing) {
        response = await fetch(`/api/locations/${location.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save location');
      }

      const savedLocation = await response.json();
      onSave(savedLocation);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving location:', error);
      setError(error?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditing ? 'Modifier' : 'Ajouter'} un Local
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nom du local *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Ex: Atelier A"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EquipmentFormDialog({ equipment, onSave, trigger, selectedLocation }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    typeEquipement: '',
    marque: '',
    statut: 'En service',
    gmao: false,
    image: '',
  });
  const [error, setError] = useState('');
  const isEditing = !!equipment;

  useEffect(() => {
    if (isOpen && equipment) {
      setFormData({
        code: equipment.code || '',
        libelle: equipment.libelle || '',
        typeEquipement: equipment.typeEquipement || '',
        marque: equipment.marque || '',
        statut: equipment.statut || 'En service',
        gmao: equipment.gmao || false,
        image: equipment.image || equipment.photoUrl || '',
      });
    } else if (isOpen && !equipment) {
      setFormData({
        code: '',
        libelle: '',
        typeEquipement: '',
        marque: '',
        statut: 'En service',
        gmao: false,
        image: '',
      });
    }
  }, [equipment, isOpen]);

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.libelle.trim()) {
      setError('Le code et le libellé sont requis.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        locationId: selectedLocation?.id,
        photoUrl: formData.image,
      };

      let response;
      if (isEditing) {
        response = await fetch(`/api/equipments/${equipment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/equipments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save equipment');
      }

      const savedEquipment = await response.json();
      onSave(savedEquipment);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      setError(error?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditing ? 'Modifier' : 'Ajouter'} un Équipement
            </h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="EQ-001"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Libellé *</label>
                  <input
                    type="text"
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ex: Climatiseur Central"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Type d'équipement</label>
                  <input
                    type="text"
                    value={formData.typeEquipement}
                    onChange={(e) => setFormData({ ...formData, typeEquipement: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ex: HVAC"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Marque</label>
                  <input
                    type="text"
                    value={formData.marque}
                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ex: Daikin"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                >
                  <option value="En service">En service</option>
                  <option value="Alerte">Alerte</option>
                  <option value="Hors service">Hors service</option>
                  <option value="En veille">En veille</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DeleteConfirmDialog({ item, itemType, onDelete, trigger }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await onDelete(item.id);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error deleting item:', error);
      setError(error.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
      }}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Confirmer la suppression</h2>
            
            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer "<span className="font-semibold">{item?.name || item?.libelle}</span>" ?
              <span className="block mt-3 font-medium text-red-600">Cette action est irréversible.</span>
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function HierarchyListPage({ 
  listType, 
  selectedClient,
  filters = {}
}: any) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [sites, setSites] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [levels, setLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [activeFilters, setActiveFilters] = useState({
    siteId: filters.siteId || '',
    buildingId: filters.buildingId || '',
    levelId: filters.levelId || '',
    locationId: filters.locationId || '',
  });

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  const getFilterConfig = () => {
    switch (listType) {
      case 'sites':
        return SITE_FILTER_CONFIG;
      case 'batiments':
        return BUILDING_FILTER_CONFIG;
      case 'niveaux':
        return LEVEL_FILTER_CONFIG;
      case 'locaux':
        return LOCATION_FILTER_CONFIG;
      case 'equipements':
        return EQUIPMENT_FILTER_CONFIG;
      default:
        return [];
    }
  };

  const config = HIERARCHY_CONFIG[listType];
  const IconComponent = config?.icon || Home;

  const selectedSite = useMemo(() => 
    sites.find((s: any) => s.id === activeFilters.siteId), 
    [sites, activeFilters.siteId]
  );
  
  const selectedBuilding = useMemo(() => 
    buildings.find((b: any) => b.id === activeFilters.buildingId), 
    [buildings, activeFilters.buildingId]
  );
  
  const selectedLevel = useMemo(() => 
    levels.find((l: any) => l.id === activeFilters.levelId), 
    [levels, activeFilters.levelId]
  );
  
  const selectedLocation = useMemo(() => 
    locations.find((loc: any) => loc.id === activeFilters.locationId), 
    [locations, activeFilters.locationId]
  );

  useEffect(() => {
    if (selectedClient) {
      fetchFilterOptions();
    }
  }, [selectedClient, activeFilters.siteId, activeFilters.buildingId, activeFilters.levelId]);

  useEffect(() => {
    if (selectedClient) {
      fetchItems();
    }
  }, [selectedClient, listType, activeFilters, advancedFilters]);

  const handleApplyFilters = (filters: Record<string, any>) => {
    setAdvancedFilters(filters);
  };
  
  const handleResetFilters = () => {
    setAdvancedFilters({});
  };
  
  const getActiveAdvancedFilterCount = () => {
    return Object.entries(advancedFilters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  const fetchFilterOptions = async () => {
    try {
      if (config.filters.includes('site')) {
        const sitesRes = await fetch(`/api/sites/client/${selectedClient.id}`);
        if (sitesRes.ok) {
          const sitesData = await sitesRes.json();
          setSites(sitesData);
        }
      }

      if (config.filters.includes('building')) {
        let buildingsEndpoint = `/api/buildings/client/${selectedClient.id}`;
        if (activeFilters.siteId) {
          buildingsEndpoint = `/api/buildings/site/${activeFilters.siteId}`;
        }
        const buildingsRes = await fetch(buildingsEndpoint);
        if (buildingsRes.ok) {
          const buildingsData = await buildingsRes.json();
          setBuildings(buildingsData);
        }
      }

      if (config.filters.includes('level')) {
        let levelsEndpoint = `/api/levels/client/${selectedClient.id}`;
        if (activeFilters.buildingId) {
          levelsEndpoint = `/api/levels/building/${activeFilters.buildingId}`;
        }
        const levelsRes = await fetch(levelsEndpoint);
        if (levelsRes.ok) {
          const levelsData = await levelsRes.json();
          setLevels(levelsData);
        }
      }

      if (config.filters.includes('location')) {
        let locationsEndpoint = `/api/locations/client/${selectedClient.id}`;
        if (activeFilters.levelId) {
          locationsEndpoint = `/api/locations/level/${activeFilters.levelId}`;
        }
        const locationsRes = await fetch(locationsEndpoint);
        if (locationsRes.ok) {
          const locationsData = await locationsRes.json();
          setLocations(locationsData);
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchItems = async () => {
    if (!selectedClient) return;
    
    setLoading(true);
    try {
      let endpoint = `${config.apiEndpoint}/client/${selectedClient.id}`;
      
      if (activeFilters.locationId) {
        endpoint = `${config.apiEndpoint}/location/${activeFilters.locationId}`;
      } else if (activeFilters.levelId) {
        endpoint = `${config.apiEndpoint}/level/${activeFilters.levelId}`;
      } else if (activeFilters.buildingId) {
        endpoint = `${config.apiEndpoint}/building/${activeFilters.buildingId}`;
      } else if (activeFilters.siteId) {
        endpoint = `${config.apiEndpoint}/site/${activeFilters.siteId}`;
      }
      
      // Add advanced filter query parameters
      const queryParams = new URLSearchParams();
      Object.entries(advancedFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else if (value !== '' && value !== null && value !== undefined) {
          queryParams.set(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch items');
      
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...activeFilters };
    
    if (filterType === 'siteId') {
      newFilters.siteId = value;
      newFilters.buildingId = '';
      newFilters.levelId = '';
      newFilters.locationId = '';
    } else if (filterType === 'buildingId') {
      newFilters.buildingId = value;
      newFilters.levelId = '';
      newFilters.locationId = '';
    } else if (filterType === 'levelId') {
      newFilters.levelId = value;
      newFilters.locationId = '';
    } else if (filterType === 'locationId') {
      newFilters.locationId = value;
    }
    
    setActiveFilters(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({
      siteId: '',
      buildingId: '',
      levelId: '',
      locationId: '',
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(v => v).length;
  };

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = 
        (item.name?.toLowerCase() || '').includes(searchLower) ||
        (item.libelle?.toLowerCase() || '').includes(searchLower) ||
        (item.code?.toLowerCase() || '').includes(searchLower) ||
        (item.codeClient?.toLowerCase() || '').includes(searchLower) ||
        (item.codeAffaire?.toLowerCase() || '').includes(searchLower);
      
      const statusMatch = statusFilter === 'all' || item.statut === statusFilter;
      
      return searchMatch && statusMatch;
    });
  }, [items, searchTerm, statusFilter]);

  const handleDelete = async (itemId: any) => {
    const response = await fetch(`${config.apiEndpoint}/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete');
    }
    
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSave = (savedItem: any) => {
    const existingIndex = items.findIndex(item => item.id === savedItem.id);
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex] = savedItem;
      setItems(updatedItems);
    } else {
      setItems([...items, savedItem]);
    }
  };

  const exportToCSV = () => {
    const headers = config.columns.filter((col: any) => col !== 'Image' && col !== 'Actions').join(',');
    const rows = filteredItems.map(item => {
      if (listType === 'sites') {
        return `${item.name},"${item.address || ''}","${item.codeClient || ''}","${item.codeAffaire || ''}","${item.codeContrat || ''}",${item.buildings?.length || 0}`;
      }
      return item.name;
    });
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!selectedClient) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-600 text-lg">
            Veuillez sélectionner un client pour voir la liste des {config?.title?.toLowerCase()}.
          </p>
        </div>
      </div>
    );
  }

  const activeFilterCount = getActiveFilterCount();
  
  const canAddBuilding = listType === 'batiments' && selectedSite;
  const canAddLevel = listType === 'niveaux' && selectedBuilding;
  const canAddLocation = listType === 'locaux' && selectedLevel;
  const canAddEquipment = listType === 'equipements' && selectedLocation;

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-purple-50/30 to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <IconComponent className="h-7 w-7 text-white" />
            </div>
            {config.title}
          </h2>
          <p className="text-gray-600 mt-2 text-base">
            Liste des {config.title.toLowerCase()} pour <span className="font-semibold text-purple-600">{selectedClient.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-5 py-3 border-2 border-purple-200 rounded-xl hover:bg-purple-50 flex items-center gap-2 font-medium transition-all hover:shadow-md"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
          
          {listType === 'sites' && (
            <SiteFormDialog
              site={null}
              onSave={handleSave}
              selectedClient={selectedClient}
              trigger={
                <button className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-xl">
                  <PlusCircle className="h-5 w-5" />
                  Ajouter un Site
                </button>
              }
            />
          )}
          
          {listType === 'batiments' && (
            canAddBuilding ? (
              <BuildingFormDialog
                building={null}
                onSave={handleSave}
                selectedSite={selectedSite}
                trigger={
                  <button className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-xl">
                    <PlusCircle className="h-5 w-5" />
                    Ajouter un Bâtiment
                  </button>
                }
              />
            ) : (
              <button 
                disabled
                className="px-5 py-3 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed flex items-center gap-2 font-medium"
                title="Sélectionnez un site pour ajouter un bâtiment"
              >
                <PlusCircle className="h-5 w-5" />
                Ajouter un Bâtiment
              </button>
            )
          )}
          
          {listType === 'niveaux' && (
            canAddLevel ? (
              <LevelFormDialog
                level={null}
                onSave={handleSave}
                selectedBuilding={selectedBuilding}
                trigger={
                  <button className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-xl">
                    <PlusCircle className="h-5 w-5" />
                    Ajouter un Niveau
                  </button>
                }
              />
            ) : (
              <button 
                disabled
                className="px-5 py-3 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed flex items-center gap-2 font-medium"
                title="Sélectionnez un bâtiment pour ajouter un niveau"
              >
                <PlusCircle className="h-5 w-5" />
                Ajouter un Niveau
              </button>
            )
          )}
          
          {listType === 'locaux' && (
            canAddLocation ? (
              <LocationFormDialog
                location={null}
                onSave={handleSave}
                selectedLevel={selectedLevel}
                trigger={
                  <button className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-xl">
                    <PlusCircle className="h-5 w-5" />
                    Ajouter un Local
                  </button>
                }
              />
            ) : (
              <button 
                disabled
                className="px-5 py-3 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed flex items-center gap-2 font-medium"
                title="Sélectionnez un niveau pour ajouter un local"
              >
                <PlusCircle className="h-5 w-5" />
                Ajouter un Local
              </button>
            )
          )}
          
          {listType === 'equipements' && (
            canAddEquipment ? (
              <EquipmentFormDialog
                equipment={null}
                onSave={handleSave}
                selectedLocation={selectedLocation}
                trigger={
                  <button className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-xl">
                    <PlusCircle className="h-5 w-5" />
                    Ajouter un Équipement
                  </button>
                }
              />
            ) : (
              <button 
                disabled
                className="px-5 py-3 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed flex items-center gap-2 font-medium"
                title="Sélectionnez un local pour ajouter un équipement"
              >
                <PlusCircle className="h-5 w-5" />
                Ajouter un Équipement
              </button>
            )
          )}
        </div>
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          filterConfigs={getFilterConfig()}
          currentFilters={advancedFilters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />

        {getActiveAdvancedFilterCount() > 0 && (
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-purple-800">
                  Filtres actifs:
                </span>
                {Object.entries(advancedFilters).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  let displayValue = value;
                  if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  } else if (typeof value === 'boolean') {
                    displayValue = value ? 'Oui' : 'Non';
                  }
                  
                  const config = getFilterConfig().find(c => c.id === key);
                  const label = config?.label || key;
                  
                  return (
                    <span
                      key={key}
                      className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-purple-700 border border-purple-200"
                    >
                      {label}: <span className="font-bold">{displayValue}</span>
                    </span>
                  );
                })}
              </div>
              <button
                onClick={handleResetFilters}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium"
              >
                <X className="h-4 w-4" />
                Tout effacer
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
        <div className=' flex flex-row justify-between'>
          <h3 className="text-xl font-bold text-gray-800 mb-6">Statistiques</h3>
          {listType === 'sites' && (
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="p-2.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all hover:shadow-md relative"
                title="Filtres avancés"
              >
                <Filter className="h-5 w-5 text-purple-600" />
                {getActiveAdvancedFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {getActiveAdvancedFilterCount()}
                  </span>
                )}
              </button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-purple-700">{filteredItems.length}</p>
              </div>
              <IconComponent className="h-12 w-12 text-purple-400" />
            </div>
          </div>
          
          {listType === 'equipements' && (
            <>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-1">En service</p>
                    <p className="text-3xl font-bold text-green-700">
                      {filteredItems.filter((item: any) => item.statut === 'En service').length}
                    </p>
                  </div>
                  <Server className="h-12 w-12 text-green-400" />
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-600 mb-1">Hors service</p>
                    <p className="text-3xl font-bold text-red-700">
                      {filteredItems.filter((item: any) => item.statut === 'Hors service').length}
                    </p>
                  </div>
                  <Server className="h-12 w-12 text-red-400" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hierarchical Filters */}
      {config.filters.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-bold text-gray-800 text-lg">Filtres hiérarchiques</span>
              {activeFilterCount > 0 && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium"
                >
                  <X className="h-4 w-4" />
                  Réinitialiser
                </button>
              )}
              {/* Advanced Filters Icon Button */}
              <button
                onClick={() => setIsFilterPanelOpen(true)}
                className="p-2.5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all hover:shadow-md relative"
                title="Filtres avancés"
              >
                <Filter className="h-5 w-5 text-purple-600" />
                {getActiveAdvancedFilterCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {getActiveAdvancedFilterCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {config.filters.includes('site') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site
                </label>
                <select
                  value={activeFilters.siteId}
                  onChange={(e) => handleFilterChange('siteId', e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Tous les sites</option>
                  {sites.map((site: any) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {config.filters.includes('building') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bâtiment
                </label>
                <select
                  value={activeFilters.buildingId}
                  onChange={(e) => handleFilterChange('buildingId', e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={!activeFilters.siteId && buildings.length === 0}
                >
                  <option value="">Tous les bâtiments</option>
                  {buildings.map((building: any) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {config.filters.includes('level') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={activeFilters.levelId}
                  onChange={(e) => handleFilterChange('levelId', e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={!activeFilters.buildingId && levels.length === 0}
                >
                  <option value="">Tous les niveaux</option>
                  {levels.map((level: any) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {config.filters.includes('location') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Local
                </label>
                <select
                  value={activeFilters.locationId}
                  onChange={(e) => handleFilterChange('locationId', e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  disabled={!activeFilters.levelId && locations.length === 0}
                >
                  <option value="">Tous les locaux</option>
                  {locations.map((location: any) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder={`Rechercher des ${config.title.toLowerCase()}...`}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {listType === 'equipements' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
              >
                <option value="all">Tous les statuts</option>
                <option value="En service">En service</option>
                <option value="Alerte">Alerte</option>
                <option value="Hors service">Hors service</option>
                <option value="En veille">En veille</option>
              </select>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="border border-gray-100 rounded-2xl overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <tr>
                    {config.columns.map((col, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-4 text-left text-sm font-bold text-gray-700 whitespace-nowrap ${
                          col === 'Actions' ? 'text-right' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                      {listType === 'sites' && (() => {
                        const status = getStatusInfo(item);
                        const { city, postalCode } = extractCityAndPostalCode(item.address || '');
                        
                        return (
                          <>
                            {/* Image */}
                            <td className="px-4 py-4">
                              <Image
                                src={item.image || 'https://placehold.co/60x60'}
                                alt={item.name}
                                width={60}
                                height={60}
                                className="rounded-xl object-cover shadow-md"
                              />
                            </td>
                            
                            {/* Nom */}
                            <td className="px-4 py-4">
                              <span className="font-bold text-gray-800 whitespace-nowrap">{item.name}</span>
                            </td>
                            
                            {/* Adresse */}
                            <td className="px-4 py-4">
                              <span className="text-sm text-gray-600">{item.address || '-'}</span>
                            </td>
                            
                            {/* Code Postal */}
                            <td className="px-4 py-4">
                              <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                                {postalCode || '-'}
                              </span>
                            </td>
                            
                            {/* Ville */}
                            <td className="px-4 py-4">
                              <span className="text-sm text-gray-700 whitespace-nowrap">{city || '-'}</span>
                            </td>
                            
                            {/* État with colored band */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-1 h-8 rounded-full ${status.bandColor}`}></div>
                                <span className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${status.bgColor} ${status.textColor} whitespace-nowrap`}>
                                  {status.label}
                                </span>
                              </div>
                            </td>
                            
                            {/* Code Client */}
                            <td className="px-4 py-4">
                              <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                                {item.codeClient || '-'}
                              </span>
                            </td>
                            
                            {/* Code Affaire */}
                            <td className="px-4 py-4">
                              <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                                {item.codeAffaire || '-'}
                              </span>
                            </td>
                            
                            {/* Code Contrat */}
                            <td className="px-4 py-4">
                              <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
                                {item.codeContrat || '-'}
                              </span>
                            </td>
                            
                            {/* Arborescence */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <Link href={`/parc/arborescence/batiments?siteId=${item.id}`}>
                                  <div className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow">
                                    <Building className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-700">
                                      {item.buildings?.length || 0}
                                    </span>
                                  </div>
                                </Link>
                                
                                <Link href={`/parc/arborescence/niveaux?siteId=${item.id}`}>
                                  <div className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow">
                                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                                    <span className="text-xs font-semibold text-purple-700">
                                      {item.buildings?.reduce((sum: number, b: any) => sum + (b.levels?.length || 0), 0) || 0}
                                    </span>
                                  </div>
                                </Link>
                                
                                <Link href={`/parc/arborescence/locaux?siteId=${item.id}`}>
                                  <div className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow">
                                    <DoorOpen className="w-3.5 h-3.5 text-green-600" />
                                    <span className="text-xs font-semibold text-green-700">
                                      {item.buildings?.reduce((sum: number, b: any) => sum + (b.levels?.reduce((s: number, l: any) => s + (l.locations?.length || 0), 0) || 0), 0) || 0}
                                    </span>
                                  </div>
                                </Link>
                                
                                <Link href={`/parc/arborescence/equipements?siteId=${item.id}`}>
                                  <div className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow">
                                    <Server className="w-3.5 h-3.5 text-orange-600" />
                                    <span className="text-xs font-semibold text-orange-700">
                                      {item.buildings?.reduce((sum: number, b: any) => sum + (b.levels?.reduce((s: number, l: any) => s + (l.locations?.reduce((ss: number, loc: any) => ss + (loc.equipments?.length || 0), 0) || 0), 0) || 0), 0) || 0}
                                    </span>
                                  </div>
                                </Link>
                              </div>
                            </td>
                            
                            {/* Actions */}
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/parc/arborescence/${item.id}`}>
                                  <button className="p-2.5 hover:bg-purple-50 rounded-xl transition-colors" title="Consulter">
                                    <Eye className="w-4 h-4 text-purple-600" />
                                  </button>
                                </Link>
                                <SiteFormDialog
                                  site={item}
                                  onSave={handleSave}
                                  selectedClient={selectedClient}
                                  trigger={
                                    <button className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors" title="Modifier">
                                      <Edit className="w-4 h-4 text-blue-600" />
                                    </button>
                                  }
                                />
                                <DeleteConfirmDialog
                                  item={item}
                                  itemType={config.singular}
                                  onDelete={handleDelete}
                                  trigger={
                                    <button className="p-2.5 hover:bg-red-50 rounded-xl transition-colors" title="Supprimer">
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  }
                                />
                              </div>
                            </td>
                          </>
                        );
                      })()}
                      {listType === 'batiments' && (
                        <>
                          <td className="px-4 py-4">
                            <Image
                              src={item.image || 'https://placehold.co/60x60'}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded-xl object-cover shadow-md"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-gray-800">{item.name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.type || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.site?.name || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/parc/arborescence/niveaux?buildingId=${item.id}`}>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all cursor-pointer">
                                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                                  <span className="text-xs font-semibold text-purple-700">
                                    {item.levels?.length || 0}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <BuildingFormDialog
                                building={item}
                                onSave={handleSave}
                                selectedSite={item.site}
                                trigger={
                                  <button className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors">
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </button>
                                }
                              />
                              <DeleteConfirmDialog
                                item={item}
                                itemType={config.singular}
                                onDelete={handleDelete}
                                trigger={
                                  <button className="p-2.5 hover:bg-red-50 rounded-xl transition-colors">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                }
                              />
                            </div>
                          </td>
                        </>
                      )}

                      {listType === 'niveaux' && (
                        <>
                          <td className="px-4 py-4">
                            <span className="font-bold text-gray-800">{item.name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.building?.name || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.building?.site?.name || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/parc/arborescence/locaux?levelId=${item.id}`}>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg transition-all cursor-pointer">
                                  <DoorOpen className="w-3.5 h-3.5 text-green-600" />
                                  <span className="text-xs font-semibold text-green-700">
                                    {item.locations?.length || 0}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <LevelFormDialog
                                level={item}
                                onSave={handleSave}
                                selectedBuilding={item.building}
                                trigger={
                                  <button className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors">
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </button>
                                }
                              />
                              <DeleteConfirmDialog
                                item={item}
                                itemType={config.singular}
                                onDelete={handleDelete}
                                trigger={
                                  <button className="p-2.5 hover:bg-red-50 rounded-xl transition-colors">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                }
                              />
                            </div>
                          </td>
                        </>
                      )}

                      {listType === 'locaux' && (
                        <>
                          <td className="px-4 py-4">
                            <Image
                              src={item.image || 'https://placehold.co/60x60'}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded-xl object-cover shadow-md"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-gray-800">{item.name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.level?.name || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.level?.building?.name || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.level?.building?.site?.name || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/parc/arborescence/equipements?locationId=${item.id}`}>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all cursor-pointer">
                                  <Server className="w-3.5 h-3.5 text-orange-600" />
                                  <span className="text-xs font-semibold text-orange-700">
                                    {item.equipments?.length || 0}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <LocationFormDialog
                                location={item}
                                onSave={handleSave}
                                selectedLevel={item.level}
                                trigger={
                                  <button className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors">
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </button>
                                }
                              />
                              <DeleteConfirmDialog
                                item={item}
                                itemType={config.singular}
                                onDelete={handleDelete}
                                trigger={
                                  <button className="p-2.5 hover:bg-red-50 rounded-xl transition-colors">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                }
                              />
                            </div>
                          </td>
                        </>
                      )}

                      {listType === 'equipements' && (
                        <>
                          <td className="px-4 py-4">
                            <Image
                              src={item.photoUrl || item.image || 'https://placehold.co/60x60'}
                              alt={item.libelle}
                              width={60}
                              height={60}
                              className="rounded-xl object-cover shadow-md"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm font-bold text-gray-800">{item.code}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-semibold text-gray-800">{item.libelle}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.typeEquipement || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.marque || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${
                              item.statut === 'En service' ? 'bg-green-100 text-green-700' :
                              item.statut === 'Alerte' ? 'bg-yellow-100 text-yellow-700' :
                              item.statut === 'Hors service' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.statut}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {item.gmao ? (
                              <span className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-100 text-green-700">
                                oui
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{item.location?.name || '-'}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <EquipmentFormDialog
                                equipment={item}
                                onSave={handleSave}
                                selectedLocation={item.location}
                                trigger={
                                  <button className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors">
                                    <Edit className="w-4 h-4 text-blue-600" />
                                  </button>
                                }
                              />
                              <DeleteConfirmDialog
                                item={item}
                                itemType={config.singular}
                                onDelete={handleDelete}
                                trigger={
                                  <button className="p-2.5 hover:bg-red-50 rounded-xl transition-colors">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                }
                              />
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                      
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/30">
              <IconComponent className="h-16 w-16 mx-auto text-purple-300 mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">
                Aucun {config.singular.toLowerCase()} trouvé
              </p>
              <p className="text-gray-500 text-sm">
                Ajoutez votre premier {config.singular.toLowerCase()} pour commencer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}