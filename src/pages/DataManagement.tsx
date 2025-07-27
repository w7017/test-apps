import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  FileText, 
  Database,
  Plus,
  Trash2,
  Edit,
  Copy,
  History,
  Zap
} from 'lucide-react';

const DataManagement = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mappingData, setMappingData] = useState<any>(null);

  const domains = [
    { id: 1, name: 'CVC', equipments: 1247, color: 'bg-blue-100 text-blue-800' },
    { id: 2, name: 'CFO/CFA', equipments: 896, color: 'bg-green-100 text-green-800' },
    { id: 3, name: 'Électricité', equipments: 567, color: 'bg-yellow-100 text-yellow-800' },
    { id: 4, name: 'Plomberie', equipments: 234, color: 'bg-purple-100 text-purple-800' },
  ];

  const recentChanges = [
    { 
      id: 1, 
      user: 'Marc Dubois', 
      action: 'Ajout d\'équipement', 
      equipment: 'CTA-BAT-A-005', 
      date: '2024-01-25 14:30',
      type: 'create'
    },
    { 
      id: 2, 
      user: 'Sophie Martin', 
      action: 'Modification', 
      equipment: 'VMC-R+1-003', 
      date: '2024-01-25 11:15',
      type: 'update'
    },
    { 
      id: 3, 
      user: 'Jean Dupont', 
      action: 'Import CSV', 
      equipment: '45 équipements', 
      date: '2024-01-24 16:45',
      type: 'import'
    },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Simulation du mapping automatique par IA
      setTimeout(() => {
        setMappingData({
          columns: [
            { source: 'ref_equipment', suggested: 'reference', confidence: 95 },
            { source: 'type_equip', suggested: 'type', confidence: 88 },
            { source: 'location_full', suggested: 'location', confidence: 92 },
            { source: 'serial_num', suggested: 'serialNumber', confidence: 97 },
            { source: 'brand_name', suggested: 'brand', confidence: 85 },
          ]
        });
      }, 1500);
    }
  };

  const tabs = [
    { id: 'import', label: 'Import/Export', icon: Upload },
    { id: 'domains', label: 'Domaines techniques', icon: Database },
    { id: 'duplicate', label: 'Duplication', icon: Copy },
    { id: 'history', label: 'Historique', icon: History },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
          <p className="text-gray-600">Gestion des données et imports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Import/Export Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Import de données</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Glissez-déposez votre fichier CSV/Excel ou cliquez pour sélectionner
                    </p>
                    <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      Sélectionner un fichier
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-medium">
                        ✓ Fichier uploadé: {uploadedFile.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Mapping Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>Mapping automatique IA</span>
                  </h3>
                  {mappingData ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 mb-4">
                        Correspondances suggérées (validation requise)
                      </p>
                      {mappingData.columns.map((col: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">{col.source}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-sm text-blue-600">{col.suggested}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              col.confidence >= 90 ? 'bg-green-100 text-green-800' :
                              col.confidence >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {col.confidence}%
                            </span>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Modifier
                            </button>
                          </div>
                        </div>
                      ))}
                      <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        Valider et importer
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Uploadez un fichier pour voir le mapping automatique</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Domains Tab */}
          {activeTab === 'domains' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Domaines techniques</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un domaine</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {domains.map((domain) => (
                  <div key={domain.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{domain.name}</h4>
                      <div className="flex space-x-1">
                        <button className="text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {domain.equipments} équipements
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${domain.color}`}>
                      Actif
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Tab */}
          {activeTab === 'duplicate' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Duplication d'équipements</h3>
                <p className="text-gray-600 mb-6">
                  Dupliquez un équipement existant avec adaptation automatique des champs critiques
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-4">Duplication intelligente</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Équipement source
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Sélectionner un équipement</option>
                      <option value="CTA-BAT-A-001">CTA-BAT-A-001 - Centrale de traitement d'air</option>
                      <option value="VMC-R+1-003">VMC-R+1-003 - Ventilation mécanique</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouvelle référence
                      </label>
                      <input
                        type="text"
                        placeholder="Auto-généré"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouvelle localisation
                      </label>
                      <input
                        type="text"
                        placeholder="Saisir la localisation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Copy className="w-4 h-4" />
                    <span>Dupliquer l'équipement</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Historique des modifications</h3>
              
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="divide-y divide-gray-200">
                  {recentChanges.map((change) => (
                    <div key={change.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            change.type === 'create' ? 'bg-green-500' :
                            change.type === 'update' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{change.action}</p>
                            <p className="text-sm text-gray-600">{change.equipment}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">{change.user}</p>
                          <p className="text-xs text-gray-500">{change.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataManagement;