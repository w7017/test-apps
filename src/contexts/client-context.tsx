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
  loading: boolean;
}

export const ClientContext = createContext<ClientContextType>({
  clients: [],
  selectedClient: null,
  setSelectedClient: () => {},
  loading: false,
});

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClientState] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();

        if (Array.isArray(data)) {
          setClients(data);

          const storedClientId = localStorage.getItem('selectedClientId');
          const storedClient = data.find((c) => c.id === storedClientId);

          if (storedClient) {
            setSelectedClientState(storedClient);
          } else if (data.length > 0) {
            setSelectedClientState(data[0]);
            localStorage.setItem('selectedClientId', data[0].id);
          }
        } else {
          console.error('API did not return an array:', data);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const setSelectedClient = (client: Client | null) => {
    setSelectedClientState(client);
    if (client) {
      localStorage.setItem('selectedClientId', client.id);
    } else {
      localStorage.removeItem('selectedClientId');
    }
  };

  return (
    <ClientContext.Provider value={{ clients, selectedClient, setSelectedClient, loading }}>
      {children}
    </ClientContext.Provider>
  );
};
