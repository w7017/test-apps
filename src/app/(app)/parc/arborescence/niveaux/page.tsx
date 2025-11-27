'use client';

import { useContext } from 'react';
import { ClientContext } from '@/contexts/client-context';
import HierarchyListPage from '@/components/hierarchy-list-page';

export default function SitesListPage() {
  const { selectedClient } = useContext(ClientContext);
  
  return <HierarchyListPage listType="niveaux" selectedClient={selectedClient} />;
}