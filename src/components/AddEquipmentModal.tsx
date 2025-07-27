import React, { useState, useEffect } from 'react';
import { X, Wrench, Save, Plus, Trash2, Camera, Upload, Zap } from 'lucide-react';
import { apiService } from '../services/api';

interface Equipment {
  reference: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  domain_id: string;
  maintenance_frequency: number;
  notes: string;
}

interface AddEquipmentModalProps {
  localId: string;
  localName: string;
  buildingId: string;
  onClose: () => void;
  onSave: (equipments: Equipment[]) => void;
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ 
  localId, 
  localName, 
  buildingId,
  onClose, 
  onSave 
}) => {
  const [equipments, setEquipments] = useState<Equipment[]>([
    { 
      reference: '', 
      type: '', 
      brand: '', 
      model: '', 
      serial_number: '', 
      domain_id: '', 
      maintenance_frequency: 365, 
      notes: '' 
    }
  ]);
  const [domains, setDomains] = useState<any[]>([]);
  const [ocrData, setOcrData] = useState<any>(null);
  const [processingOCR, setProcessingOCR] = useState(false);

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const domainsData = await apiService.getTechnicalDomains();
      setDomains(domainsData);
    } catch (error) {
      console.error('Error loading domains:', error);
    }
  };

  const handleEquipmentChange = (index: number, field: keyof Equipment, value: string | number) => {
    setEquipments(prev => prev.map((equipment, i) => 
      i === index ? { ...equipment, [field]: value } : equipment
    ));
  };

  const addEquipment = () => {
    setEquipments(prev => [...prev, { 
      reference: '', 
      type: '', 
      brand: '', 
      model: '', 
      serial_number: '', 
      domain_id: '', 
      maintenance_frequency: 365, 
      notes: '' 
    }]);
  };

  const removeEquipment = (index: number) => {
    if (equipments.length > 1) {
      setEquipments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleOCRUpload = async (event: React.ChangeEvent<HTMLInputElement>, equipmentIndex: number) => {
    const file = event.target.files?.[0];
    if (file) {
      setProcessingOCR(true);
      try {
        const response = await apiService.processOCR(file);
        
        if (response.success && response.extracted_data) {
          const extractedData = response.extracted_data;
          
          // Find domain by name
          const domain = domains.find(d => 
            d.name.toLowerCase().includes(extractedData.domain?.toLowerCase() || '')
          );
          
          setEquipments(prev => prev.map((equipment, i) => 
            i === equipmentIndex ? {
              ...equipment,
              brand: extractedData.brand || equipment.brand,
              model: extractedData.model || equipment.model,
              serial_number: extractedData.serial_number || equipment.serial_number,
              type: extractedData.type || equipment.type,
              domain_id: domain?.id || equipment.domain_id,
              reference: response.suggestions?.reference || equipment.reference
            } : equipment
          ));
          
          setOcrData(response);
        }
      } catch (error) {
        console.error('OCR processing failed:', error);
        alert('Erreur lors du traitement OCR. Veuillez réessayer.');
      } finally {
        setProcessingOCR(false);
      }
    }
  };

  const generateReference = (index: number) => {
    const equipment = equipments[index];
    const domain = domains.find(d => d.id === equipment.domain_id);
    const domainCode = domain?.code || 'EQ';
    const timestamp = Date.now().toString().slice(-6);
    const reference = `${domainCode}-${localName.replace(/\s+/g, '').toUpperCase()}-${timestamp}`;
    
    handleEquipmentChange(index, 'reference', reference);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validEquipments = equipments.filter(eq => eq.reference.trim() && eq.type.trim());
    if (validEquipments.length > 0) {
      onSave(validEquipments);
    }
  };

  const getDomainColor = (domainId: string) => {
    const domain = domains.find(d => d.id === domainId);
    return domain?.color || '#3B82F6';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ajouter des équipements</h2>
              <p className="text-gray-600">Local : {localName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Équipements */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-orange-900 flex items-center space-x-2">
                  <Wrench className="w-5 h-5" />
                  <span>Nouveaux équipements</span>
                </h3>
                <button
                  type="button"
                  onClick={addEquipment}
                  className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {equipments.map((equipment, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Équipement {index + 1}</h4>
                      {equipments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEquipment(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* OCR Section */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>OCR - Plaque signalétique</span>
                      </h5>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm">
                          <Camera className="w-4 h-4" />
                          <span>Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOCRUpload(e, index)}
                            className="hidden"
                            capture="environment"
                          />
                        </label>
                        <label className="flex items-center space-x-2 bg-gray-600 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors text-sm">
                          <Upload className="w-4 h-4" />
                          <span>Importer</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOCRUpload(e, index)}
                            className="hidden"
                          />
                        </label>
                        {processingOCR && (
                          <div className="text-blue-600 text-sm">Traitement en cours...</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Référence *
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={equipment.reference}
                            onChange={(e) => handleEquipmentChange(index, 'reference', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: CVC-LOC-001"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => generateReference(index)}
                            className="px-2 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                            title="Générer automatiquement"
                          >
                            Auto
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type d'équipement *
                        </label>
                        <input
                          type="text"
                          value={equipment.type}
                          onChange={(e) => handleEquipmentChange(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Centrale de traitement d'air"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Domaine technique *
                        </label>
                        <select
                          value={equipment.domain_id}
                          onChange={(e) => handleEquipmentChange(index, 'domain_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Sélectionner un domaine</option>
                          {domains.map(domain => (
                            <option key={domain.id} value={domain.id}>
                              {domain.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marque
                        </label>
                        <input
                          type="text"
                          value={equipment.brand}
                          onChange={(e) => handleEquipmentChange(index, 'brand', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: DAIKIN"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Modèle
                        </label>
                        <input
                          type="text"
                          value={equipment.model}
                          onChange={(e) => handleEquipmentChange(index, 'model', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: VRV-IV-S"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro de série
                        </label>
                        <input
                          type="text"
                          value={equipment.serial_number}
                          onChange={(e) => handleEquipmentChange(index, 'serial_number', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: ABC123456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fréquence maintenance (jours)
                        </label>
                        <select
                          value={equipment.maintenance_frequency}
                          onChange={(e) => handleEquipmentChange(index, 'maintenance_frequency', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={30}>30 jours (Mensuel)</option>
                          <option value={90}>90 jours (Trimestriel)</option>
                          <option value={180}>180 jours (Semestriel)</option>
                          <option value={365}>365 jours (Annuel)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={equipment.notes}
                          onChange={(e) => handleEquipmentChange(index, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          placeholder="Informations complémentaires..."
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
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Ajouter les équipements</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEquipmentModal;