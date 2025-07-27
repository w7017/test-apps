import React, { useState } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { AdvancedFilter } from '../utils/searchUtils';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: AdvancedFilter[]) => void;
  filterOptions: {
    field: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date' | 'range';
    options?: { value: any; label: string }[];
  }[];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  filterOptions
}) => {
  const [filters, setFilters] = useState<AdvancedFilter[]>([]);

  const addFilter = () => {
    setFilters(prev => [...prev, {
      field: filterOptions[0]?.field || '',
      operator: 'contains',
      value: ''
    }]);
  };

  const updateFilter = (index: number, updates: Partial<AdvancedFilter>) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ));
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const resetFilters = () => {
    setFilters([]);
  };

  const handleApply = () => {
    const validFilters = filters.filter(f => f.field && f.value !== '');
    onApplyFilters(validFilters);
    onClose();
  };

  const getOperatorOptions = (fieldType: string) => {
    switch (fieldType) {
      case 'number':
        return [
          { value: 'equals', label: 'Égal à' },
          { value: 'greater', label: 'Supérieur à' },
          { value: 'less', label: 'Inférieur à' },
          { value: 'between', label: 'Entre' }
        ];
      case 'text':
        return [
          { value: 'contains', label: 'Contient' },
          { value: 'equals', label: 'Égal à' }
        ];
      case 'select':
        return [
          { value: 'equals', label: 'Égal à' },
          { value: 'in', label: 'Dans la liste' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'Le' },
          { value: 'greater', label: 'Après le' },
          { value: 'less', label: 'Avant le' },
          { value: 'between', label: 'Entre' }
        ];
      default:
        return [{ value: 'contains', label: 'Contient' }];
    }
  };

  const renderValueInput = (filter: AdvancedFilter, index: number) => {
    const fieldOption = filterOptions.find(opt => opt.field === filter.field);
    if (!fieldOption) return null;

    switch (fieldOption.type) {
      case 'number':
        if (filter.operator === 'between') {
          return (
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={Array.isArray(filter.value) ? filter.value[0] : ''}
                onChange={(e) => updateFilter(index, {
                  value: [Number(e.target.value), Array.isArray(filter.value) ? filter.value[1] : 0]
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max"
                value={Array.isArray(filter.value) ? filter.value[1] : ''}
                onChange={(e) => updateFilter(index, {
                  value: [Array.isArray(filter.value) ? filter.value[0] : 0, Number(e.target.value)]
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'select':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner...</option>
            {fieldOption.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        if (filter.operator === 'between') {
          return (
            <div className="flex space-x-2">
              <input
                type="date"
                value={Array.isArray(filter.value) ? filter.value[0] : ''}
                onChange={(e) => updateFilter(index, {
                  value: [e.target.value, Array.isArray(filter.value) ? filter.value[1] : '']
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={Array.isArray(filter.value) ? filter.value[1] : ''}
                onChange={(e) => updateFilter(index, {
                  value: [Array.isArray(filter.value) ? filter.value[0] : '', e.target.value]
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          );
        }
        return (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilter(index, { value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Valeur..."
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Filtres avancés</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {filters.map((filter, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Champ
                    </label>
                    <select
                      value={filter.field}
                      onChange={(e) => updateFilter(index, { field: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {filterOptions.map(option => (
                        <option key={option.field} value={option.field}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opérateur
                    </label>
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {getOperatorOptions(
                        filterOptions.find(opt => opt.field === filter.field)?.type || 'text'
                      ).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valeur
                    </label>
                    {renderValueInput(filter, index)}
                  </div>

                  {/* Remove */}
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeFilter(index)}
                      className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Filter Button */}
            <button
              type="button"
              onClick={addFilter}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              + Ajouter un filtre
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <button
              onClick={resetFilters}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApply}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Appliquer ({filters.filter(f => f.field && f.value !== '').length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;