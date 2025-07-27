import React, { useState } from 'react';
import { useEffect } from 'react';
import { apiService } from '../services/api';
import { intelligentSearch, debounce } from '../utils/searchUtils';
import SiteModal from '../components/SiteModal';
import BuildingDetailView from '../components/BuildingDetailView';
import AuditModal from '../components/AuditModal';
import AddBuildingModal from '../components/AddBuildingModal';
import { 
  Building, 
  Plus, 
  Search, 
  Filter,
  ChevronRight,
  ChevronDown,
  MapPin,
  Users,
  Wrench,
  Settings,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';
import { useClient } from '../contexts/ClientContext';
import { useNavigate } from 'react-router-dom';

const Sites = () => {
  const { selectedClient, refreshClients } = useClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [expandedClients, setExpandedClients] = useState<number[]>([1]);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [selectedSiteForBuilding, setSelectedSiteForBuilding] = useState<any>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<{
    totalResults: number;
    clientMatches: number;
    siteMatches: number;
    buildingMatches: number;
  }>({ totalResults: 0, clientMatches: 0, siteMatches: 0, buildingMatches: 0 });
  const [showEditBuildingModal, setShowEditBuildingModal] = useState(false);
  const [editBuilding, setEditBuilding] = useState<any>(null);
  const [buildingImages, setBuildingImages] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadClientsAndSites();
  }, []);

  useEffect(() => {
    applyIntelligentSearch();
  }, [clients, searchTerm]);

  // Après chargement, filtrer les clients selon selectedClient
  useEffect(() => {
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient.id);
      setFilteredClients(client ? [client] : []);
    } else {
      setFilteredClients(clients);
    }
  }, [clients, selectedClient]);

  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const applyIntelligentSearch = () => {
    if (!searchTerm || searchTerm.length < 2) {
      setFilteredClients(clients);
      setSearchResults({ totalResults: 0, clientMatches: 0, siteMatches: 0, buildingMatches: 0 });
      return;
    }

    let clientMatches = 0;
    let siteMatches = 0;
    let buildingMatches = 0;

    const filteredData = clients.map(client => {
      // Recherche dans le client
      const clientSearchData = [
        { name: client.name, contact_name: client.contact_name, contact_email: client.contact_email }
      ];
      const clientMatch = intelligentSearch(
        clientSearchData,
        searchTerm,
        ['name', 'contact_name', 'contact_email']
      ).length > 0;

      if (clientMatch) clientMatches++;

      // Recherche dans les sites et bâtiments
      const filteredSites = client.sites.map((site: any) => {
        const siteSearchData = [{ name: site.name, code: site.code, address: site.address, city: site.city }];
        const siteMatch = intelligentSearch(
          siteSearchData,
          searchTerm,
          ['name', 'code', 'address', 'city']
        ).length > 0;

        if (siteMatch) siteMatches++;

        // Recherche dans les bâtiments
        const filteredBuildings = site.buildings.filter((building: any) => {
          const buildingSearchData = [{ 
            name: building.name, 
            description: building.description,
            equipment_count: building.equipment_count?.toString() || '0'
          }];
          const buildingMatch = intelligentSearch(
            buildingSearchData,
            searchTerm,
            ['name', 'description', 'equipment_count'],
            (item, term) => {
              // Recherche personnalisée pour les nombres d'équipements
              const equipmentMatch = item.equipment_count && item.equipment_count.includes(term);
              return equipmentMatch || false;
            }
          ).length > 0;

          if (buildingMatch) buildingMatches++;
          return buildingMatch || siteMatch || clientMatch;
        });

        return {
          ...site,
          buildings: filteredBuildings,
          isVisible: siteMatch || clientMatch || filteredBuildings.length > 0
        };
      }).filter((site: any) => site.isVisible);

      return {
        ...client,
        sites: filteredSites,
        isVisible: clientMatch || filteredSites.length > 0
      };
    }).filter(client => client.isVisible);

    setFilteredClients(filteredData);
    setSearchResults({
      totalResults: clientMatches + siteMatches + buildingMatches,
      clientMatches,
      siteMatches,
      buildingMatches
    });

    // Auto-expand clients with results
    const clientsWithResults = filteredData.map(c => c.id);
    setExpandedClients(prev => [...new Set([...prev, ...clientsWithResults])]);
  };

  const loadBuildingImages = async (buildings: any[]) => {
    const imagePromises = buildings.map(async (building) => {
      if (!building.id) return null;
      
      try {
        const images = await apiService.getBuildingImages(building.id);
        const primaryImage = images.find(img => img.is_primary) || images[0];
        
        if (primaryImage) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const imagePath = primaryImage.file_path.startsWith('/') ? primaryImage.file_path : `/${primaryImage.file_path}`;
          const imageUrl = `${apiUrl}${imagePath}`;
          
          return { buildingId: building.id, imageUrl };
        }
      } catch (error) {
        console.error(`Error loading image for building ${building.id}:`, error);
      }
      
      return null;
    });

    const results = await Promise.all(imagePromises);
    const imageMap = {};
    
    results.forEach(result => {
      if (result) {
        imageMap[result.buildingId] = result.imageUrl;
      }
    });

    setBuildingImages(prev => ({ ...prev, ...imageMap }));
  };

  const loadClientsAndSites = async () => {
    try {
      setLoading(true);
      
      // Load clients
      const clientsResponse = await apiService.getClients();
      const clientsData = clientsResponse.clients || [];
      
      // Load sites for each client and their buildings
      const clientsWithSites = await Promise.all(
        clientsData.map(async (client: any) => {
          try {
            const sitesResponse = await apiService.getSites({ client_id: client.id });
            const sites = sitesResponse.sites || [];
            
            // Load buildings for each site
            const sitesWithBuildings = await Promise.all(
              sites.map(async (site: any) => {
                try {
                  const buildings = await apiService.getSiteBuildings(site.id);
                  return {
                    ...site,
                    buildings: buildings || []
                  };
                } catch (error) {
                  console.error(`Error loading buildings for site ${site.id}:`, error);
                  return {
                    ...site,
                    buildings: []
                  };
                }
              })
            );
            
            return {
              ...client,
              sites: sitesWithBuildings
            };
          } catch (error) {
            console.error(`Error loading sites for client ${client.id}:`, error);
            return {
              ...client,
              sites: []
            };
          }
        })
      );
      
      setClients(clientsWithSites);
      
      // Load images for all buildings
      const allBuildings = clientsWithSites.flatMap(client => 
        client.sites.flatMap(site => site.buildings)
      );
      
      if (allBuildings.length > 0) {
        await loadBuildingImages(allBuildings);
      }
      
      // Expand first client by default if any exist
      if (clientsWithSites.length > 0) {
        setExpandedClients([clientsWithSites[0].id]);
      }
      
    } catch (error) {
      console.error('Error loading clients and sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClient = (clientId: number) => {
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleAddBuilding = (site: any) => {
    setSelectedSiteForBuilding(site);
    setShowAddBuildingModal(true);
  };

  const handleSaveBuildingsToSite = async (buildings: any[]) => {
    try {
      if (!selectedSiteForBuilding) return;
      
      await apiService.addBuildingsToSite(selectedSiteForBuilding.id, buildings);
      
      // Recharger les données
      await loadClientsAndSites();
      await refreshClients(); // Synchronise le contexte client
      
      setShowAddBuildingModal(false);
      setSelectedSiteForBuilding(null);
      
      alert(`${buildings.length} bâtiment(s) ajouté(s) avec succès !`);
    } catch (error) {
      console.error('Error adding buildings:', error);
      alert('Erreur lors de l\'ajout des bâtiments');
    }
  };

  const handleSaveNewSite = async (siteData: any) => {
    try {
      if (!selectedClient) {
        alert('Veuillez sélectionner un client avant de créer un site.');
        return;
      }
      // Crée le site avec le client actif
      const newSite = await apiService.createSite({
        client_id: selectedClient.id,
        name: siteData.siteName,
        code: siteData.siteCode,
        address: siteData.address,
        city: siteData.city,
        postal_code: siteData.postalCode,
        country: siteData.country,
        buildings: siteData.buildings
      });
      // Recharge les données pour refléter les changements
      await loadClientsAndSites();
      refreshClients(); // Refresh clients in context
      console.log('Nouveau site créé:', newSite);
    } catch (error) {
      console.error('Error creating new site:', error);
      alert('Erreur lors de la création du site. Veuillez réessayer.');
    }
  };

  const handleBuildingClick = (building: any) => {
    // Add mock levels data to building
    const buildingWithLevels = {
      ...building,
      levels: [] // Will be populated by BuildingDetailView component
    };
    setSelectedBuilding(buildingWithLevels);
  };

  const handleEquipmentAudit = (equipment: any) => {
    setSelectedEquipment(equipment);
    setShowAuditModal(true);
  };

  const handleAddLevel = (building: any) => {
    // This functionality is now handled in BuildingDetailView
    handleBuildingClick(building);
  };

  const handleAddLocal = (level: any) => {
    // This functionality is now handled in BuildingDetailView
    console.log('Add local to level:', level);
  };

  const handleEditBuilding = (building: any) => {
    setEditBuilding(building);
    setShowEditBuildingModal(true);
  };

  const handleSaveEditBuilding = async (buildings: any[]) => {
    try {
      // On ne gère qu'un seul bâtiment à la fois en édition
      const updated = { ...editBuilding, ...buildings[0] };
      await apiService.updateBuilding(updated.id, updated);
      setShowEditBuildingModal(false);
      setEditBuilding(null);
      await loadClientsAndSites();
      await refreshClients(); // Synchronise le contexte client
    } catch (err) {
      alert('Erreur lors de la modification du bâtiment');
    }
  };

  const handleDeleteBuilding = async (building: any) => {
    if (!window.confirm('Supprimer ce bâtiment ? Cette action est irréversible.')) return;
    try {
      await apiService.deleteBuilding(building.id);
      await loadClientsAndSites();
      await refreshClients(); // Synchronise le contexte client
    } catch (err) {
      alert('Erreur lors de la suppression du bâtiment');
    }
  };

  // Function to get building image - now uses API images first, then fallback to static
  const getBuildingImage = (building: any) => {
    // First, check if we have a loaded image from the API
    if (buildingImages[building.id]) {
      return buildingImages[building.id];
    }

    // If building has a photo property, use it
    if (building.photo) {
      // If it's already a full URL, use it
      if (building.photo.startsWith('http')) {
        return building.photo;
      }
      // If it's a relative path, construct the full URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      return `${apiUrl}${building.photo.startsWith('/') ? building.photo : '/' + building.photo}`;
    }

    // Fallback to default images based on building name/type
    const name = building.name.toLowerCase();
    
    if (name.includes('atelier') || name.includes('usine') || name.includes('production')) {
      return 'https://images.pexels.com/photos/236698/pexels-photo-236698.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('bureau') || name.includes('administratif') || name.includes('siège')) {
      return 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('parking') || name.includes('garage')) {
      return 'https://images.pexels.com/photos/63294/autos-technology-vw-multi-storey-car-park-63294.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('entrepôt') || name.includes('stockage') || name.includes('logistique')) {
      return 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('tour') || name.includes('immeuble')) {
      return 'https://images.pexels.com/photos/2098427/pexels-photo-2098427.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('commercial') || name.includes('centre')) {
      return 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else {
      // Default building image
      return 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    return (
      <div className="p-8 text-center text-gray-500">
        Veuillez sélectionner un client pour accéder à cette page.
        <div className="mt-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => navigate('/clients')}
          >
            Sélectionner un client
          </button>
        </div>
      </div>
    );
  }

  // If a building is selected, show the building detail view
  if (selectedBuilding) {
    return (
      <BuildingDetailView
        building={selectedBuilding}
        onBack={() => setSelectedBuilding(null)}
        onEquipmentAudit={handleEquipmentAudit}
      />
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Arborescence technique du client : {selectedClient.name}</h2>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-600">Gestion des clients, sites et bâtiments</p>
        </div>
        <button 
          onClick={() => setShowSiteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un nouveau site</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un site, client ou bâtiment..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && searchResults.totalResults > 0 && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                {searchResults.totalResults} résultat(s)
              </div>
            )}
          </div>
          {searchTerm && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <span>Clients: {searchResults.clientMatches}</span>
              <span>•</span>
              <span>Sites: {searchResults.siteMatches}</span>
              <span>•</span>
              <span>Bâtiments: {searchResults.buildingMatches}</span>
            </div>
          )}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
        </div>
      </div>

      {/* Sites Tree */}
      <div className="bg-white rounded-xl shadow-sm">
        {filteredClients.length === 0 && !searchTerm ? (
          <div className="p-8 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun site trouvé</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier site</p>
            <button 
              onClick={() => setShowSiteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un site
            </button>
          </div>
        ) : filteredClients.length === 0 && searchTerm ? (
          <div className="p-8 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-600 mb-4">
              Aucun client, site ou bâtiment ne correspond à "{searchTerm}"
            </p>
            <button onClick={() => setSearchTerm('')} className="text-blue-600 hover:text-blue-800">
              Effacer la recherche
            </button>
          </div>
        ) : (
          filteredClients.map((client) => {
            const isExpanded = expandedClients.includes(client.id);
            return (
              <div key={client.id} className="border-b last:border-b-0">
                {/* Client Header */}
                <div 
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleClient(client.id)}
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-600">{client.sites.length} site(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {client.sites.reduce((total:any, site:any) => total + site.buildings.length, 0)} bâtiment(s)
                    </span>
                  </div>
                </div>

                {/* Sites */}
                {isExpanded && (
                  <div className="pl-8 pb-4">
                    {client.sites.map((site: any) => (
                      <div key={site.id} className="mb-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{site.name}</h4>
                              <p className="text-sm text-gray-600">Code: {site.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => handleAddBuilding(site)}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-1"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Ajouter bâtiment</span>
                            </button>
                          </div>
                        </div>

                        {/* Buildings */}
                        <div className="ml-2 mt-3 flex flex-wrap">
                          {site.buildings.map((building:any) => (
                            <div 
                              key={building.id}
                              className="p-1 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer text-xs max-w-xs bg-white overflow-hidden mr-1 mb-1 relative"
                              onClick={() => handleBuildingClick(building)}
                            >
                              {/* Building Image */}
                              <div className="w-full h-20 bg-gray-100 rounded-t-lg overflow-hidden">
                                <img 
                                  src={getBuildingImage(building)}
                                  alt={building.name}
                                  className="object-cover w-full h-full"
                                  crossOrigin="anonymous"
                                  onError={(e) => {
                                    console.error('Error loading building image:', building);
                                    // Fallback to default image
                                    e.currentTarget.src = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400';
                                  }}
                                />
                              </div>
                              <div className="px-2 pb-2 pt-1">
                                <div className="font-semibold text-gray-800 truncate">{building.name}</div>
                                <div className="text-[10px] text-gray-500">{building.floors} étage(s)</div>
                                {building.description && (
                                  <div className="text-[10px] text-gray-400 truncate">{building.description}</div>
                                )}
                              </div>
                              <div className="absolute top-1 right-1 flex space-x-1 z-10">
                                <button
                                  title="Modifier le bâtiment"
                                  className="text-yellow-700 hover:text-yellow-900 p-0.5 bg-white rounded"
                                  onClick={e => { e.stopPropagation(); handleEditBuilding(building); }}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  title="Supprimer le bâtiment"
                                  className="text-red-600 hover:text-red-800 p-0.5 bg-white rounded"
                                  onClick={e => { e.stopPropagation(); handleDeleteBuilding(building); }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>


      {/* Site Creation Modal */}
      {showSiteModal && (
        <SiteModal
          onClose={() => setShowSiteModal(false)}
          onSave={handleSaveNewSite}
        />
      )}

      {/* Add Building Modal */}
      {showAddBuildingModal && selectedSiteForBuilding && (
        <AddBuildingModal
          siteId={selectedSiteForBuilding.id}
          siteName={selectedSiteForBuilding.name}
          onClose={() => {
            setShowAddBuildingModal(false);
            setSelectedSiteForBuilding(null);
          }}
          onSave={handleSaveBuildingsToSite}
        />
      )}

      {/* Audit Modal */}
      {showAuditModal && (
        <AuditModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowAuditModal(false);
            setSelectedEquipment(null);
          }}
        />
      )}
      {showEditBuildingModal && editBuilding && (
        <AddBuildingModal
          siteId={editBuilding.site_id}
          siteName={editBuilding.site_name || ''}
          onClose={() => { setShowEditBuildingModal(false); setEditBuilding(null); }}
          onSave={handleSaveEditBuilding}
          initialBuildings={[editBuilding]}
          isEditMode={true}
        />
      )}
    </div>
  );
};

export default Sites;