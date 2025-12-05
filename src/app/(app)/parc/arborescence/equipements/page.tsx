'use client';

import { useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientContext } from '@/contexts/client-context';
import HierarchyListPage from '@/components/hierarchy-list-page';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';


function EquipementsListContent() {
  const searchParams = useSearchParams();
  const { selectedClient } = useContext(ClientContext);
  
  const filters = {
    siteId: searchParams.get('siteId') || '',
    buildingId: searchParams.get('buildingId') || '',
    levelId: searchParams.get('levelId') || '',
    locationId: searchParams.get('locationId') || '',
  };
  
  return (
    <HierarchyListPage
      listType="equipements"
      selectedClient={selectedClient}
      filters={filters}
    />
  );
}

export default function EquipementsListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <EquipementsListContent />
    </Suspense>
  );
}