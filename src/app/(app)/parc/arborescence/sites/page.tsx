// src/app/parc/arborescence/sites/page.tsx
'use client';

import { Suspense, useContext, useState } from 'react';
import { ClientContext } from '@/contexts/client-context';
import HierarchyListPage from '@/components/hierarchy-list-page';
import { Loader2 } from 'lucide-react';

function SitesListContent() {
  const { selectedClient } = useContext(ClientContext);
  
  return (
    <HierarchyListPage
      listType="sites"
      selectedClient={selectedClient}
      filters={{}}
    />
  );
}

export default function SitesListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <SitesListContent />
    </Suspense>
  );
}

// ===================================================================
// EXAMPLE OF INTEGRATION IN hierarchy-list-page.tsx
// ===================================================================

/*
Import the filter components at the top:

import { 
  FilterPanel, 
  SITE_FILTER_CONFIG, 
  BUILDING_FILTER_CONFIG, 
  LEVEL_FILTER_CONFIG, 
  LOCATION_FILTER_CONFIG, 
  EQUIPMENT_FILTER_CONFIG,
  parseAddress
} from '@/components/filter-panel';

Add these state variables in your component:

const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

Add this function to get the appropriate filter config:

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

Update fetchItems to include advanced filters in the API call:

const fetchItems = async () => {
  if (!selectedClient) return;
  
  setLoading(true);
  try {
    let endpoint = `${config.apiEndpoint}/client/${selectedClient.id}`;
    
    // Apply hierarchy filters
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

Add useEffect to refetch when advanced filters change:

useEffect(() => {
  if (selectedClient) {
    fetchItems();
  }
}, [selectedClient, listType, activeFilters, advancedFilters]);

Add filter panel handlers:

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

In the header section, add the advanced filter button:

<div className="flex gap-3">
  <button
    onClick={() => setIsFilterPanelOpen(true)}
    className="px-5 py-3 border-2 border-purple-200 rounded-xl hover:bg-purple-50 flex items-center gap-2 font-medium transition-all hover:shadow-md relative"
  >
    <Filter className="h-4 w-4" />
    Filtres avancés
    {getActiveAdvancedFilterCount() > 0 && (
      <span className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
        {getActiveAdvancedFilterCount()}
      </span>
    )}
  </button>
  
  <button onClick={exportToCSV} ...>
    Export CSV
  </button>
  
  // ... existing add buttons
</div>

Add active filters display (optional, after hierarchical filters section):

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

At the end of the component (before final closing tag), add the FilterPanel:

<FilterPanel
  isOpen={isFilterPanelOpen}
  onClose={() => setIsFilterPanelOpen(false)}
  filterConfigs={getFilterConfig()}
  currentFilters={advancedFilters}
  onApplyFilters={handleApplyFilters}
  onResetFilters={handleResetFilters}
/>
*/