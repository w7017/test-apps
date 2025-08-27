
'use client';

import React from 'react';
import { notFound, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Server,
  ClipboardList,
  Camera,
  FilePenLine,
  History,
  Trash,
  Eye,
  ArrowLeft,
  ChevronsRight
} from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// This is mock data for now. In a real application, you'd fetch this.
const mockEquipment = {
  id: 'eq-1',
  name: 'Presse Hydraulique P-101',
  reference: 'P-101',
  image: 'https://picsum.photos/seed/eq1/600/400',
  location: 'Site Alpha > Bâtiment Principal > Rez-de-chaussée > Atelier A',
  domaineTechnique: 'Mécanique',
  statut: 'En service',
  marque: 'Siemens'
};

const mockAudit = {
    version: 3,
    date: '2024-05-21',
    auditeur: 'Jean Dupont',
    statutGlobal: 'À surveiller',
    notesGlobales: 'Le niveau de vibration a augmenté de 5% depuis le dernier relevé. À vérifier lors de la prochaine maintenance préventive.',
    checklist: [
        { id: 'check-1', item: 'Contrôle visuel des fuites', statut: 'Conforme', notes: '' },
        { id: 'check-2', item: 'Vérification pression hydraulique', statut: 'Conforme', notes: 'Pression à 250 bars, stable.' },
        { id: 'check-3', item: 'Niveau de vibration moteur', statut: 'À surveiller', notes: 'Vibration à 0.7g. Seuil max: 0.8g.' },
        { id: 'check-4', item: 'Contrôle des sécurités', statut: 'Conforme', notes: 'Arrêt d\'urgence testé OK.' },
        { id: 'check-5', item: 'Température du circuit', statut: 'Non conforme', notes: 'Température à 85°C. Dépasse le seuil de 80°C. Action corrective immédiate requise.' },
    ],
    photos: [
        { id: 'photo-1', url: 'https://picsum.photos/seed/audit1/300/200', description: 'Vue générale de l\'équipement' },
        { id: 'photo-2', url: 'https://picsum.photos/seed/audit2/300/200', description: 'Point de fuite mineur détecté sur le joint.' },
    ]
}

const mockAuditHistory = [
    {
        version: 2,
        date: '2024-02-15',
        auditeur: 'Jean Dupont',
        statutGlobal: 'Conforme',
        notesGlobales: 'RAS. Tout est en ordre. Maintenance préventive effectuée le mois dernier.',
    },
    {
        version: 1,
        date: '2023-11-10',
        auditeur: 'Alice Martin',
        statutGlobal: 'Conforme',
        notesGlobales: 'Mise en service et premier audit. Conforme aux spécifications constructeur.',
    }
]


