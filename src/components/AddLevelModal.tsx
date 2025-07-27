import React, { useState } from 'react';
import { X, Layers, Save, Plus, Trash2 } from 'lucide-react';

interface Level {
  name: string;
  number: number;
  description: string;
}

interface AddLevelModalProps {
  buildingId: string;
  buildingName: string;
  onClose: () => void;
  onSave: (levels: Level[]) => void;
}

const AddLevelModal: React.FC<AddLevelModalProps> = ({ 
  buildingId, 
  buildingName, 
  onClose, 
  onSave 
}) => {
  const [levels, setLevels] = useState<Level[]>([
    { name: 'Rez-de-chaussée', number: 0, description: '' }
  ]);

  const handleLevelChange = (index: number, field: keyof Level, value: string | number) => {
    setLevels(prev => prev.map((level, i) => 
      i === index ? { ...level, [field]: value } : level
    ));
  };

  const addLevel = () => {
    const nextNumber = Math.max(...levels.map(l => l.number)) + 1;
    setLevels(prev => [...prev, { 
      name: nextNumber === 1 ? '1er étage' : `${nextNumber}ème étage`, 
      number: nextNumber, 
      description: '' 
    }]);
  };

  const removeLevel = (index: number) => {
    if (levels.length > 1) {
      setLevels(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validLevels = levels.filter(l => l.name.trim());
    if (validLevels.length > 0) {
      onSave(validLevels);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ajouter des niveaux</h2>
              <p className="text-gray-600">Bâtiment : {buildingName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Niveaux */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-blue-900 flex items-center space-x-2">
                  <Layers className="w-5 h-5" />
                  <span>Nouveaux niveaux</span>
                </h3>
                <button
                  type="button"
                  onClick={addLevel}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {levels.map((level, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Niveau {index + 1}</h4>
                      {levels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLevel(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du niveau *
                        </label>
                        <input
                          type="text"
                          value={level.name}
                          onChange={(e) => handleLevelChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Rez-de-chaussée"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro d'étage
                        </label>
                        <input
                          type="number"
                          value={level.number}
                          onChange={(e) => handleLevelChange(index, 'number', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={level.description}
                          onChange={(e) => handleLevelChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Bureaux, Accueil..."
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
                <span>Ajouter les niveaux</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLevelModal;