import React, { useState } from 'react';
import { X, Building, MapPin, Users, Save } from 'lucide-react';

interface SiteModalProps {
  onClose: () => void;
  onSave: (siteData: any) => void;
}

const SiteModal: React.FC<SiteModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    siteName: '',
    siteCode: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    buildings: [
      { name: '', floors: 1, description: '' }
    ]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBuildingChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      buildings: prev.buildings.map((building, i) => 
        i === index ? { ...building, [field]: value } : building
      )
    }));
  };

  const addBuilding = () => {
    setFormData(prev => ({
      ...prev,
      buildings: [...prev.buildings, { name: '', floors: 1, description: '' }]
    }));
  };

  const removeBuilding = (index: number) => {
    if (formData.buildings.length > 1) {
      setFormData(prev => ({
        ...prev,
        buildings: prev.buildings.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Function to get building image preview in modal
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
              <h2 className="text-xl font-bold text-gray-900">Créer un nouveau site</h2>
              <p className="text-gray-600">Ajoutez un client, un site et ses bâtiments</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations Site */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Informations Site</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du site *
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Siège Social"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code site *
                  </label>
                  <input
                    type="text"
                    value={formData.siteCode}
                    onChange={(e) => handleInputChange('siteCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: ABC-HQ-001"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Rue de la République"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paris"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75001"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bâtiments */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-orange-900 flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Bâtiments</span>
                </h3>
                <button
                  type="button"
                  onClick={addBuilding}
                  className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  + Ajouter un bâtiment
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.buildings.map((building, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Bâtiment {index + 1}</h4>
                      {formData.buildings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBuilding(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Supprimer
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
                    
                    {/* Building Image Preview */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aperçu du bâtiment
                      </label>
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={getBuildingImagePreview(building.name)} 
                          alt={building.name || 'Bâtiment'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400';
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        L'image est sélectionnée automatiquement selon le type de bâtiment
                      </p>
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
                <span>Créer le site</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiteModal;