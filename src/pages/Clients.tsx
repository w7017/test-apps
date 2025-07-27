import React, { useState } from 'react';
import { useClient } from '../contexts/ClientContext';
import { apiService } from '../services/api';
import { Trash2, Eye, Pencil } from 'lucide-react';

const Clients = () => {
  const { selectedClient, setSelectedClient, clients, refreshClients } = useClient();
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    logo: '',
    address: '',
    contacts: [{ name: '', email: '' }],
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState<null | number>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  React.useEffect(() => {
    if (logoFile) {
      const reader = new FileReader();
      reader.onload = e => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(logoFile);
    } else {
      setLogoPreview(null);
    }
  }, [logoFile]);

  React.useEffect(() => {
    if (editLogoFile) {
      const reader = new FileReader();
      reader.onload = e => {
        setEditLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(editLogoFile);
    } else {
      setEditLogoPreview(null);
    }
  }, [editLogoFile]);

  const handleAddContact = () => {
    setForm(f => ({ ...f, contacts: [...f.contacts, { name: '', email: '' }] }));
  };
  const handleRemoveContact = (idx: number) => {
    setForm(f => ({ ...f, contacts: f.contacts.filter((_, i) => i !== idx) }));
  };

  const handleContactChange = (idx: number, field: 'name' | 'email', value: string) => {
    setForm(f => ({
      ...f,
      contacts: f.contacts.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/png') {
      setLogoFile(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
      if (file) alert('Le logo doit être un fichier PNG.');
    }
  };

  // --- Edition ---
  const handleEditContactChange = (idx: number, field: 'name' | 'email', value: string) => {
    setEditForm((f: any) => ({
      ...f,
      contacts: f.contacts.map((c: any, i: number) => i === idx ? { ...c, [field]: value } : c)
    }));
  };
  const handleEditAddContact = () => {
    setEditForm((f: any) => ({ ...f, contacts: [...f.contacts, { name: '', email: '' }] }));
  };
  const handleEditRemoveContact = (idx: number) => {
    setEditForm((f: any) => ({ ...f, contacts: f.contacts.filter((_: any, i: number) => i !== idx) }));
  };
  const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/png') {
      setEditLogoFile(file);
    } else {
      setEditLogoFile(null);
      setEditLogoPreview(null);
      if (file) alert('Le logo doit être un fichier PNG.');
    }
  };

  const handleEdit = (client: any) => {
    setEditMode(true);
    setEditForm({
      id: client.id,
      name: client.name,
      logo: client.logo,
      address: client.address,
      contacts: client.contacts ? [...client.contacts] : [{ name: '', email: '' }],
    });
    setEditLogoFile(null);
    setEditLogoPreview(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    let logoData = editForm.logo;
    try {
      if (editLogoFile) {
        const reader = new FileReader();
        logoData = await new Promise<string>((resolve, reject) => {
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(editLogoFile);
        });
      }
      await apiService.updateClient(editForm.id.toString(), {
        name: editForm.name,
        logo: logoData,
        address: editForm.address,
        contacts: editForm.contacts,
      });
      setEditMode(false);
      setEditForm(null);
      setEditLogoFile(null);
      setEditLogoPreview(null);
      await refreshClients();
    } catch (err) {
      setEditError("Erreur lors de la modification du client");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let logoData = form.logo;
    try {
      if (logoFile) {
        const reader = new FileReader();
        logoData = await new Promise<string>((resolve, reject) => {
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        });
      }
      await apiService.createClient({
        name: form.name,
        logo: logoData,
        address: form.address,
        contacts: form.contacts,
      });
      setShowAddClientModal(false);
      setForm({ name: '', logo: '', address: '', contacts: [{ name: '', email: '' }] });
      setLogoFile(null);
      setLogoPreview(null);
      await refreshClients();
    } catch (err) {
      setError("Erreur lors de l'ajout du client");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: number) => {
    if (!window.confirm('Supprimer ce client ? Cette action est irréversible.')) return;
    try {
      await apiService.deleteClient(clientId.toString());
      await refreshClients();
    } catch (err) {
      alert('Erreur lors de la suppression du client');
    }
  };

  const clientDetails = clients.find(c => c.id === showDetails);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowAddClientModal(true)}
        >
          Ajouter un client
        </button>
      </div>
      <AddClientModal
        show={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        form={form}
        setForm={setForm}
        logoFile={logoFile}
        setLogoFile={setLogoFile}
        logoPreview={logoPreview}
        setLogoPreview={setLogoPreview}
        handleAddContact={handleAddContact}
        handleRemoveContact={handleRemoveContact}
        handleContactChange={handleContactChange}
        handleLogoChange={handleLogoChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clients.map(client => {
          const isSelected = selectedClient && selectedClient.id === client.id;
          return (
            <div key={client.id} className="card-3d-hover bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto flex flex-col justify-between">
              {/* Header */}
              <header className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {client.logo && client.logo.startsWith('data:') ? (
                        <img src={client.logo} alt="logo" className="w-12 h-12 object-contain rounded-full" />
                      ) : (
                        <span className="text-4xl text-gray-500">🏢</span>
                      )}
                    </div>
                    {/* Green online status indicator */}
                    {isSelected && (
                      <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">{client.name}</h1>
                    {client.address && (
                      <p className="text-sm text-gray-500 mt-1">{client.address}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    title="Éditer"
                    onClick={() => handleEdit(client)}
                    className="text-yellow-700 hover:text-yellow-900 p-1"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    title="Supprimer"
                    onClick={() => handleDelete(client.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </header>
              {/* Contact Section */}
              <section className="py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Contact</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  {/* Affichage contacts - priorité aux champs individuels */}
                  {(client.contact_name || client.contact_email || client.contact_phone) ? (
                    <>
                      {client.contact_name && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-500 mr-3">person</span>
                          <span>{client.contact_name}</span>
                        </div>
                      )}
                      {client.contact_email && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-500 mr-3">email</span>
                          <span>{client.contact_email}</span>
                        </div>
                      )}
                      {client.contact_phone && (
                        <div className="flex items-center">
                          <span className="material-icons text-gray-500 mr-3">phone</span>
                          <span>{client.contact_phone}</span>
                        </div>
                      )}
                    </>
                  ) : client.contacts && client.contacts.length > 0 ? (
                    client.contacts.map((contact, index) => (
                      <div key={index}>
                        <div className="flex items-center">
                          <span className="material-icons text-gray-500 mr-3">person</span>
                          <span>{contact.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="material-icons text-gray-500 mr-3">email</span>
                          <span>{contact.email}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 italic">Aucun contact</div>
                  )}
                  {/* Affichage adresse */}
                  {client.address && (
                    <div className="flex items-start">
                      <span className="font-semibold mr-2">Lieux :</span>
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>
              </section>
              {/* Stats Section */}
              <section className="py-4 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{client.site_count || 0}</p>
                    <p className="text-sm text-gray-500">Sites</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{client.building_count || 0}</p>
                    <p className="text-sm text-gray-500">Bâtiments</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{client.equipment_count || 0}</p>
                    <p className="text-sm text-gray-500">Équipements</p>
                  </div>
                </div>
              </section>
              {/* Audit Progress Section */}
              <section className="py-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Audits</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600">En cours</span>
                      <span className="text-sm font-medium text-gray-800">5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '16%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600">Complétés</span>
                      <span className="text-sm font-medium text-gray-800">25</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-red-500">En retard</span>
                      <span className="text-sm font-medium text-red-500">2</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '4%' }}></div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Footer with Select Button */}
              <div className="pt-4">
                <button
                  onClick={() => setSelectedClient(client)}
                  className={`w-full font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out ${
                    isSelected
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isSelected ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white inline-block animate-pulse-grow"></span>
                      Client Sélectionné
                    </span>
                  ) : 'Sélectionner Client'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal détails client */}
      {showDetails && clientDetails && !editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setShowDetails(null)}>&times;</button>
            <div className="flex items-center gap-4 mb-4">
              {clientDetails.logo && clientDetails.logo.startsWith('data:') ? (
                <img src={clientDetails.logo} alt="logo" className="w-16 h-16 object-contain border rounded" />
              ) : (
                <span className="text-5xl">{clientDetails.logo}</span>
              )}
              <div>
                <div className="font-bold text-xl">{clientDetails.name}</div>
                <div className="text-gray-500">{clientDetails.address}</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="font-semibold mb-1">Contacts :</div>
              {clientDetails.contacts && clientDetails.contacts.length > 0 ? (
                <ul className="list-disc ml-6">
                  {clientDetails.contacts.map((c, i) => (
                    <li key={i}>{c.name} ({c.email})</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400">Aucun contact</div>
              )}
            </div>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => handleEdit(clientDetails)}>
              Modifier ce client
            </button>
          </div>
        </div>
      )}
      {/* Modal édition client */}
      {editMode && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => { setEditMode(false); setEditForm(null); }}>&times;</button>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <input
                  className="border px-2 py-1 rounded w-40"
                  placeholder="Nom du client"
                  value={editForm.name}
                  onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  className="border px-2 py-1 rounded w-64"
                  placeholder="Adresse"
                  value={editForm.address}
                  onChange={e => setEditForm((f: any) => ({ ...f, address: e.target.value }))}
                />
                <input
                  type="file"
                  accept="image/png"
                  className="border px-2 py-1 rounded w-48"
                  onChange={handleEditLogoChange}
                />
                {editLogoPreview ? (
                  <img src={editLogoPreview} alt="Aperçu logo" className="w-12 h-12 object-contain border rounded" />
                ) : editForm.logo && editForm.logo.startsWith('data:') ? (
                  <img src={editForm.logo} alt="logo" className="w-12 h-12 object-contain border rounded" />
                ) : (
                  <span className="text-4xl">{editForm.logo}</span>
                )}
              </div>
              <div>
                <div className="font-semibold mb-2">Contacts</div>
                {editForm.contacts.map((contact: any, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input
                      className="border px-2 py-1 rounded w-40"
                      placeholder="Nom du contact"
                      value={contact.name}
                      onChange={e => handleEditContactChange(idx, 'name', e.target.value)}
                      required
                    />
                    <input
                      className="border px-2 py-1 rounded w-56"
                      placeholder="Email du contact"
                      value={contact.email}
                      onChange={e => handleEditContactChange(idx, 'email', e.target.value)}
                      required
                    />
                    {editForm.contacts.length > 1 && (
                      <button type="button" className="text-red-600" onClick={() => handleEditRemoveContact(idx)}>-</button>
                    )}
                    {idx === editForm.contacts.length - 1 && (
                      <button type="button" className="text-green-600" onClick={handleEditAddContact}>+</button>
                    )}
                  </div>
                ))}
              </div>
              {editError && <div className="text-red-600">{editError}</div>}
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={editLoading}>
                {editLoading ? 'Modification...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal d'ajout de client
const AddClientModal = ({ show, onClose, onSubmit, loading, error, form, setForm, logoFile, setLogoFile, logoPreview, setLogoPreview, handleAddContact, handleRemoveContact, handleContactChange, handleLogoChange }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Ajouter un client</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input
            className="border px-2 py-1 rounded"
            placeholder="Nom du client"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="border px-2 py-1 rounded"
            placeholder="Adresse"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          />
          <input
            type="file"
            accept="image/png"
            className="border px-2 py-1 rounded"
            onChange={handleLogoChange}
          />
          {logoPreview && (
            <img src={logoPreview} alt="Aperçu logo" className="w-12 h-12 object-contain border rounded" />
          )}
          <div>
            <div className="font-semibold mb-2">Contacts</div>
            {form.contacts.map((contact, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  className="border px-2 py-1 rounded w-40"
                  placeholder="Nom du contact"
                  value={contact.name}
                  onChange={e => handleContactChange(idx, 'name', e.target.value)}
                  required
                />
                <input
                  className="border px-2 py-1 rounded w-56"
                  placeholder="Email du contact"
                  value={contact.email}
                  onChange={e => handleContactChange(idx, 'email', e.target.value)}
                  required
                />
                {form.contacts.length > 1 && (
                  <button type="button" className="text-red-600" onClick={() => handleRemoveContact(idx)}>-</button>
                )}
                {idx === form.contacts.length - 1 && (
                  <button type="button" className="text-green-600" onClick={handleAddContact}>+</button>
                )}
              </div>
            ))}
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Clients; 