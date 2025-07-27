import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface Client {
  id: number;
  name: string;
  logo?: string;
  address?: string;
  contacts?: { name: string; email: string }[];
  site_count?: number;
  building_count?: number;
  equipment_count?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  sites?: any[];
  // autres champs si besoin
}

interface ClientContextType {
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  clients: Client[];
  refreshClients: () => Promise<void>;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedClient, setSelectedClientState] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = useCallback(async () => {
    try {
      // Load clients
      const clientsResponse = await apiService.getClients();
      const clientsData = clientsResponse.clients || [];
      
      // Load sites for each client and their buildings
      const clientsWithSites = await Promise.all(
        clientsData.map(async (client: any) => {
          try {
            const sitesResponse = await apiService.getSites({ client_id: client.id });
            const sites = sitesResponse.sites || [];
            
            // Load buildings for each site
            const sitesWithBuildings = await Promise.all(
              sites.map(async (site: any) => {
                try {
                  const buildings = await apiService.getSiteBuildings(site.id);
                  return {
                    ...site,
                    buildings: buildings || []
                  };
                } catch (error) {
                  console.error(`Error loading buildings for site ${site.id}:`, error);
                  return {
                    ...site,
                    buildings: []
                  };
                }
              })
            );
            
            return {
              ...client,
              sites: sitesWithBuildings
            };
          } catch (error) {
            console.error(`Error loading sites for client ${client.id}:`, error);
            return {
              ...client,
              sites: []
            };
          }
        })
      );
      
      setClients(clientsWithSites);
    } catch (e) {
      console.error('Error fetching clients:', e);
      setClients([]);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const setSelectedClient = (client: Client | null) => {
    setSelectedClientState(client);
    if (client) {
      sessionStorage.setItem('selected_client', JSON.stringify(client));
    } else {
      sessionStorage.removeItem('selected_client');
    }
  };

  const refreshClients = async () => {
    await fetchClients();
  };

  return (
    <ClientContext.Provider value={{ selectedClient, setSelectedClient, clients, refreshClients }}>
      {children}
    </ClientContext.Provider>
  );
}; 