function StatutBadge({ statut, className = '' }: { statut: string, className?: string }) {
  const baseClasses = "font-semibold";
  const variants: { [key: string]: string } = {
    'Conforme': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'À surveiller': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'Non conforme': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    'Critique': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return <Badge className={`${variants[statut] || 'secondary'} ${baseClasses} ${className}`}>{statut}</Badge>;
}

export default function AuditPage({ params }: { params: { equipmentId: string } }) {
  const equipment = mockEquipment; // In real app: fetchEquipment(params.equipmentId)
  const audit = mockAudit; // In real app: fetchLatestAuditForEquipment(params.equipmentId)
  const router = useRouter();

  const [isEditing, setIsEditing] = React.useState(false);
  const [checklist, setChecklist] = React.useState(audit.checklist);
  
  const handleStatusChange = (itemId: string, newStatus: string) => {
    setChecklist(prev => prev.map(item => item.id === itemId ? {...item, statut: newStatus} : item));
  };


  if (!equipment) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
       <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5"/>
                <span className="sr-only">Retour</span>
            </Button>
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <ClipboardList className="text-primary"/> Audit de l'équipement
                </h2>
                <p className="text-muted-foreground">Consultez ou mettez à jour le relevé pour {equipment.name}. (Version actuelle: {audit.version})</p>
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline"><History className="mr-2 h-4 w-4"/>Voir l'historique</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Historique des audits pour {equipment.name}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Version</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Auditeur</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="bg-muted/50 font-semibold">
                                 <TableCell>{audit.version} (actuelle)</TableCell>
                                 <TableCell>{audit.date}</TableCell>
                                 <TableCell>{audit.auditeur}</TableCell>
                                 <TableCell><StatutBadge statut={audit.statutGlobal}/></TableCell>
                                 <TableCell className="max-w-[300px] truncate">{audit.notesGlobales}</TableCell>
                            </TableRow>
                            {mockAuditHistory.map(h => (
                                <TableRow key={h.version}>
                                    <TableCell>{h.version}</TableCell>
                                    <TableCell>{h.date}</TableCell>
                                    <TableCell>{h.auditeur}</TableCell>
                                    <TableCell><StatutBadge statut={h.statutGlobal}/></TableCell>
                                    <TableCell className="max-w-[300px] truncate">{h.notesGlobales}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <Eye className="mr-2 h-4 w-4"/> : <FilePenLine className="mr-2 h-4 w-4"/>}
              {isEditing ? "Passer en lecture" : "Modifier l'audit"}
            </Button>
        </div>
      </div>

       <Card>
          <CardHeader>
              <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                        <Server className="text-muted-foreground" />
                        <span>{equipment.name} <span className="text-muted-foreground">({equipment.reference})</span></span>
                  </div>
                  <Badge variant="outline">{equipment.statut}</Badge>
              </CardTitle>
              <CardDescription>{equipment.location}</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                      <p className="font-semibold">Domaine Technique</p>
                      <p className="text-muted-foreground">{equipment.domaineTechnique}</p>
                  </div>
                  <div>
                      <p className="font-semibold">Marque</p>
                      <p className="text-muted-foreground">{equipment.marque}</p>
                  </div>
                  <div>
                      <p className="font-semibold">Dernier Audit</p>
                      <p className="text-muted-foreground">{audit.date} (v{audit.version})</p>
                  </div>
                  <div>
                      <p className="font-semibold">Auditeur</p>
                      <p className="text-muted-foreground">{audit.auditeur}</p>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Checklist de l'Audit</CardTitle>
                    <CardDescription>Détail des points de contrôle et de leurs statuts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {checklist.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 p-3 rounded-lg border">
                                <div className="md:col-span-1 flex items-center">
                                    <p className="font-medium">{item.item}</p>
                                </div>
                                <div className="md:col-span-2">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                <Button onClick={() => handleStatusChange(item.id, 'Conforme')} variant={item.statut === 'Conforme' ? 'default' : 'outline'} size="sm" className="bg-green-500 hover:bg-green-600 text-white border-green-600 data-[variant=outline]:bg-transparent data-[variant=outline]:text-green-700">Conforme</Button>
                                                <Button onClick={() => handleStatusChange(item.id, 'À surveiller')} variant={item.statut === 'À surveiller' ? 'default' : 'outline'} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600 data-[variant=outline]:bg-transparent data-[variant=outline]:text-yellow-700">À surveiller</Button>
                                                <Button onClick={() => handleStatusChange(item.id, 'Non conforme')} variant={item.statut === 'Non conforme' ? 'default' : 'outline'} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-orange-600 data-[variant=outline]:bg-transparent data-[variant=outline]:text-orange-700">Non conforme</Button>
                                            </div>
                                             <Textarea placeholder="Ajouter une note..." defaultValue={item.notes} className="min-h-[40px]"/>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <StatutBadge statut={item.statut} />
                                            <p className="text-sm text-muted-foreground italic truncate pl-4">{item.notes || 'Aucune note'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                       <span>Statut Global</span>
                       {isEditing ? (
                           <Select defaultValue={audit.statutGlobal}>
                                <SelectTrigger className="w-[180px] h-9">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Conforme">Conforme</SelectItem>
                                    <SelectItem value="À surveiller">À surveiller</SelectItem>
                                    <SelectItem value="Critique">Critique</SelectItem>
                                </SelectContent>
                           </Select>
                       ) : <StatutBadge statut={audit.statutGlobal} className="text-base px-3 py-1" /> }
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Label>Notes Globales</Label>
                     {isEditing ? (
                        <Textarea defaultValue={audit.notesGlobales} className="mt-2 min-h-[100px]"/>
                    ) : (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                            {audit.notesGlobales || 'Aucune note globale.'}
                        </p>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Camera />Photos</div>
                         {isEditing && <Button variant="outline" size="sm">Ajouter</Button>}
                    </CardTitle>
                    <CardDescription>Photos prises lors de l'audit.</CardDescription>
                </CardHeader>
                <CardContent>
                    {audit.photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {audit.photos.map(p => (
                                <div key={p.id} className="group relative">
                                    <Image src={p.url} alt={p.description} width={300} height={200} className="rounded-md object-cover aspect-[3/2]"/>
                                    <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs p-2 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        {p.description}
                                    </div>
                                    {isEditing && (
                                        <div className="absolute top-1 right-1">
                                            <Button size="icon" variant="destructive" className="h-6 w-6">
                                                <Trash className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                           <p>Aucune photo pour cet audit.</p>
                           {isEditing && <Button variant="link" className="mt-2">Ajouter la première photo</Button>}
                        </div>
                    )}
                </CardContent>
            </Card>
            {isEditing && (
                 <Card className="sticky bottom-6">
                    <CardFooter className="p-3 justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Annuler</Button>
                        <Button>Enregistrer (créer v{audit.version + 1})</Button>
                    </CardFooter>
                 </Card>
            )}
        </div>
      </div>
    </div>
  );
}
