import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  FileText,
  Upload,
  Search
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [stats, setStats] = useState({
    cvc: 0,
    cfo: 0,
    electrical: 0,
    plumbing: 0,
  });
  const [auditStats, setAuditStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [criticalAnomalies, setCriticalAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load equipment stats by domain
      const equipmentResponse = await apiService.getEquipment({ limit: 1000 });
      const equipment = equipmentResponse.equipment || [];
      
      const domainStats = equipment.reduce((acc: any, eq: any) => {
        const domain = eq.domain_name?.toLowerCase() || 'other';
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {});

      setStats({
        cvc: domainStats.cvc || 0,
        cfo: domainStats['cfo/cfa'] || domainStats.cfo || 0,
        electrical: domainStats['électricité'] || domainStats.electrical || 0,
        plumbing: domainStats.plomberie || domainStats.plumbing || 0,
      });

      // Load audit stats
      const auditStatsResponse = await apiService.getAuditStats();
      setAuditStats(auditStatsResponse);

      // Load recent audits for alerts and anomalies
      const auditsResponse = await apiService.getAudits({ limit: 50 });
      const audits = auditsResponse.audits || [];
      
      // Generate alerts from overdue audits
      const now = new Date();
      const alertsData = audits
        .filter((audit: any) => {
          const auditDate = new Date(audit.audit_date);
          const daysDiff = Math.floor((now.getTime() - auditDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff > 30; // Consider overdue if more than 30 days
        })
        .slice(0, 3)
        .map((audit: any) => ({
          type: 'Audit en retard',
          equipment: audit.equipment_reference,
          site: audit.site_name,
          days: Math.floor((now.getTime() - new Date(audit.audit_date).getTime()) / (1000 * 60 * 60 * 24))
        }));
      
      setAlerts(alertsData);

      // Get critical anomalies
      const criticalAudits = audits
        .filter((audit: any) => audit.overall_status === 'critical')
        .slice(0, 3)
        .map((audit: any) => ({
          equipment: audit.equipment_reference,
          anomaly: audit.notes || 'Anomalie critique détectée',
          severity: 'Critique',
          site: audit.site_name
        }));
      
      setCriticalAnomalies(criticalAudits);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAuditerEquipement = () => {
    navigate('/audits');
  };

  const handleImporterEquipements = () => {
    if (hasRole(['administrator', 'supervisor'])) {
      navigate('/data-management');
    } else {
      navigate('/audits');
    }
  };

  const handleGenererLivrable = () => {
    navigate('/deliverables');
  };

  const statsCards = [
    { title: 'Équipements CVC', value: stats.cvc.toString(), icon: Wrench, color: 'bg-blue-500' },
    { title: 'CFO/CFA', value: stats.cfo.toString(), icon: Wrench, color: 'bg-green-500' },
    { title: 'Électricité', value: stats.electrical.toString(), icon: Wrench, color: 'bg-yellow-500' },
    { title: 'Plomberie', value: stats.plumbing.toString(), icon: Wrench, color: 'bg-purple-500' },
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de votre parc d'équipements</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 transform hover:scale-105 active:scale-95"
            onClick={handleAuditerEquipement}
          >
            <Search className="w-4 h-4" />
            <span>Auditer un équipement</span>
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 transform hover:scale-105 active:scale-95"
            onClick={handleImporterEquipements}
          >
            <Upload className="w-4 h-4" />
            <span>Importer équipements</span>
          </button>
          <button
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 transform hover:scale-105 active:scale-95"
            onClick={handleGenererLivrable}
          >
            <FileText className="w-4 h-4" />
            <span>Générer livrable</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alertes</h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune alerte</p>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900">{alert.type}</p>
                    <p className="text-sm text-red-700">{alert.equipment} - {alert.site}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">{alert.days}j</p>
                    <p className="text-xs text-red-500">de retard</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Graphique taux d'audit */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Taux d'audit par site</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Siège Social</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${auditStats?.total_audits ? Math.min(85, (auditStats.ok_count / auditStats.total_audits) * 100) : 0}%` }}></div>
                </div>
                <span className="text-sm font-medium">
                  {auditStats?.total_audits ? Math.round((auditStats.ok_count / auditStats.total_audits) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Usine Nord</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${auditStats?.total_audits ? Math.min(67, (auditStats.warning_count / auditStats.total_audits) * 100) : 0}%` }}></div>
                </div>
                <span className="text-sm font-medium">
                  {auditStats?.total_audits ? Math.round((auditStats.warning_count / auditStats.total_audits) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bâtiment B</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${auditStats?.total_audits ? Math.min(45, (auditStats.critical_count / auditStats.total_audits) * 100) : 0}%` }}></div>
                </div>
                <span className="text-sm font-medium">
                  {auditStats?.total_audits ? Math.round((auditStats.critical_count / auditStats.total_audits) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Anomalies Critiques */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 des anomalies critiques</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-sm font-medium text-gray-600">Équipement</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Anomalie</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Sévérité</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Site</th>
                <th className="text-left py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {criticalAnomalies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Aucune anomalie critique
                  </td>
                </tr>
              ) : (
                criticalAnomalies.map((anomaly, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium text-gray-900">{anomaly.equipment}</td>
                    <td className="py-3 text-sm text-gray-600">{anomaly.anomaly}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        anomaly.severity === 'Critique' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {anomaly.severity}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{anomaly.site}</td>
                    <td className="py-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Traiter
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;