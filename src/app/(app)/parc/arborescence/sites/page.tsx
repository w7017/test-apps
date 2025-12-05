'use client';

import { Suspense, useContext } from 'react';
import { ClientContext } from '@/contexts/client-context';
import HierarchyListPage from '@/components/hierarchy-list-page';
import { Loader2 } from 'lucide-react';

function SitesListContent() {
  const { selectedClient } = useContext(ClientContext);
  
  return (
    <HierarchyListPage
      listType="sites"
      selectedClient={selectedClient}
      filters={{}}
    />
  );
}

export default function SitesListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <SitesListContent />
    </Suspense>
  );
}