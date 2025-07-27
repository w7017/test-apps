import React, { useState } from 'react';
import { X, Building, Save, Plus, Trash2 } from 'lucide-react';

interface Building {
  name: string;
  floors: number;
  description: string;
  photo?: string; // base64
}

interface AddBuildingModalProps {
  siteId: string;
  siteName: string;
  onClose: () => void;
  onSave: (buildings: Building[]) => void;
  isEditMode?: boolean;
  initialBuildings?: Building[];
}

const AddBuildingModal: React.FC<AddBuildingModalProps> = ({ 
  siteId, 
  siteName, 
  onClose, 
  onSave,
  isEditMode = false,
  initialBuildings
}) => {
  const [buildings, setBuildings] = useState<Building[]>(
    initialBuildings && initialBuildings.length > 0
      ? initialBuildings
      : [{ name: '', floors: 1, description: '' }]
  );

  const handleBuildingChange = (index: number, field: keyof Building, value: string | number) => {
    setBuildings(prev => prev.map((building, i) => 
      i === index ? { ...building, [field]: value } : building
    ));
  };

  const addBuilding = () => {
    if (isEditMode) return; // Pas d'ajout en mode édition
    setBuildings(prev => [...prev, { name: '', floors: 1, description: '' }]);
  };

  const removeBuilding = (index: number) => {
    if (isEditMode) return; // Pas de suppression en mode édition
    if (buildings.length > 1) {
      setBuildings(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validBuildings = buildings.filter(b => b.name.trim());
    if (validBuildings.length > 0) {
      onSave(validBuildings);
    }
  };

  const handleBuildingPhotoChange = (index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setBuildings(prev => prev.map((building, i) =>
        i === index ? { ...building, photo: e.target?.result as string } : building
      ));
    };
    reader.readAsDataURL(file);
  };

  const getBuildingImagePreview = (buildingName: string) => {
    if (!buildingName) return 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400';
    
    const name = buildingName.toLowerCase();
    
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
      return 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Modifier le bâtiment' : 'Ajouter des bâtiments'}</h2>
              <p className="text-gray-600">Site : {siteName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bâtiments */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-orange-900 flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>{isEditMode ? 'Bâtiment à modifier' : 'Nouveaux bâtiments'}</span>
                </h3>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={addBuilding}
                    className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {buildings.map((building, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Bâtiment {index + 1}</h4>
                      {!isEditMode && buildings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBuilding(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du bâtiment *
                        </label>
                        <input
                          type="text"
                          value={building.name}
                          onChange={(e) => handleBuildingChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Bâtiment A"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre d'étages
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={building.floors}
                          onChange={(e) => handleBuildingChange(index, 'floors', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={building.description}
                          onChange={(e) => handleBuildingChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Bureaux, Atelier..."
                        />
                      </div>
                    </div>
                    
                    {/* Champ image + aperçu */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo du bâtiment
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleBuildingPhotoChange(index, e.target.files?.[0] || null)}
                        className="mb-2"
                      />
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={building.photo || getBuildingImagePreview(building.name)}
                          alt={building.name || 'Bâtiment'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isEditMode ? 'Enregistrer' : 'Ajouter les bâtiments'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBuildingModal;