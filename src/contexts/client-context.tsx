'use client';

import React, { createContext, useState, useEffect } from 'react';

export interface Client {
  id: string;
  name: string;
  description: string;
}

interface ClientContextType {
  clients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
}

const mockClients: Client[] = [
  { id: 'client-1', name: 'Client Alpha', description: 'Grand compte industriel avec plusieurs sites de production.' },
  { id: 'client-2', name: 'Client Bravo', description: 'Réseau de boutiques dans le secteur du retail.' },
  { id: 'client-3', name: 'Client Charlie', description: 'Gestionnaire de parc immobilier de bureaux.' },
    { id: 'client-4', name: 'Client Delta', description: 'Hôpital et centre de recherche médicale.' },
];

export const ClientContext = createContext<ClientContextType>({
  clients: [],
  selectedClient: null,
  setSelectedClient: () => {},
});

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClientState] = useState<Client | null>(null);

  useEffect(() => {
    const storedClientId = localStorage.getItem('selectedClientId');
    if (storedClientId) {
      const client = clients.find(c => c.id === storedClientId);
      setSelectedClientState(client || null);
    } else if (clients.length > 0) {
      // Select the first client by default if none is stored
      setSelectedClientState(clients[0]);
      localStorage.setItem('selectedClientId', clients[0].id);
    }
  }, [clients]);

  const setSelectedClient = (client: Client | null) => {
    setSelectedClientState(client);
    if (client) {
      localStorage.setItem('selectedClientId', client.id);
    } else {
      localStorage.removeItem('selectedClientId');
    }
  };

  return (
    <ClientContext.Provider value={{ clients, selectedClient, setSelectedClient }}>
      {children}
    </ClientContext.Provider>
  );
};
