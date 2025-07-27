import React, { useState } from 'react';
import { X, FileText, Calendar, Building, Save } from 'lucide-react';

interface GenerateReportModalProps {
  onClose: () => void;
  onSave: (reportData: any) => void;
}

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    site: '',
    building: '',
    periodStart: '',
    periodEnd: '',
    includePhotos: true,
    includeRecommendations: true,
    format: 'pdf'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const generateTitle = () => {
    const now = new Date();
    const month = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const title = `Rapport d'audit - ${formData.site || 'Site'} - ${month}`;
    setFormData(prev => ({ ...prev, title }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Générer un nouveau rapport</h2>
              <p className="text-gray-600">Configurez les paramètres de votre rapport d'audit</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du rapport
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Rapport d'audit mensuel"
                  required
                />
                <button
                  type="button"
                  onClick={generateTitle}
                  className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Sélection du périmètre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <select
                  value={formData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  <option value="abc">Groupe Industriel ABC</option>
                  <option value="xyz">Société XYZ</option>
                  <option value="def">Entreprise DEF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site
                </label>
                <select
                  value={formData.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner un site</option>
                  <option value="siege">Siège Social</option>
                  <option value="usine-nord">Usine Nord</option>
                  <option value="batiment-b">Bâtiment B</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bâtiment (optionnel)
              </label>
              <select
                value={formData.building}
                onChange={(e) => handleInputChange('building', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les bâtiments</option>
                <option value="batiment-a">Bâtiment A</option>
                <option value="batiment-b">Bâtiment B</option>
                <option value="local-technique">Local technique</option>
              </select>
            </div>

            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période d'audit
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Du</label>
                  <input
                    type="date"
                    value={formData.periodStart}
                    onChange={(e) => handleInputChange('periodStart', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Au</label>
                  <input
                    type="date"
                    value={formData.periodEnd}
                    onChange={(e) => handleInputChange('periodEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Options du rapport</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includePhotos}
                    onChange={(e) => handleInputChange('includePhotos', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inclure les photos d'audit</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeRecommendations}
                    onChange={(e) => handleInputChange('includeRecommendations', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inclure les recommandations IA</span>
                </label>
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format de sortie
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={formData.format === 'pdf'}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">PDF synthétique</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={formData.format === 'excel'}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Excel détaillé</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="both"
                    checked={formData.format === 'both'}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Les deux</span>
                </label>
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
                <FileText className="w-4 h-4" />
                <span>Générer le rapport</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;