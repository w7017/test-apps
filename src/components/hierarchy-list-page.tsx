'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PlusCircle,
  Edit,
  Trash2,
  Building,
  Layers,
  DoorOpen,
  Server,
  Home,
  Search,
  Eye,
  Loader2,
  MapPin,
  Download,
} from 'lucide-react';

const HIERARCHY_CONFIG = {
  sites: {
    title: 'Sites',
    singular: 'Site',
    icon: Home,
    apiEndpoint: '/api/sites',
    columns: ['Image', 'Nom', 'Adresse', 'Code Client', 'Code Affaire', 'Code Contrat', 'Bâtiments', 'Actions'],
  },
  batiments: {
    title: 'Bâtiments',
    singular: 'Bâtiment',
    icon: Building,
    apiEndpoint: '/api/buildings',
    columns: ['Image', 'Nom', 'Site', 'Niveaux', 'Actions'],
  },
  niveaux: {
    title: 'Niveaux',
    singular: 'Niveau',
    icon: Layers,
    apiEndpoint: '/api/levels',
    columns: ['Image', 'Nom', 'Bâtiment', 'Site', 'Locaux', 'Actions'],
  },
  locaux: {
    title: 'Locaux',
    singular: 'Local',
    icon: DoorOpen,
    apiEndpoint: '/api/locations',
    columns: ['Image', 'Nom', 'Niveau', 'Bâtiment', 'Site', 'Équipements', 'Actions'],
  },
  equipements: {
    title: 'Équipements',
    singular: 'Équipement',
    icon: Server,
    apiEndpoint: '/api/equipments',
    columns: ['Image', 'Code', 'Libellé', 'Type', 'Marque', 'Statut', 'Local', 'Actions'],
  },
};

