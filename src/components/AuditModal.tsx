import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  FileText
} from 'lucide-react';

interface AuditModalProps {
  equipment?: any;
  onClose: () => void;
}

const AuditModal: React.FC<AuditModalProps> = ({ equipment, onClose }) => {
  const [isNewEquipment, setIsNewEquipment] = useState(!equipment);
  const [ocrData, setOcrData] = useState<any>(null);
  const [formData, setFormData] = useState({
    reference: equipment?.reference || '',
    domain: equipment?.domain || '',
    type: equipment?.type || '',
    brand: '',
    model: '',
    serialNumber: '',
    location: equipment?.location || '',
    checklistItems: [
      { id: 1, item: 'État général', status: '', notes: '' },
      { id: 2, item: 'Fonctionnement', status: '', notes: '' },
      { id: 3, item: 'Sécurité', status: '', notes: '' },
      { id: 4, item: 'Maintenance', status: '', notes: '' },
    ]
  });

  const handleOCRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Real OCR processing
      processOCR(file);
    }
  };

  const processOCR = async (file: File) => {
    try {
      const response = await apiService.processOCR(file);
      
      if (response.success && response.extracted_data) {
        const extractedData = response.extracted_data;
        const ocrData = {
          brand: extractedData.brand,
          model: extractedData.model,
          serialNumber: extractedData.serial_number,
          domain: extractedData.domain,
          type: extractedData.type
        };
        
        setOcrData(ocrData);
        setFormData(prev => ({ 
          ...prev, 
          brand: ocrData.brand,
          model: ocrData.model,
          serialNumber: ocrData.serialNumber,
          domain: ocrData.domain,
          type: ocrData.type
        }));
        
        // Apply suggestions if available
        if (response.suggestions) {
          setFormData(prev => ({
            ...prev,
            reference: response.suggestions.reference || prev.reference,
            location: response.suggestions.location || prev.location
          }));
        }
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('Erreur lors du traitement OCR. Veuillez réessayer.');
    }
  };

  const handleStatusChange = (itemId: number, status: string) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map(item =>
        item.id === itemId ? { ...item, status } : item
      )
    }));
  };

  const handleNotesChange = (itemId: number, notes: string) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isNewEquipment) {
        // Create new equipment first
        const equipmentData = {
          reference: formData.reference,
          type: formData.type,
          brand: formData.brand,
          model: formData.model,
          serial_number: formData.serialNumber,
          location: formData.location,
          domain_id: formData.domain, // This would need to be mapped to actual domain ID
          building_id: null, // This would need to be selected
        };
        
        const newEquipment = await apiService.createEquipment(equipmentData);
        
        // Then create audit for the new equipment
        const auditData = {
          equipment_id: newEquipment.id,
          overall_status: getOverallStatus(),
          notes: getAuditNotes(),
          items: formData.checklistItems.map(item => ({
            item_name: item.item,
            status: item.status,
            notes: item.notes
          }))
        };
        
        await apiService.createAudit(auditData);
      } else {
        // Create audit for existing equipment
        const auditData = {
          equipment_id: equipment.id,
          overall_status: getOverallStatus(),
          notes: getAuditNotes(),
          items: formData.checklistItems.map(item => ({
            item_name: item.item,
            status: item.status,
            notes: item.notes
          }))
        };
        
        await apiService.createAudit(auditData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting audit:', error);
      alert('Erreur lors de la soumission de l\'audit. Veuillez réessayer.');
    }
  };

  const getOverallStatus = () => {
    const statuses = formData.checklistItems.map(item => item.status).filter(Boolean);
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'ok';
  };

  const getAuditNotes = () => {
    return formData.checklistItems
      .filter(item => item.notes)
      .map(item => `${item.item}: ${item.notes}`)
      .join('\n');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isNewEquipment ? 'Créer un équipement et auditer' : `Audit de ${equipment?.reference}`}
              </h2>
              <p className="text-gray-600">
                {isNewEquipment ? 'Utilisez l\'OCR pour pré-remplir automatiquement' : 'Checklist d\'audit rapide'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OCR Section pour nouvel équipement */}
            {isNewEquipment && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>OCR + IA - Plaque signalétique</span>
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <span>Prendre une photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOCRUpload}
                      className="hidden"
                      capture="environment"
                    />
                  </label>
                  <label className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Importer une image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleOCRUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {ocrData && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">✓ Données extraites automatiquement</p>
                  </div>
                )}
              </div>
            )}

            {/* Informations équipement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domaine
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="CVC">CVC</option>
                  <option value="CFO">CFO/CFA</option>
                  <option value="Électricité">Électricité</option>
                  <option value="Plomberie">Plomberie</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'équipement
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modèle
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de série
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Checklist d'audit */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Checklist d'audit</h3>
              <div className="space-y-4">
                {formData.checklistItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{item.item}</span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'ok')}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            item.status === 'ok' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                          }`}
                        >
                          ✓ Conforme
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'warning')}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            item.status === 'warning' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                          }`}
                        >
                          ⚠ À surveiller
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'critical')}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            item.status === 'critical' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                          }`}
                        >
                          ✗ Non conforme
                        </button>
                      </div>
                    </div>
                    <textarea
                      placeholder="Notes, observations, actions correctives..."
                      value={item.notes}
                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Photos de défauts */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Photos de défauts (optionnel)</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Ajoutez des photos pour documenter les défauts</p>
                <button
                  type="button"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Ajouter des photos
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Valider état de santé</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;