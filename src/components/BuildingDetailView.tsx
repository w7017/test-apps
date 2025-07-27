import React, { useState } from 'react';
import { useEffect } from 'react';
import { apiService } from '../services/api';
import AddLevelModal from './AddLevelModal';
import AddLocalModal from './AddLocalModal';
import AddEquipmentModal from './AddEquipmentModal';
import { 
  ArrowLeft, 
  Building, 
  Layers, 
  MapPin, 
  Wrench,
  ChevronRight,
  Eye,
  Plus,
  Search
} from 'lucide-react';

interface BuildingDetailViewProps {
  building: any;
  onBack: () => void;
  onEquipmentAudit: (equipment: any) => void;
}

const BuildingDetailView: React.FC<BuildingDetailViewProps> = ({ 
  building, 
  onBack, 
  onEquipmentAudit 
}) => {
  const [currentView, setCurrentView] = useState<'levels' | 'locals' | 'equipments'>('levels');
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedLocal, setSelectedLocal] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [showAddLocalModal, setShowAddLocalModal] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);

  useEffect(() => {
    loadBuildingData();
  }, [building.id]);

  const loadBuildingData = async () => {
    try {
      setLoading(true);
      const buildingData = await apiService.getBuilding(building.id);
      setLevels(buildingData.levels || []);
    } catch (error) {
      console.error('Error loading building data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update levels state
  const updateLevelsState = (updatedLevels: any[]) => {
    setLevels(updatedLevels);
    
    // Update selectedLevel if it exists in the new data
    if (selectedLevel) {
      const updatedSelectedLevel = updatedLevels.find(level => level.id === selectedLevel.id);
      if (updatedSelectedLevel) {
        setSelectedLevel(updatedSelectedLevel);
        
        // Update selectedLocal if it exists in the updated level
        if (selectedLocal) {
          const updatedSelectedLocal = updatedSelectedLevel.locals?.find(
            (local: any) => local.id === selectedLocal.id
          );
          if (updatedSelectedLocal) {
            setSelectedLocal(updatedSelectedLocal);
          }
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'audit_due': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocalTypeColor = (type: string) => {
    switch (type) {
      case 'Technique': return 'bg-blue-100 text-blue-800';
      case 'Bureau': return 'bg-green-100 text-green-800';
      case 'Accueil': return 'bg-purple-100 text-purple-800';
      case 'Réunion': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddLevel = () => {
    setShowAddLevelModal(true);
  };

  const handleSaveLevels = async (levelsData: any[]) => {
    try {
      const createdLevels = [];
      for (const levelData of levelsData) {
        const newLevel = await apiService.createLevel({
          building_id: building.id,
          ...levelData
        });
        createdLevels.push({
          ...newLevel,
          locals: [],
          locals_count: 0,
          equipment_count: 0
        });
      }
      
      // Add new levels to existing ones
      const updatedLevels = [...levels, ...createdLevels].sort((a, b) => a.number - b.number);
      updateLevelsState(updatedLevels);
      
      setShowAddLevelModal(false);
    } catch (error) {
      console.error('Error creating levels:', error);
      alert('Erreur lors de la création des niveaux');
    }
  };

  const handleAddLocal = () => {
    setShowAddLocalModal(true);
  };

  const handleSaveLocals = async (localsData: any[]) => {
    try {
      const createdLocals = [];
      for (const localData of localsData) {
        const newLocal = await apiService.createLocal({
          level_id: selectedLevel.id,
          ...localData
        });
        createdLocals.push({
          ...newLocal,
          equipment: [],
          equipment_count: 0
        });
      }
      
      // Update the levels state with new locals
      const updatedLevels = levels.map(level => {
        if (level.id === selectedLevel.id) {
          const existingLocals = level.locals || [];
          const updatedLocals = [...existingLocals, ...createdLocals];
          return {
            ...level,
            locals: updatedLocals,
            locals_count: updatedLocals.length
          };
        }
        return level;
      });
      
      updateLevelsState(updatedLevels);
      setShowAddLocalModal(false);
    } catch (error) {
      console.error('Error creating locals:', error);
      alert('Erreur lors de la création des locaux');
    }
  };

  const handleAddEquipment = () => {
    setShowAddEquipmentModal(true);
  };

  const handleSaveEquipments = async (equipmentsData: any[]) => {
    try {
      const result = await apiService.addEquipmentToLocal(selectedLocal.id, equipmentsData, building.id);
      const createdEquipments = Array.isArray(result.equipments) ? result.equipments : result;
      
      // Update the levels state with new equipment
      const updatedLevels = levels.map(level => {
        if (level.id === selectedLevel.id) {
          const updatedLocals = level.locals.map((local: any) => {
            if (local.id === selectedLocal.id) {
              const existingEquipment = local.equipment || [];
              const updatedEquipment = [...existingEquipment, ...createdEquipments];
              return {
                ...local,
                equipment: updatedEquipment,
                equipment_count: updatedEquipment.length
              };
            }
            return local;
          });
          
          // Update level equipment count
          const totalEquipmentCount = updatedLocals.reduce(
            (total: number, local: any) => total + (local.equipment_count || 0), 
            0
          );
          
          return {
            ...level,
            locals: updatedLocals,
            equipment_count: totalEquipmentCount
          };
        }
        return level;
      });
      
      updateLevelsState(updatedLevels);
      setShowAddEquipmentModal(false);
    } catch (error) {
      console.error('Error creating equipments:', error);
      alert('Erreur lors de la création des équipements');
    }
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <button 
        onClick={onBack}
        className="text-blue-600 hover:text-blue-800"
      >
        Sites
      </button>
      <ChevronRight className="w-4 h-4" />
      <span className="font-medium text-gray-900">{building.name}</span>
      {selectedLevel && (
        <>
          <ChevronRight className="w-4 h-4" />
          <button 
            onClick={() => {
              setCurrentView('levels');
              setSelectedLevel(null);
              setSelectedLocal(null);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            {selectedLevel.name}
          </button>
        </>
      )}
      {selectedLocal && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">{selectedLocal.name}</span>
        </>
      )}
    </div>
  );

  const renderLevelsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Niveaux du bâtiment</h2>
        <button 
          onClick={handleAddLevel}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un niveau</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((level) => (
          <div 
            key={level.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 cursor-pointer transition-colors"
            onClick={() => {
              setSelectedLevel(level);
              setCurrentView('locals');
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">{level.name}</h3>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Niveau {level.number}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Locaux:</span>
                <span className="font-medium">{level.locals_count || level.locals?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Équipements:</span>
                <span className="font-medium">
                  {level.equipment_count || 0}
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLocalsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Locaux - {selectedLevel?.name}
        </h2>
        <button 
          onClick={handleAddLocal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un local</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedLevel?.locals?.map((local: any) => (
          <div 
            key={local.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 cursor-pointer transition-colors"
            onClick={() => {
              setSelectedLocal(local);
              setCurrentView('equipments');
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">{local.name}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getLocalTypeColor(local.type)}`}>
                {local.type}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Surface:</span>
                <span className="font-medium">{local.surface} m²</span>
              </div>
              <div className="flex justify-between">
                <span>Équipements:</span>
                <span className="font-medium">{local.equipment_count || local.equipment?.length || 0}</span>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
        
        {(!selectedLevel?.locals || selectedLevel.locals.length === 0) && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Aucun local trouvé pour ce niveau</p>
            <p className="text-sm">Cliquez sur "Ajouter un local" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEquipmentsView = () => {
    const filteredEquipments = selectedLocal?.equipment?.filter((eq: any) =>
      eq.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.type.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Équipements - {selectedLocal?.name}
          </h2>
          <button 
            onClick={handleAddEquipment}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un équipement</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un équipement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Equipment Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredEquipments.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domaine</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marque</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEquipments.map((equipment: any) => (
                  <tr key={equipment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={getEquipmentImage(equipment.type)} 
                          alt={equipment.reference}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=200';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{equipment.reference}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{equipment.type}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {equipment.domain_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(equipment.status || 'audit_due')}`}>
                        {equipment.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{equipment.brand || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onEquipmentAudit(equipment)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          Auditer
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Aucun équipement trouvé</p>
              <p className="text-sm">
                {searchTerm 
                  ? 'Aucun équipement ne correspond à votre recherche' 
                  : 'Cliquez sur "Ajouter un équipement" pour commencer'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getEquipmentImage = (type: string) => {
    const typeStr = type?.toLowerCase() || '';
    if (typeStr.includes('centrale') || typeStr.includes('cta')) {
      return 'https://images.pexels.com/photos/159045/the-interior-of-the-repair-interior-159045.jpeg?auto=compress&cs=tinysrgb&w=200';
    } else if (typeStr.includes('vmc') || typeStr.includes('ventilation')) {
      return 'https://images.pexels.com/photos/8092/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=200';
    } else if (typeStr.includes('chaudière') || typeStr.includes('chauffage')) {
      return 'https://images.pexels.com/photos/8092/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=200';
    } else {
      return 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=200';
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

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux sites</span>
        </button>
      </div>

      {/* Building Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={building.image} 
              alt={building.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Building className="w-6 h-6 text-blue-600" />
              <span>{building.name}</span>
            </h1>
            <p className="text-gray-600">{building.floors} étages • {building.equipments} équipements</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {renderBreadcrumb()}

      {/* Dynamic Content */}
      {currentView === 'levels' && renderLevelsView()}
      {currentView === 'locals' && renderLocalsView()}
      {currentView === 'equipments' && renderEquipmentsView()}

      {/* Modals */}
      {showAddLevelModal && (
        <AddLevelModal
          buildingId={building.id}
          buildingName={building.name}
          onClose={() => setShowAddLevelModal(false)}
          onSave={handleSaveLevels}
        />
      )}

      {showAddLocalModal && selectedLevel && (
        <AddLocalModal
          levelId={selectedLevel.id}
          levelName={selectedLevel.name}
          onClose={() => setShowAddLocalModal(false)}
          onSave={handleSaveLocals}
        />
      )}

      {showAddEquipmentModal && selectedLocal && (
        <AddEquipmentModal
          localId={selectedLocal.id}
          localName={selectedLocal.name}
          buildingId={building.id}
          onClose={() => setShowAddEquipmentModal(false)}
          onSave={handleSaveEquipments}
        />
      )}
    </div>
  );
};

export default BuildingDetailView;