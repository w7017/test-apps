
'use client';

import React, { useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientContext } from '@/contexts/client-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ListFilter, ClipboardCheck, Eye, FilePenLine } from 'lucide-react';
import Image from 'next/image';
import { addDays, format, isBefore, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// This is mock data for now. In a real application, you'd fetch this.
const initialTreeData = {
  'client-1': [
    {
      id: 'site-1',
      name: 'Site de Production Alpha',
      type: 'site',
      children: [
        {
          id: 'bat-1',
          name: 'Bâtiment Principal',
          type: 'batiment',
          children: [
            { id: 'niv-1', name: 'Rez-de-chaussée', type: 'niveau', children: [
                { id: 'loc-1', name: 'Atelier A', type: 'local', children: [
                    { id: 'eq-1', name: 'Presse Hydraulique P-101', type: 'equipement', image: 'https://picsum.photos/seed/eq1/200/200', reference: 'P-101', domaineTechnique: 'Mécanique', statut: 'En service', marque: 'Siemens', lastAudit: '2024-05-15', auditStatus: 'Conforme', nextAudit: '2024-08-15' },
                    { id: 'eq-2', name: 'Convoyeur C-203', type: 'equipement', image: 'https://picsum.photos/seed/eq2/200/200', reference: 'C-203', domaineTechnique: 'Automatisme', statut: 'Alerte', marque: 'Bosch', lastAudit: '2024-06-01', auditStatus: 'À surveiller', nextAudit: '2024-07-01' },
                ]},
            ]},
            { id: 'niv-2', name: '1er Étage', type: 'niveau', children: [
                { id: 'loc-3', name: 'Bureaux Administratifs', type: 'local', children: [
                    { id: 'eq-3', name: 'Serveur S-01', type: 'equipement', image: 'https://picsum.photos/seed/eq3/200/200', reference: 'S-01', domaineTechnique: 'IT', statut: 'Hors service', marque: 'Dell', lastAudit: '2023-09-20', auditStatus: 'Critique', nextAudit: '2024-03-20' },
                    { id: 'eq-4', name: 'Climatiseur CLIM-12', type: 'equipement', image: 'https://picsum.photos/seed/eq4/200/200', reference: 'CLIM-12', domaineTechnique: 'CVC', statut: 'En service', marque: 'Carrier', lastAudit: null, auditStatus: 'Jamais audité', nextAudit: null },
                ]},
            ]},
          ],
        },
      ],
    },
  ],
   'client-2': [],
   'client-3': [],
   'client-4': [],
};

// Helper function to recursively find all equipment for a client
const getAllEquipment = (nodes: any[]) => {
  let equipment: any[] = [];
  const traverse = (items: any[], path: any[]) => {
    for (const item of items) {
      const newPath = [...path, { type: item.type, name: item.name }];
      if (item.type === 'equipement') {
        const location = newPath.slice(0, -1).map(p => p.name).join(' > ');
        equipment.push({ ...item, location });
      }
      if (item.children) {
        traverse(item.children, newPath);
      }
    }
  };
  traverse(nodes, []);
  return equipment;
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
}

function AuditStatusBadge({ status, nextAudit }: { status: string, nextAudit: string | null }) {
    let variant = {
        'Conforme': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'À surveiller': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Critique': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'Jamais audité': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }[status] || 'secondary';

    let text = status;

    if (nextAudit && isBefore(parseISO(nextAudit), new Date())) {
        variant = 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
        text = 'En retard';
    }
    
    return <Badge className={`border-transparent ${variant}`}>{text}</Badge>;
}

export default function RelevesPage() {
  const { selectedClient } = useContext(ClientContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  const allEquipment = useMemo(() => {
    if (!selectedClient) return [];
    return getAllEquipment(initialTreeData[selectedClient.id] || []);
  }, [selectedClient]);

  const filteredEquipment = useMemo(() => {
    return allEquipment.filter(eq => {
        const searchMatch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        let statusMatch = true;
        if(statusFilter !== 'all') {
            if (statusFilter === 'retard' && eq.nextAudit) {
                statusMatch = isBefore(parseISO(eq.nextAudit), new Date());
            } else if (statusFilter !== 'retard') {
                statusMatch = eq.auditStatus.toLowerCase().replace(' ', '_') === statusFilter;
            } else {
                 statusMatch = false; // 'retard' without nextAudit should not match
            }
        }

        return searchMatch && statusMatch;
    });
  }, [allEquipment, searchTerm, statusFilter]);

  if (!selectedClient) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-muted-foreground">
          Veuillez sélectionner un client pour voir les équipements à auditer.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          Relevés & Audits
        </h2>
        <p className="text-muted-foreground">
          Consultez et réalisez les audits pour les équipements du client {selectedClient.name}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Équipements</CardTitle>
          <CardDescription>
            Recherchez et sélectionnez un équipement pour commencer ou consulter un audit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, réf, localisation..."
                className="pl-8 sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="conforme">Conforme</SelectItem>
                <SelectItem value="a_surveiller">À surveiller</SelectItem>
                <SelectItem value="critique">Critique</SelectItem>
                <SelectItem value="retard">En retard</SelectItem>
                <SelectItem value="jamais_audite">Jamais audité</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Équipement</TableHead>
                  <TableHead>Dernier Audit</TableHead>
                  <TableHead>Prochain Audit</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell>
                        <Image
                          src={eq.image || 'https://placehold.co/60'}
                          alt={eq.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                          data-ai-hint="equipment"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{eq.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {eq.reference}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(eq.lastAudit)}</TableCell>
                      <TableCell>{formatDate(eq.nextAudit)}</TableCell>
                      <TableCell>
                        <AuditStatusBadge status={eq.auditStatus} nextAudit={eq.nextAudit} />
                      </TableCell>
                      <TableCell className="text-right">
                        {eq.auditStatus === 'Jamais audité' ? (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => router.push(`/audits/${eq.id}`)}
                                >
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                Auditer
                            </Button>
                        ) : (
                            <div className="flex gap-2 justify-end">
                                 <Button variant="ghost" size="icon" onClick={() => router.push(`/audits/${eq.id}`)} title="Consulter">
                                    <Eye className="h-4 w-4"/>
                                 </Button>
                                 <Button variant="ghost" size="icon" onClick={() => router.push(`/audits/${eq.id}?edit=true`)} title="Modifier">
                                    <FilePenLine className="h-4 w-4"/>
                                 </Button>
                            </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucun équipement trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
