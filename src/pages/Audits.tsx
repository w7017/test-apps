import React, { useState } from 'react';
import { useEffect } from 'react';
import { apiService } from '../services/api';
import { intelligentSearch, debounce, AdvancedFilter, applyAdvancedFilters } from '../utils/searchUtils';
import AdvancedFilters from '../components/AdvancedFilters';
import { 
  Search, 
  Filter,
  Plus,
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Wrench
} from 'lucide-react';
import AuditModal from '../components/AuditModal';

const Audits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEquipments, setFilteredEquipments] = useState<any[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([
    { id: 'all', name: 'Tous les domaines' }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [equipments, searchTerm, selectedDomain, advancedFilters]);

  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const applyFiltersAndSearch = () => {
    let result = [...equipments];

    // Filtrer par domaine
    if (selectedDomain !== 'all') {
      result = result.filter(eq => 
        eq.domain.toLowerCase().includes(selectedDomain.toLowerCase())
      );
    }

    // Appliquer les filtres avancés
    if (advancedFilters.length > 0) {
      result = applyAdvancedFilters(result, advancedFilters);
    }

    // Appliquer la recherche intelligente
    if (searchTerm && searchTerm.length >= 2) {
      const searchKeys = [
        'reference',
        'type',
        'location',
        'domain',
        'anomaly'
      ];

      result = intelligentSearch(
        result,
        searchTerm,
        searchKeys,
        (equipment, term) => {
          // Recherche personnalisée pour les dates
          const lastAuditMatch = equipment.lastAudit && equipment.lastAudit.includes(term);
          const statusMatch = equipment.status && equipment.status.includes(term);
          return lastAuditMatch || statusMatch;
        }
      );
    }

    setFilteredEquipments(result);
  };
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load technical domains
      const domainsResponse = await apiService.getTechnicalDomains();
      const domainsData = [
        { id: 'all', name: 'Tous les domaines' },
        ...domainsResponse.map((domain: any) => ({
          id: domain.id,
          name: domain.name
        }))
      ];
      setDomains(domainsData);
      
      // Load equipment with audit information
      const equipmentResponse = await apiService.getEquipment({ limit: 100 });
      const equipmentData = equipmentResponse.equipment || [];
      
      // Transform equipment data to match component expectations
      const transformedEquipment = equipmentData.map((eq: any) => ({
        id: eq.id,
        reference: eq.reference,
        domain: eq.domain_name || 'N/A',
        type: eq.type,
        location: `${eq.site_name} - ${eq.building_name}${eq.location ? ` - ${eq.location}` : ''}`,
        lastAudit: eq.last_audit_date ? new Date(eq.last_audit_date).toLocaleDateString('fr-FR') : 'Jamais',
        status: eq.last_audit_status || 'audit_due',
        anomaly: getAnomalyText(eq.last_audit_status),
        nextMaintenance: eq.next_maintenance_date ? new Date(eq.next_maintenance_date).toLocaleDateString('fr-FR') : 'À définir',
        image: getEquipmentImage(eq.type)
      }));
      
      setEquipments(transformedEquipment);
      
    } catch (error) {
      console.error('Error loading audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnomalyText = (status: string) => {
    switch (status) {
      case 'ok': return 'Aucune';
      case 'warning': return 'À surveiller';
      case 'critical': return 'Anomalie critique';
      default: return 'À auditer';
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'audit_due': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'audit_due': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleAudit = (equipment: any) => {
    setSelectedEquipment(equipment);
    setShowAuditModal(true);
  };

  const filterOptions = [
    { field: 'reference', label: 'Référence', type: 'text' as const },
    { field: 'domain', label: 'Domaine', type: 'select' as const, options: domains.map(d => ({ value: d.name, label: d.name })) },
    { field: 'status', label: 'Statut', type: 'select' as const, options: [
      { value: 'ok', label: 'Conforme' },
      { value: 'warning', label: 'À surveiller' },
      { value: 'critical', label: 'Critique' },
      { value: 'audit_due', label: 'Audit dû' }
    ]},
    { field: 'lastAudit', label: 'Dernier audit', type: 'date' as const },
    { field: 'type', label: 'Type d\'équipement', type: 'text' as const },
  ];

  const hasAuditDetails = (equipment: any) => {
    return equipment.lastAudit && equipment.lastAudit !== 'Jamais';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relevés & Audits</h1>
          <p className="text-gray-600">Gestion des audits d'équipements techniques</p>
        </div>
        <button 
          onClick={() => setShowAuditModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Créer équipement + auditer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par référence ou localisation..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {filteredEquipments.length} résultat(s)
              </div>
            )}
          </div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {domains.map(domain => (
              <option key={domain.id} value={domain.id}>{domain.name}</option>
            ))}
          </select>
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

      {/* Equipment Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredEquipments.length === 0 ? (
          <div className="p-8 text-center">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || advancedFilters.length > 0 ? 'Aucun résultat' : 'Aucun équipement trouvé'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || advancedFilters.length > 0 || selectedDomain !== 'all'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter des équipements à auditer'
              }
            </p>
            <button 
              onClick={() => setShowAuditModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Créer un équipement
            </button>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domaine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier audit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Anomalie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipments.map((equipment) => (
                <tr key={equipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={equipment.image} 
                        alt={equipment.reference}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=200';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{equipment.reference}</div>
                      <div className="text-sm text-gray-500">{equipment.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {equipment.domain}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {equipment.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {equipment.lastAudit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(equipment.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(equipment.status)}`}>
                        {equipment.status === 'ok' ? 'Conforme' : 
                         equipment.status === 'warning' ? 'À surveiller' :
                         equipment.status === 'critical' ? 'Critique' : 'Audit dû'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {equipment.anomaly}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button 
                      onClick={() => handleAudit(equipment)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors transform hover:scale-105"
                    >
                      Auditer
                    </button>
                    <button 
                      className={`${hasAuditDetails(equipment) ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                      disabled={!hasAuditDetails(equipment)}
                      title={hasAuditDetails(equipment) ? 'Voir les détails de l\'audit' : 'Aucun audit disponible'}
                    >
                      {hasAuditDetails(equipment) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={setAdvancedFilters}
        filterOptions={filterOptions}
      />

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
    </div>
  );
};

export default Audits;