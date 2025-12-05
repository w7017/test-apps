'use client';

import { Suspense, useContext } from 'react';
import { ClientContext } from '@/contexts/client-context';
import HierarchyListPage from '@/components/hierarchy-list-page';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function NiveauxListContent() {
  const searchParams = useSearchParams();
  const { selectedClient } = useContext(ClientContext);
  
  const filters = {
    siteId: searchParams.get('siteId') || '',
    buildingId: searchParams.get('buildingId') || '',
    levelId: '',
    locationId: '',
  };
  
  return (
    <HierarchyListPage
      listType="niveaux"
      selectedClient={selectedClient}
      filters={filters}
    />
  );
}

export default function NiveauxListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <NiveauxListContent />
    </Suspense>
  );
}