function SiteFormDialog({ site, onSave, trigger, selectedClient }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    codeClient: '',
    codeAffaire: '',
    codeContrat: '',
    image: '',
  });
  const [error, setError] = useState('');
  const isEditing = !!site;

  useEffect(() => {
    if (isOpen && site) {
      setFormData({
        name: site.name || '',
        address: site.address || '',
        codeClient: site.codeClient || '',
        codeAffaire: site.codeAffaire || '',
        codeContrat: site.codeContrat || '',
        image: site.image || '',
      });
    } else if (isOpen && !site) {
      setFormData({
        name: '',
        address: '',
        codeClient: '',
        codeAffaire: '',
        codeContrat: '',
        image: '',
      });
    }
  }, [site, isOpen]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Le nom est requis.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        clientId: selectedClient?.id,
      };

      let response;
      if (isEditing) {
        response = await fetch(`/api/sites/${site.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save site');
      }

      const savedSite = await response.json();
      onSave(savedSite);
      setIsOpen(false);
    } catch (error : any) {
      console.error('Error saving site:', error);
      setError(error?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Modifier' : 'Ajouter'} un Site
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du site *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ex: Site de Production Alpha"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="123 Rue de la Production, 75001 Paris"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code Client</label>
                  <input
                    type="text"
                    value={formData.codeClient}
                    onChange={(e) => setFormData({ ...formData, codeClient: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="CLI-001"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Code Affaire</label>
                  <input
                    type="text"
                    value={formData.codeAffaire}
                    onChange={(e) => setFormData({ ...formData, codeAffaire: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="AFF-2024-001"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Code Contrat</label>
                <input
                  type="text"
                  value={formData.codeContrat}
                  onChange={(e) => setFormData({ ...formData, codeContrat: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="CTR-2024-001"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DeleteConfirmDialog({ item, itemType, onDelete, trigger } : any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await onDelete(item.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
      }}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirmer la suppression</h2>
            
            <p className="text-sm text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer "<span className="font-medium">{item?.name || item?.libelle}</span>" ?
              <span className="block mt-2 font-medium">Cette action est irréversible.</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function HierarchyListPage({ listType, selectedClient } : any) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const config = HIERARCHY_CONFIG[listType];
  const IconComponent = config?.icon || Home;

  useEffect(() => {
    if (selectedClient) {
      fetchItems();
    }
  }, [selectedClient, listType]);

  const fetchItems = async () => {
    if (!selectedClient) return;
    
    setLoading(true);
    try {
      const endpoint = listType === 'sites' 
        ? `/api/sites/client/${selectedClient.id}`
        : `${config.apiEndpoint}/client/${selectedClient.id}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch items');
      
      const data = await response.json();
      console.log(data)
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item : any) => {
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = 
        (item.name?.toLowerCase() || '').includes(searchLower) ||
        (item.libelle?.toLowerCase() || '').includes(searchLower) ||
        (item.code?.toLowerCase() || '').includes(searchLower) ||
        (item.codeClient?.toLowerCase() || '').includes(searchLower) ||
        (item.codeAffaire?.toLowerCase() || '').includes(searchLower);
      
      const statusMatch = statusFilter === 'all' || item.statut === statusFilter;
      
      return searchMatch && statusMatch;
    });
  }, [items, searchTerm, statusFilter]);

  const handleDelete = async (itemId : any) => {
    const response = await fetch(`${config.apiEndpoint}/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete');
    }
    
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSave = (savedItem : any) => {
    const existingIndex = items.findIndex(item => item.id === savedItem.id);
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex] = savedItem;
      setItems(updatedItems);
    } else {
      setItems([...items, savedItem]);
    }
  };

  const exportToCSV = () => {
    const headers = config.columns.filter((col : any) => col !== 'Image' && col !== 'Actions').join(',');
    const rows = filteredItems.map(item => {
      if (listType === 'sites') {
        return `${item.name},"${item.address || ''}","${item.codeClient || ''}","${item.codeAffaire || ''}","${item.codeContrat || ''}",${item.buildings?.length || 0}`;
      }
      return item.name;
    });
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.title.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!selectedClient) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">
            Veuillez sélectionner un client pour voir la liste des {config?.title?.toLowerCase()}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IconComponent className="h-6 w-6" />
            {config.title}
          </h2>
          <p className="text-gray-600">
            Liste des {config.title.toLowerCase()} pour {selectedClient.name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
          {listType === 'sites' && (
            <SiteFormDialog
              site={null}
              onSave={handleSave}
              selectedClient={selectedClient}
              trigger={
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Ajouter un {config.singular}
                </button>
              }
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder={`Rechercher des ${config.title.toLowerCase()}...`}
                className="w-full pl-8 pr-3 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {listType === 'equipements' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Tous les statuts</option>
                <option value="En service">En service</option>
                <option value="Alerte">Alerte</option>
                <option value="Hors service">Hors service</option>
                <option value="En veille">En veille</option>
              </select>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {config.columns.map((col, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-left text-sm font-medium text-gray-700 ${
                          col === 'Actions' ? 'text-right' : ''
                        }`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Image
                          src={item.image || item.photoUrl || 'https://placehold.co/60'}
                          alt={item.name || item.libelle}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      </td>
                      
                      {listType === 'sites' && (
                        <>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {item.address || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{item.codeClient || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.codeAffaire || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.codeContrat || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.buildings?.length || 0}</td>
                        </>
                      )}
                      
                      {listType === 'batiments' && (
                        <>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-sm">{item.site?.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.levels?.length || 0}</td>
                        </>
                      )}

                      {listType === 'niveaux' && (
                        <>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-sm">{item.building?.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.building?.site?.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.locations?.length || 0}</td>
                        </>
                      )}
                      
                      {listType === 'locaux' && (
                        <>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-sm">{item.level?.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.level?.building?.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.level?.building?.site?.name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.equipments?.length || 0}</td>
                        </>
                      )}
                      
                      {listType === 'equipements' && (
                        <>
                          <td className="px-4 py-3 font-mono text-sm">{item.code}</td>
                          <td className="px-4 py-3 font-medium">{item.libelle}</td>
                          <td className="px-4 py-3 text-sm">{item.typeEquipement || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.marque || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                item.statut === 'En service'
                                  ? 'bg-green-100 text-green-800'
                                  : item.statut === 'Alerte'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.location?.name || '-'}
                          </td>
                        </>
                      )}
                      
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={
                            listType === 'sites' 
                              ? `/parc/arborescence/${item.id}`
                              : listType === 'batiments'
                              ? `/parc/arborescence/${item.siteId}/${item.id}`
                              : listType === 'niveaux'
                              ? `/parc/arborescence/${item.building?.site?.id || item.building?.siteId}/${item.buildingId}/${item.id}`
                              : listType === 'locaux'
                              ? `/parc/arborescence/${item.level?.building?.site?.id || item.level?.building?.siteId}/${item.level?.buildingId}/${item.levelId}/${item.id}`
                              : `/parc/arborescence/${item.id}`
                          }>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Consulter">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          {listType === 'sites' && (
                            <SiteFormDialog
                              site={item}
                              onSave={handleSave}
                              selectedClient={selectedClient}
                              trigger={
                                <button className="p-2 hover:bg-gray-100 rounded" title="Modifier">
                                  <Edit className="w-4 h-4" />
                                </button>
                              }
                            />
                          )}
                          <DeleteConfirmDialog
                            item={item}
                            itemType={config.singular}
                            onDelete={handleDelete}
                            trigger={
                              <button className="p-2 hover:bg-gray-100 rounded text-red-600" title="Supprimer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <IconComponent className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Aucun {config.singular.toLowerCase()} trouvé
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Statistiques</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-3xl font-bold">{filteredItems.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          {listType === 'equipements' && (
            <>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {filteredItems.filter(i => i.statut === 'En service').length}
                </div>
                <div className="text-sm text-gray-600">En service</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {filteredItems.filter(i => i.statut === 'Alerte').length}
                </div>
                <div className="text-sm text-gray-600">En alerte</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {filteredItems.filter(i => i.statut === 'Hors service').length}
                </div>
                <div className="text-sm text-gray-600">Hors service</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}