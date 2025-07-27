import React, { useState } from 'react';
import { X, MapPin, Save, Plus, Trash2 } from 'lucide-react';

interface Local {
  name: string;
  type: string;
  surface: number;
  description: string;
}

interface AddLocalModalProps {
  levelId: string;
  levelName: string;
  onClose: () => void;
  onSave: (locals: Local[]) => void;
}

const AddLocalModal: React.FC<AddLocalModalProps> = ({ 
  levelId, 
  levelName, 
  onClose, 
  onSave 
}) => {
  const [locals, setLocals] = useState<Local[]>([
    { name: '', type: 'Bureau', surface: 0, description: '' }
  ]);

  const localTypes = [
    'Bureau',
    'Salle de réunion',
    'Accueil',
    'Local technique',
    'Stockage',
    'Sanitaires',
    'Cuisine',
    'Couloir',
    'Escalier',
    'Ascenseur',
    'Autre'
  ];

  const handleLocalChange = (index: number, field: keyof Local, value: string | number) => {
    setLocals(prev => prev.map((local, i) => 
      i === index ? { ...local, [field]: value } : local
    ));
  };

  const addLocal = () => {
    setLocals(prev => [...prev, { 
      name: '', 
      type: 'Bureau', 
      surface: 0, 
      description: '' 
    }]);
  };

  const removeLocal = (index: number) => {
    if (locals.length > 1) {
      setLocals(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validLocals = locals.filter(l => l.name.trim());
    if (validLocals.length > 0) {
      onSave(validLocals);
    }
  };

  const getLocalTypeColor = (type: string) => {
    switch (type) {
      case 'Local technique': return 'bg-blue-100 text-blue-800';
      case 'Bureau': return 'bg-green-100 text-green-800';
      case 'Accueil': return 'bg-purple-100 text-purple-800';
      case 'Salle de réunion': return 'bg-orange-100 text-orange-800';
      case 'Stockage': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ajouter des locaux</h2>
              <p className="text-gray-600">Niveau : {levelName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Locaux */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-green-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Nouveaux locaux</span>
                </h3>
                <button
                  type="button"
                  onClick={addLocal}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {locals.map((local, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">Local {index + 1}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLocalTypeColor(local.type)}`}>
                          {local.type}
                        </span>
                      </div>
                      {locals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocal(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du local *
                        </label>
                        <input
                          type="text"
                          value={local.name}
                          onChange={(e) => handleLocalChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Bureau 101"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type de local
                        </label>
                        <select
                          value={local.type}
                          onChange={(e) => handleLocalChange(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {localTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Surface (m²)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={local.surface}
                          onChange={(e) => handleLocalChange(index, 'surface', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={local.description}
                          onChange={(e) => handleLocalChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Détails..."
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
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Ajouter les locaux</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLocalModal;