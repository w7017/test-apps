import React, { useState } from 'react';
import { useEffect } from 'react';
import { apiService } from '../services/api';
import { intelligentSearch, debounce, AdvancedFilter, applyAdvancedFilters } from '../utils/searchUtils';
import AdvancedFilters from '../components/AdvancedFilters';
import GenerateReportModal from '../components/GenerateReportModal';
import { 
  FileText, 
  Download, 
  Eye, 
  Filter,
  Calendar,
  Building,
  Send,
  CheckCircle,
  Clock,
  Plus,
  Search
} from 'lucide-react';

const Deliverables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDeliverables, setFilteredDeliverables] = useState<any[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClient, setSelectedClient] = useState('all');
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliverables();
  }, [selectedPeriod, selectedClient]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [deliverables, searchTerm, advancedFilters]);

  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const applyFiltersAndSearch = () => {
    let result = [...deliverables];

    // Appliquer les filtres avancés
    if (advancedFilters.length > 0) {
      result = applyAdvancedFilters(result, advancedFilters);
    }

    // Appliquer la recherche intelligente
    if (searchTerm && searchTerm.length >= 2) {
      const searchKeys = [
        'title',
        'client',
        'site',
        'period'
      ];

      result = intelligentSearch(
        result,
        searchTerm,
        searchKeys,
        (deliverable, term) => {
          // Recherche personnalisée pour les nombres
          const equipmentMatch = deliverable.equipments && deliverable.equipments.toString().includes(term);
          const anomalyMatch = deliverable.anomalies && deliverable.anomalies.toString().includes(term);
          return equipmentMatch || anomalyMatch;
        }
      );
    }

    setFilteredDeliverables(result);
  };
  const loadDeliverables = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (selectedClient !== 'all') {
        params.client_id = selectedClient;
      }
      
      const response = await apiService.getDeliverables(params);
      const deliverablesData = response.deliverables || [];
      
      // Transform data to match component expectations
      const transformedDeliverables = deliverablesData.map((deliverable: any) => ({
        id: deliverable.id,
        title: deliverable.title,
        client: deliverable.client_name,
        site: deliverable.site_name,
        period: `${new Date(deliverable.period_start).toLocaleDateString('fr-FR')} - ${new Date(deliverable.period_end).toLocaleDateString('fr-FR')}`,
        status: deliverable.status,
        equipments: deliverable.equipment_count,
        anomalies: deliverable.anomaly_count,
        generatedDate: deliverable.generated_at ? new Date(deliverable.generated_at).toLocaleDateString('fr-FR') : null,
        sentDate: deliverable.sent_at ? new Date(deliverable.sent_at).toLocaleDateString('fr-FR') : null
      }));
      
      setDeliverables(transformedDeliverables);
      
    } catch (error) {
      console.error('Error loading deliverables:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generated': return 'Généré';
      case 'sent': return 'Envoyé';
      case 'in_progress': return 'En cours';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleGenerateReport = () => {
    setShowGenerateModal(true);
  };

  const handleSaveReport = async (reportData: any) => {
    try {
      console.log('Generating report:', reportData);
      // Ici on appellerait l'API pour générer le rapport
      await loadDeliverables();
      alert('Rapport généré avec succès !');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erreur lors de la génération du rapport');
    }
  };

  const handleDownload = async (deliverableId: string, type: 'pdf' | 'excel') => {
    try {
      // In a real implementation, this would trigger a file download
      console.log(`Downloading ${type} for deliverable ${deliverableId}`);
      alert(`Téléchargement du fichier ${type.toUpperCase()} en cours...`);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const filterOptions = [
    { field: 'title', label: 'Titre', type: 'text' as const },
    { field: 'client', label: 'Client', type: 'text' as const },
    { field: 'site', label: 'Site', type: 'text' as const },
    { field: 'status', label: 'Statut', type: 'select' as const, options: [
      { value: 'in_progress', label: 'En cours' },
      { value: 'generated', label: 'Généré' },
      { value: 'sent', label: 'Envoyé' }
    ]},
    { field: 'equipments', label: 'Nombre d\'équipements', type: 'number' as const },
    { field: 'anomalies', label: 'Nombre d\'anomalies', type: 'number' as const },
  ];

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livrables Audits</h1>
          <p className="text-gray-600">Rapports générés automatiquement</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Générer nouveau rapport</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 relative min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un rapport..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {filteredDeliverables.length} résultat(s)
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-gray-500" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les clients</option>
              <option value="abc">Groupe Industriel ABC</option>
              <option value="xyz">Société XYZ</option>
            </select>
          </div>
          <button 
            onClick={() => setShowAdvancedFilters(true)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              advancedFilters.length > 0 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtres {advancedFilters.length > 0 && `(${advancedFilters.length})`}</span>
          </button>
        </div>
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDeliverables.map((deliverable) => (
          <div key={deliverable.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{deliverable.title}</h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(deliverable.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deliverable.status)}`}>
                    {getStatusText(deliverable.status)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{deliverable.client}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Site:</span>
                  <span className="font-medium">{deliverable.site}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Période:</span>
                  <span className="font-medium">{deliverable.period}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Équipements:</span>
                  <span className="font-medium">{deliverable.equipments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Anomalies:</span>
                  <span className="font-medium text-red-600">{deliverable.anomalies}</span>
                </div>
              </div>

              {deliverable.generatedDate && (
                <p className="text-xs text-gray-500 mb-4">
                  Généré le {deliverable.generatedDate}
                  {deliverable.sentDate && ` • Envoyé le ${deliverable.sentDate}`}
                </p>
              )}

              {/* Export Buttons */}
              <div className="space-y-2">
                <button 
                  onClick={() => handleDownload(deliverable.id, 'pdf')}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                  disabled={deliverable.status === 'in_progress'}
                >
                  <Download className="w-4 h-4" />
                  <span>Rapport PDF synthétique</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleDownload(deliverable.id, 'excel')}
                    className="bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1 text-xs"
                    disabled={deliverable.status === 'in_progress'}
                  >
                    <Download className="w-3 h-3" />
                    <span>Excel équipements</span>
                  </button>
                  <button 
                    onClick={() => handleDownload(deliverable.id, 'excel')}
                    className="bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-1 text-xs"
                    disabled={deliverable.status === 'in_progress'}
                  >
                    <Download className="w-3 h-3" />
                    <span>Actions/Anomalies</span>
                  </button>
                </div>
              </div>

              {/* Preview Button */}
              <button className="w-full mt-3 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm">
                <Eye className="w-4 h-4" />
                <span>Aperçu</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDeliverables.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || advancedFilters.length > 0 ? 'Aucun résultat' : 'Aucun livrable trouvé'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || advancedFilters.length > 0 
              ? 'Essayez de modifier vos critères de recherche' 
              : 'Générez votre premier rapport d\'audit'
            }
          </p>
        </div>
      )}

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={setAdvancedFilters}
        filterOptions={filterOptions}
      />

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <GenerateReportModal
          onClose={() => setShowGenerateModal(false)}
          onSave={handleSaveReport}
        />
      )}
    </div>
  );
};

export default Deliverables;