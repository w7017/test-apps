'use client';

import React, { useState, useEffect } from 'react';
import { X, Filter, Check, Search } from 'lucide-react';

interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'toggle' | 'search';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filterConfigs: FilterConfig[];
  currentFilters: Record<string, any>;
  onApplyFilters: (filters: Record<string, any>) => void;
  onResetFilters: () => void;
}

export function FilterPanel({
  isOpen,
  onClose,
  filterConfigs,
  currentFilters,
  onApplyFilters,
  onResetFilters,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    const changed = JSON.stringify(localFilters) !== JSON.stringify(currentFilters);
    setHasChanges(changed);
  }, [localFilters, currentFilters]);

  const handleFilterChange = (filterId: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleMultiSelectToggle = (filterId: string, value: string) => {
    setLocalFilters(prev => {
      const currentValues = prev[filterId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [filterId]: newValues,
      };
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onResetFilters();
  };

  const getActiveFilterCount = () => {
    return Object.entries(localFilters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  const renderFilterInput = (config: FilterConfig) => {
    const value = localFilters[config.id];

    switch (config.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFilterChange(config.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">Tous</option>
            {config.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
            {config.options?.map((option) => {
              const isSelected = (value || []).includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleMultiSelectToggle(config.id, option.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'toggle':
        return (
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-purple-50 cursor-pointer transition-colors">
            <div className={`w-12 h-6 rounded-full transition-all ${
              value ? 'bg-purple-600' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                value ? 'ml-6' : 'ml-0.5'
              }`} />
            </div>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFilterChange(config.id, e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm font-medium text-gray-700">
              {value ? 'Oui' : 'Non'}
            </span>
          </label>
        );

      case 'search':
      case 'text':
        return (
          <div className="relative">
            {config.type === 'search' && (
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFilterChange(config.id, e.target.value)}
              placeholder={config.placeholder}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                config.type === 'search' ? 'pl-11' : ''
              }`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-xl">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Filtres avancés</h2>
                {getActiveFilterCount() > 0 && (
                  <p className="text-sm text-purple-600 font-medium">
                    {getActiveFilterCount()} filtre{getActiveFilterCount() > 1 ? 's' : ''} actif{getActiveFilterCount() > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {filterConfigs.map((config) => (
              <div key={config.id} className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {config.label}
                </label>
                {renderFilterInput(config)}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
            <button
              onClick={handleApply}
              disabled={!hasChanges}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Appliquer les filtres
            </button>
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold transition-all"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to extract city and postal code from address
export function parseAddress(address: string): { city: string; postalCode: string } {
  if (!address) return { city: '', postalCode: '' };
  
  // Simple regex to extract postal code (French format: 5 digits)
  const postalCodeMatch = address.match(/\b\d{5}\b/);
  const postalCode = postalCodeMatch ? postalCodeMatch[0] : '';
  
  // Extract city (text after postal code or last part of address)
  let city = '';
  if (postalCode) {
    const parts = address.split(postalCode);
    city = parts[1]?.trim() || '';
  } else {
    const parts = address.split(',');
    city = parts[parts.length - 1]?.trim() || '';
  }
  
  return { city, postalCode };
}

// Filter configurations for each hierarchy level
export const SITE_FILTER_CONFIG: FilterConfig[] = [
  {
    id: 'estPlanifie',
    label: 'Site planifié',
    type: 'select',
    options: [
      { value: 'true', label: 'Planifié' },
      { value: 'false', label: 'Non planifié' },
    ],
  },
  {
    id: 'avancement',
    label: 'Avancement',
    type: 'multiselect',
    options: [
      { value: 'non_commence', label: 'Non commencé' },
      { value: 'commence', label: 'Commencé' },
      { value: 'en_cours', label: 'En cours' },
      { value: 'termine', label: 'Terminé' },
    ],
  },
  {
    id: 'codeClient',
    label: 'Code Client',
    type: 'search',
    placeholder: 'Rechercher par code client...',
  },
  {
    id: 'city',
    label: 'Ville',
    type: 'search',
    placeholder: 'Rechercher par ville...',
  },
  {
    id: 'postalCode',
    label: 'Code postal',
    type: 'text',
    placeholder: 'Ex: 75001',
  },
];

export const BUILDING_FILTER_CONFIG: FilterConfig[] = [
  {
    id: 'hasLevels',
    label: 'Avec niveaux',
    type: 'toggle',
  },
];

export const LEVEL_FILTER_CONFIG: FilterConfig[] = [
  {
    id: 'hasLocations',
    label: 'Avec locaux',
    type: 'toggle',
  },
];

export const LOCATION_FILTER_CONFIG: FilterConfig[] = [
  {
    id: 'hasEquipments',
    label: 'Avec équipements',
    type: 'toggle',
  },
];

export const EQUIPMENT_FILTER_CONFIG: FilterConfig[] = [
  {
    id: 'statut',
    label: 'Statut',
    type: 'multiselect',
    options: [
      { value: 'En service', label: 'En service' },
      { value: 'Alerte', label: 'Alerte' },
      { value: 'Hors service', label: 'Hors service' },
      { value: 'En veille', label: 'En veille' },
    ],
  },
  {
    id: 'typeEquipement',
    label: 'Type d\'équipement',
    type: 'search',
    placeholder: 'Rechercher par type...',
  },
  {
    id: 'marque',
    label: 'Marque',
    type: 'search',
    placeholder: 'Rechercher par marque...',
  },
  {
    id: 'equipementSensible',
    label: 'Équipement sensible uniquement',
    type: 'toggle',
  },
];