
'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
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

type EquipmentWithRelations = {
  id: string;
  code: string;
  libelle: string;
  image?: string | null;
  photoUrl?: string | null;
  reference?: string | null;
  frequenceMaintenance?: number | null;
  location: {
    name: string;
    level: {
      name: string;
      building: {
        name: string;
        site: {
          name: string;
          client: { id: string; name: string };
        };
      };
    };
  };
  audits: Array<{ id: string; date: string; statutGlobal: string; version: number }>
};

type UiEquipment = {
  id: string;
  name: string;
  image?: string | null;
  reference?: string | null;
  lastAudit: string | null;
  nextAudit: string | null;
  auditStatus: string;
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
  const [equipments, setEquipments] = useState<UiEquipment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedClient) {
        setEquipments([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/equipments', { cache: 'no-store' });
        if (!res.ok) throw new Error('Échec du chargement des équipements');
        const data: EquipmentWithRelations[] = await res.json();

        const forClient = data.filter((e) => e.location?.level?.building?.site?.client?.id === selectedClient.id);

        const mapped: UiEquipment[] = forClient.map((e) => {
          const sortedAudits = [...(e.audits || [])].sort((a, b) => b.version - a.version);
          const last = sortedAudits[0];
          const lastAudit = last ? last.date : null;

          let nextAudit: string | null = null;
          if (lastAudit && e.frequenceMaintenance && e.frequenceMaintenance > 0) {
            try {
              nextAudit = format(addDays(parseISO(lastAudit), e.frequenceMaintenance), 'yyyy-MM-dd');
            } catch (_) {
              nextAudit = null;
            }
          }

          const auditStatus = last ? (last.statutGlobal || 'Conforme') : 'Jamais audité';

          return {
            id: e.id,
            name: e.libelle,
            image: e.photoUrl || e.image || null,
            reference: e.reference || undefined,
            lastAudit,
            nextAudit,
            auditStatus,
          };
        });

        setEquipments(mapped);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedClient]);

  const allEquipment = equipments;

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
          {loading && (
            <div className="text-sm text-muted-foreground mb-3">Chargement des équipements…</div>
          )}
          {error && (
            <div className="text-sm text-red-600 mb-3">{error}</div>
          )}
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
