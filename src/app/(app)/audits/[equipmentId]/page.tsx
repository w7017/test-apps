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
  ChevronsRight,
  Save,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';

type EquipmentResponse = {
  id: string;
  libelle: string;
  reference?: string | null;
  image?: string | null;
  photoUrl?: string | null;
  domaineGMAO?: string | null;
  statut: string;
  marque?: string | null;
  location?: {
    name: string;
    level: { name: string; building: { name: string; site: { name: string } } };
  } | null;
  audits: Array<{
    id: string;
    version: number;
    date: string;
    auditeur: string;
    statutGlobal: string;
    notesGlobales?: string | null;
    checklist: any;
    photos: any;
  }>;
};

type ChecklistItem = {
  id: string;
  item: string;
  statut: string;
  notes: string;
};

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

export default function AuditPage({ params }: { params: Promise<{ equipmentId: string }> }) {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [equipment, setEquipment] = React.useState<EquipmentResponse | null>(null);
  const [currentAudit, setCurrentAudit] = React.useState<EquipmentResponse['audits'][number] | null>(null);
  const [history, setHistory] = React.useState<EquipmentResponse['audits']>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Form states
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [globalStatus, setGlobalStatus] = React.useState<string>('');
  const [globalNotes, setGlobalNotes] = React.useState<string>('');
  const [auditeur, setAuditeur] = React.useState<string>('');

  const { equipmentId } = React.use(params) as { equipmentId: string };

  // Default checklist template
  const defaultChecklist: ChecklistItem[] = [
    { id: 'check-1', item: 'Liée à la sécurité', statut: 'Conforme', notes: '' },
    { id: 'check-2', item: 'Liée à la maintenabilité', statut: 'Conforme', notes: '' },
    { id: 'check-3', item: 'Autre', statut: 'Conforme', notes: '' },
  ];

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/equipments/${equipmentId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Équipement introuvable');
        const data: EquipmentResponse = await res.json();
        setEquipment(data);
        const sorted = [...(data.audits || [])].sort((a, b) => b.version - a.version);
        const latest = sorted[0] || null;
        setCurrentAudit(latest);
        setHistory(sorted.slice(1));
        
        // Initialize form with current audit data or defaults
        if (latest) {
          const parsedChecklist = Array.isArray(latest.checklist) ? latest.checklist : defaultChecklist;
          setChecklist(parsedChecklist);
          setGlobalStatus(latest.statutGlobal);
          setGlobalNotes(latest.notesGlobales || '');
          setAuditeur(latest.auditeur);
        } else {
          setChecklist(defaultChecklist);
          setGlobalStatus('Conforme');
          setGlobalNotes('');
          setAuditeur('');
        }
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [equipmentId]);
  
  const handleStatusChange = (itemId: string, newStatus: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, statut: newStatus } : item
    ));
  };

  const handleNotesChange = (itemId: string, newNotes: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, notes: newNotes } : item
    ));
  };

  const handleSaveAudit = async () => {
    if (!auditeur.trim()) {
      setError('Le nom de l\'auditeur est requis');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const auditData = {
        equipmentId,
        auditeur: auditeur.trim(),
        statutGlobal: globalStatus,
        notesGlobales: globalNotes.trim() || null,
        checklist,
        photos: [] // For now, empty array
      };

      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      const newAudit = await res.json();
      
      // Refresh the equipment data to get the updated audit
      const refreshRes = await fetch(`/api/equipments/${equipmentId}`, { cache: 'no-store' });
      if (refreshRes.ok) {
        const refreshedData: EquipmentResponse = await refreshRes.json();
        setEquipment(refreshedData);
        const sorted = [...(refreshedData.audits || [])].sort((a, b) => b.version - a.version);
        const latest = sorted[0] || null;
        setCurrentAudit(latest);
        setHistory(sorted.slice(1));
      }

      setIsEditing(false);
      
    } catch (e: any) {
      console.error('Save error:', e);
      setError(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current audit values
    if (currentAudit) {
      const parsedChecklist = Array.isArray(currentAudit.checklist) ? currentAudit.checklist : defaultChecklist;
      setChecklist(parsedChecklist);
      setGlobalStatus(currentAudit.statutGlobal);
      setGlobalNotes(currentAudit.notesGlobales || '');
      setAuditeur(currentAudit.auditeur);
    } else {
      setChecklist(defaultChecklist);
      setGlobalStatus('Conforme');
      setGlobalNotes('');
      setAuditeur('');
    }
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">Chargement de l'équipement…</p>
      </div>
    );
  }

  if (error && !equipment) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!equipment) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
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
                <p className="text-muted-foreground">
                  {isEditing ? 
                    `Modification de l'audit pour ${equipment.libelle}` : 
                    `Consultez ou mettez à jour le relevé pour ${equipment.libelle}. ${currentAudit ? `(Version actuelle: ${currentAudit.version})` : '(Aucun audit)'}`
                  }
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!currentAudit && history.length === 0}>
                  <History className="mr-2 h-4 w-4"/>Voir l'historique
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Historique des audits pour {equipment.libelle}</DialogTitle>
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
                            {currentAudit && (
                              <TableRow className="bg-muted/50 font-semibold">
                                   <TableCell>{currentAudit.version} (actuelle)</TableCell>
                                   <TableCell>{format(parseISO(currentAudit.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                                   <TableCell>{currentAudit.auditeur}</TableCell>
                                   <TableCell><StatutBadge statut={currentAudit.statutGlobal}/></TableCell>
                                   <TableCell className="max-w-[300px] truncate">{currentAudit.notesGlobales || '—'}</TableCell>
                              </TableRow>
                            )}
                            {history.map((audit) => (
                              <TableRow key={audit.id}>
                                   <TableCell>{audit.version}</TableCell>
                                   <TableCell>{format(parseISO(audit.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                                   <TableCell>{audit.auditeur}</TableCell>
                                   <TableCell><StatutBadge statut={audit.statutGlobal}/></TableCell>
                                   <TableCell className="max-w-[300px] truncate">{audit.notesGlobales || '—'}</TableCell>
                              </TableRow>
                            ))}
                            {!currentAudit && history.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                  Aucun audit disponible
                                </TableCell>
                              </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
              variant={isEditing ? "outline" : "default"}
            >
              {isEditing ? (
                <>
                  <Eye className="mr-2 h-4 w-4"/>
                  Annuler
                </>
              ) : (
                <>
                  <FilePenLine className="mr-2 h-4 w-4"/>
                  {currentAudit ? "Modifier l'audit" : "Créer un audit"}
                </>
              )}
            </Button>
        </div>
      </div>

       <Card>
          <CardHeader>
              <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                        <Server className="text-muted-foreground" />
                        <span>{equipment.libelle} <span className="text-muted-foreground">({equipment.reference || '—'})</span></span>
                  </div>
                  <Badge variant="outline">{equipment.statut || '—'}</Badge>
              </CardTitle>
              <CardDescription>{equipment.location ? `${equipment.location.level.building.site.name} > ${equipment.location.level.building.name} > ${equipment.location.level.name} > ${equipment.location.name}` : 'Localisation inconnue'}</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                      <p className="font-semibold">Domaine Technique</p>
                      <p className="text-muted-foreground">{equipment.domaineGMAO || '—'}</p>
                  </div>
                  <div>
                      <p className="font-semibold">Marque</p>
                      <p className="text-muted-foreground">{equipment.marque || '—'}</p>
                  </div>
                  <div>
                      <p className="font-semibold">Dernier Audit</p>
                      <p className="text-muted-foreground">{currentAudit ? `${format(parseISO(currentAudit.date), 'dd/MM/yyyy')} (v${currentAudit.version})` : '—'}</p>
                  </div>
                  <div>
                      <p className="font-semibold">Auditeur</p>
                      <p className="text-muted-foreground">{currentAudit?.auditeur || '—'}</p>
                  </div>
              </div>
          </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Informations de l'audit</CardTitle>
                  <CardDescription>Renseignez les informations générales de l'audit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="auditeur">Nom de l'auditeur *</Label>
                    <Input
                      id="auditeur"
                      value={auditeur}
                      onChange={(e) => setAuditeur(e.target.value)}
                      placeholder="Nom de l'auditeur"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            
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
                                                <Button 
                                                  onClick={() => handleStatusChange(item.id, 'Conforme')} 
                                                  variant={item.statut === 'Conforme' ? 'default' : 'outline'} 
                                                  size="sm" 
                                                  className={item.statut === 'Conforme' ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-green-500 text-green-700 hover:bg-green-50'}
                                                >
                                                  Conforme
                                                </Button>
                                                <Button 
                                                  onClick={() => handleStatusChange(item.id, 'À surveiller')} 
                                                  variant={item.statut === 'À surveiller' ? 'default' : 'outline'} 
                                                  size="sm" 
                                                  className={item.statut === 'À surveiller' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'border-yellow-500 text-yellow-700 hover:bg-yellow-50'}
                                                >
                                                  À surveiller
                                                </Button>
                                                <Button 
                                                  onClick={() => handleStatusChange(item.id, 'Non conforme')} 
                                                  variant={item.statut === 'Non conforme' ? 'default' : 'outline'} 
                                                  size="sm" 
                                                  className={item.statut === 'Non conforme' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-500 text-orange-700 hover:bg-orange-50'}
                                                >
                                                  Non conforme
                                                </Button>
                                            </div>
                                             <Textarea 
                                               placeholder="Ajouter une note..." 
                                               value={item.notes} 
                                               onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                               className="min-h-[40px]"
                                             />
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
                           <Select value={globalStatus} onValueChange={setGlobalStatus}>
                                <SelectTrigger className="w-[180px] h-9">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Conforme">Conforme</SelectItem>
                                    <SelectItem value="À surveiller">À surveiller</SelectItem>
                                    <SelectItem value="Non conforme">Non conforme</SelectItem>
                                    <SelectItem value="Critique">Critique</SelectItem>
                                </SelectContent>
                           </Select>
                       ) : <StatutBadge statut={globalStatus || 'Conforme'} className="text-base px-3 py-1" /> }
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Label>Notes Globales</Label>
                     {isEditing ? (
                        <Textarea 
                          value={globalNotes} 
                          onChange={(e) => setGlobalNotes(e.target.value)}
                          placeholder="Ajouter des notes globales..."
                          className="mt-2 min-h-[100px]"
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                            {globalNotes || 'Aucune note globale.'}
                        </p>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Camera />Photos</div>
                         {isEditing && <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1"/>Ajouter</Button>}
                    </CardTitle>
                    <CardDescription>Photos prises lors de l'audit.</CardDescription>
                </CardHeader>
                <CardContent>
                    {currentAudit?.photos && Array.isArray(currentAudit.photos) && currentAudit.photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {currentAudit.photos.map((p: any, idx: number) => (
                                <div key={p.id || idx} className="group relative">
                                    <Image src={p.url} alt={p.description || 'Photo'} width={300} height={200} className="rounded-md object-cover aspect-[3/2]"/>
                                    <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs p-2 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        {p.description || 'Photo'}
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
                           {isEditing && <Button variant="link" className="mt-2"><Plus className="h-4 w-4 mr-1"/>Ajouter la première photo</Button>}
                        </div>
                    )}
                </CardContent>
            </Card>
            {isEditing && (
                 <Card className="sticky bottom-6">
                    <CardFooter className="p-3 justify-end gap-2">
                        <Button variant="ghost" onClick={handleCancelEdit} disabled={saving}>
                          Annuler
                        </Button>
                        <Button onClick={handleSaveAudit} disabled={saving || !auditeur.trim()}>
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4"/>
                              Enregistrer (créer v{(currentAudit?.version || 0) + 1})
                            </>
                          )}
                        </Button>
                    </CardFooter>
                 </Card>
            )}
        </div>
      </div>
    </div>
  );
}