import React, { useState } from 'react';
import { 
  Users, 
  Settings as SettingsIcon, 
  FileText,
  Database,
  Plus,
  Edit,
  Trash2,
  Shield,
  Bell,
  Palette
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('users');

  const users = [
    { id: 1, name: 'Marc Dubois', email: 'marc@example.com', role: 'Administrateur', status: 'active' },
    { id: 2, name: 'Sophie Martin', email: 'sophie@example.com', role: 'Technicien', status: 'active' },
    { id: 3, name: 'Jean Dupont', email: 'jean@example.com', role: 'Superviseur', status: 'inactive' },
  ];

  const defectTypes = [
    { id: 1, name: 'Filtre obstrué', domain: 'CVC', severity: 'Critique' },
    { id: 2, name: 'Fuite détectée', domain: 'CVC', severity: 'Critique' },
    { id: 3, name: 'Vibrations excessives', domain: 'CVC', severity: 'Importante' },
    { id: 4, name: 'Bruit anormal', domain: 'CVC', severity: 'Mineure' },
  ];

  const tabs = [
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'general', label: 'Configuration', icon: SettingsIcon },
    { id: 'reports', label: 'Rapports', icon: FileText },
    { id: 'defects', label: 'Base de défauts', icon: Database },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrateur': return 'bg-red-100 text-red-800';
      case 'Superviseur': return 'bg-blue-100 text-blue-800';
      case 'Technicien': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critique': return 'bg-red-100 text-red-800';
      case 'Importante': return 'bg-yellow-100 text-yellow-800';
      case 'Mineure': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Configuration et gestion de l'application</p>
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
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un utilisateur</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Nom</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Email</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Rôle</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Statut</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuration générale</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo de la société
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Cliquez pour uploader un logo</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      defaultValue="GMAO Pro"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence des rappels d'audit
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuel</option>
                      <option value="quarterly">Trimestriel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Délai d'alerte avant audit
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="7">7 jours</option>
                      <option value="14">14 jours</option>
                      <option value="30">30 jours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Personnalisation des rapports</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    En-tête des rapports PDF
                  </label>
                  <textarea
                    rows={4}
                    defaultValue="GMAO Pro - Rapport d'audit technique&#10;Inspection et maintenance des équipements"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature automatique
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Rapport généré automatiquement par GMAO Pro&#10;Conforme aux normes de maintenance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Defects Tab */}
          {activeTab === 'defects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Base de données des défauts</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un défaut</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Défaut</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Domaine</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Sévérité</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defectTypes.map((defect) => (
                      <tr key={defect.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium text-gray-900">{defect.name}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {defect.domain}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(defect.severity)}`}>
                            {defect.severity}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;