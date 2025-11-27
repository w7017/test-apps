

'use client';

import React, { useState, useContext, useMemo, useEffect } from 'react';
import { ClientContext } from '@/contexts/client-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PlusCircle,
  Edit,
  Trash2,
  Building,
  Layers,
  DoorOpen,
  Server,
  Home,
  ChevronRight,
  UploadCloud,
  Eye,
  Copy,
  Search,
  ListFilter,
  QrCode,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { usePathname } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { generateQrCode } from '@/ai/flows/generate-qr-code';
import { useToast } from '@/hooks/use-toast';
import { AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '@radix-ui/react-alert-dialog';

// Mock data structure with images
const initialTreeData = {
  'client-1': [
    {
      id: 'site-1',
      name: 'Site de Production Alpha',
      type: 'site',
      image: 'https://picsum.photos/seed/site1/400/300',
      children: [
        {
          id: 'bat-1',
          name: 'Bâtiment Principal',
          type: 'batiment',
          image: 'https://picsum.photos/seed/bat1/400/300',
          children: [
            { id: 'niv-1', name: 'Rez-de-chaussée', type: 'niveau', image: 'https://picsum.photos/seed/niv1/400/300', children: [
                { id: 'loc-1', name: 'Atelier A', type: 'local', image: 'https://picsum.photos/seed/loc1/400/300', children: [
                    { id: 'eq-1', name: 'Presse Hydraulique P-101', type: 'equipement', image: 'https://picsum.photos/seed/eq1/200/200', reference: 'P-101', domaineTechnique: 'Mécanique', statut: 'En service', marque: 'Siemens' },
                    { id: 'eq-2', name: 'Convoyeur C-203', type: 'equipement', image: 'https://picsum.photos/seed/eq2/200/200', reference: 'C-203', domaineTechnique: 'Automatisme', statut: 'Alerte', marque: 'Bosch' },
                ]},
                { id: 'loc-2', name: 'Magasin', type: 'local', image: 'https://picsum.photos/seed/loc2/400/300', children: [] },
            ]},
            { id: 'niv-2', name: '1er Étage', type: 'niveau', image: 'https://picsum.photos/seed/niv2/400/300', children: [
                { id: 'loc-3', name: 'Bureaux Administratifs', type: 'local', image: 'https://picsum.photos/seed/loc3/400/300', children: [
                    { id: 'eq-3', name: 'Serveur S-01', type: 'equipement', image: 'https://picsum.photos/seed/eq3/200/200', reference: 'S-01', domaineTechnique: 'IT', statut: 'Hors service', marque: 'Dell' },
                ]},
            ]},
          ],
        },
      ],
    },
     {
      id: 'site-2',
      name: 'Entrepôt Logistique Bravo',
      type: 'site',
      image: 'https://picsum.photos/seed/site2/400/300',
      children: [],
    },
  ],
  'client-2': [],
  'client-3': [],
  'client-4': [],
};

const ICONS = {
  site: <Home className="h-5 w-5 text-sky-500" />,
  batiment: <Building className="h-5 w-5 text-orange-500" />,
  niveau: <Layers className="h-5 w-5 text-indigo-500" />,
  local: <DoorOpen className="h-5 w-5 text-green-500" />,
  equipement: <Server className="h-5 w-5 text-slate-500" />,
};

const HIERARCHY_PLURALS = {
    site: 'sites',
    batiment: 'bâtiments',
    niveau: 'niveaux',
    local: 'locaux',
    equipement: 'équipements',
}

const equipmentSchema = z.object({
  // ID for editing
  id: z.string().optional(),
  
  // Localisation / Emplacement
  zone: z.string().optional(),
  reseau: z.string().optional(),
  localisationPrecise: z.string().optional(),
  localisationDetaillee: z.string().optional(),

  // Options & Référentiels
  inclureGMAO: z.boolean().default(true),
  absentReferentiel: z.boolean().default(false),
  inventaireP3: z.boolean().default(false),

  // Identification
  code: z.string().min(1, "Le code est requis."),
  libelle: z.string().min(1, "Le libellé est requis."),
  codeBIM: z.string().optional(),
  numIdentification: z.string().optional(),
  quantite: z.number().int().min(1).default(1),
  qrCode: z.string().optional(),

  // État & Statut
  statut: z.enum(['En service', 'Hors service', 'Alerte', 'En veille']).default('En service'),
  etatSante: z.enum(['Bon', 'Moyen', 'Mauvais', 'Critique']).default('Bon'),
  equipementSensible: z.boolean().default(false),
  
  // Données GMAO
  domaineGMAO: z.string().optional(),
  famille: z.string().optional(),
  sousFamille: z.string().optional(),

  // Caractéristiques techniques
  typeEquipement: z.string().min(1, "Le type d'équipement est requis."),
  marque: z.string().optional(),
  modele: z.string().optional(),
  reference: z.string().optional(),
  numeroSerie: z.string().optional(),
  
  // Ressources
  photoUrl: z.string().url("URL de l'image non valide").optional().or(z.literal('')),
  
  // Domaine & Dates
  domaineDate: z.string().optional(),
  dateInstallation: z.string().optional(),
  dateFinGarantie: z.string().optional(),
  frequenceMaintenance: z.number().int().positive().optional(),
});


function EquipmentManager({ items, onUpdate, onDelete, onDuplicate, currentItem }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const searchMatch = (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === 'all' || item.statut === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [items, searchTerm, statusFilter]);
  
  const form = useForm<z.infer<typeof equipmentSchema>>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      zone: '', reseau: '', localisationPrecise: '', localisationDetaillee: '',
      inclureGMAO: true, absentReferentiel: false, inventaireP3: false,
      code: '', libelle: '', codeBIM: '', numIdentification: '', quantite: 1, qrCode: '',
      statut: 'En service', etatSante: 'Bon', equipementSensible: false,
      domaineGMAO: '', famille: '', sousFamille: '',
      typeEquipement: '', marque: '', modele: '', reference: '', numeroSerie: '',
      photoUrl: '',
      domaineDate: '', dateInstallation: '', dateFinGarantie: '',
    },
  });

  const handleGenerateQr = async () => {
    const code = form.getValues('code');
    if (!code) {
        toast({
            variant: "destructive",
            title: "Code manquant",
            description: "Veuillez d'abord saisir un code pour l'équipement.",
        });
        return;
    }
    setIsGeneratingQr(true);
    try {
        const result = await generateQrCode({ equipmentId: code });
        form.setValue('qrCode', result.qrCodeDataUri);
        toast({
            title: "QR Code Généré",
            description: "Le QR code a été généré avec succès.",
        });
    } catch (error) {
        console.error("Error generating QR code:", error);
        toast({
            variant: "destructive",
            title: "Erreur de génération",
            description: "Impossible de générer le QR code.",
        });
    } finally {
        setIsGeneratingQr(false);
    }
  }

  const handleEditEquipment = async (equipment) => {
    try {
      setLoading(true);
      
      // Pre-fill form with equipment data
      form.reset({
        id: equipment.id, // Set the ID for editing
        zone: equipment.zone || '',
        reseau: equipment.reseau || '',
        localisationPrecise: equipment.localisationPrecise || '',
        localisationDetaillee: equipment.localisationDetaillee || '',
        inclureGMAO: equipment.inclureGMAO ?? true,
        absentReferentiel: equipment.absentReferentiel ?? false,
        inventaireP3: equipment.inventaireP3 ?? false,
        code: equipment.code || '',
        libelle: equipment.libelle || equipment.name || '',
        codeBIM: equipment.codeBIM || '',
        numIdentification: equipment.numIdentification || '',
        quantite: equipment.quantite || 1,
        qrCode: equipment.qrCode || '',
        statut: equipment.statut || 'En service',
        etatSante: equipment.etatSante || 'Bon',
        equipementSensible: equipment.equipementSensible ?? false,
        domaineGMAO: equipment.domaineGMAO || '',
        famille: equipment.famille || '',
        sousFamille: equipment.sousFamille || '',
        typeEquipement: equipment.typeEquipement || '',
        marque: equipment.marque || '',
        modele: equipment.modele || '',
        reference: equipment.reference || '',
        numeroSerie: equipment.numeroSerie || '',
        photoUrl: equipment.photoUrl || equipment.image || '',
        domaineDate: equipment.domaineDate || '',
        dateInstallation: equipment.dateInstallation ? new Date(equipment.dateInstallation).toISOString().split('T')[0] : '',
        dateFinGarantie: equipment.dateFinGarantie ? new Date(equipment.dateFinGarantie).toISOString().split('T')[0] : '',
        frequenceMaintenance: equipment.frequenceMaintenance || undefined
      });
      
      setShowAddForm(true);
      
    } catch (error) {
      console.error('Error preparing edit form:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données de l'équipement.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/equipments/${equipmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete equipment');
      }
      
      console.log('Equipment deleted successfully');
      
      // Remove from local state
      onDelete(equipmentId);
      
      toast({
        title: "Succès",
        description: "Équipement supprimé avec succès.",
      });
      
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || 'Impossible de supprimer l\'équipement.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof equipmentSchema>) => {
    try {
      setLoading(true);
      
      // Prepare equipment data for API
      const equipmentData = {
        code: values.code,
        libelle: values.libelle,
        image: values.photoUrl,
        qrCode: values.qrCode,
        locationId: currentItem?.id, // Current location ID
        zone: values.zone,
        reseau: values.reseau,
        localisationPrecise: values.localisationPrecise,
        localisationDetaillee: values.localisationDetaillee,
        inclureGMAO: values.inclureGMAO,
        absentReferentiel: values.absentReferentiel,
        inventaireP3: values.inventaireP3,
        codeBIM: values.codeBIM,
        numIdentification: values.numIdentification,
        quantite: values.quantite,
        statut: values.statut,
        etatSante: values.etatSante,
        equipementSensible: values.equipementSensible,
        domaineGMAO: values.domaineGMAO,
        famille: values.famille,
        sousFamille: values.sousFamille,
        typeEquipement: values.typeEquipement,
        marque: values.marque,
        modele: values.modele,
        reference: values.reference,
        numeroSerie: values.numeroSerie,
        domaineDate: values.domaineDate,
        dateInstallation: values.dateInstallation ? new Date(values.dateInstallation).toISOString() : undefined,
        dateFinGarantie: values.dateFinGarantie ? new Date(values.dateFinGarantie).toISOString() : undefined,
        frequenceMaintenance: values.frequenceMaintenance
      };
      
      // Check if we're editing an existing equipment (if form has an ID)
      const isEditing = form.getValues('id');
      
      let response;
      if (isEditing) {
        console.log('Updating equipment:', equipmentData);
        response = await fetch(`/api/equipments/${isEditing}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(equipmentData),
        });
      } else {
        console.log('Creating new equipment:', equipmentData);
        response = await fetch('/api/equipments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(equipmentData),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} equipment`);
      }
      
      const result = await response.json();
      console.log(`Equipment ${isEditing ? 'updated' : 'created'} successfully:`, result);
      
      // Transform for local state
      const transformedEquipment = {
        id: result.data.id,
        name: result.data.libelle,
        type: 'equipement',
        code: result.data.code,
        image: result.data.image || result.data.photoUrl || `https://picsum.photos/seed/${result.data.code}/200/200`,
        reference: result.data.reference,
        domaineTechnique: result.data.domaineGMAO,
        statut: result.data.statut,
        marque: result.data.marque,
        ...result.data
      };
      
      // Update or add equipment in the hierarchy
      onUpdate(transformedEquipment);
      
      form.reset({
        zone: '', reseau: '', localisationPrecise: '', localisationDetaillee: '',
        inclureGMAO: true, absentReferentiel: false, inventaireP3: false,
        code: '', libelle: '', codeBIM: '', numIdentification: '', quantite: 1, qrCode: '',
        statut: 'En service', etatSante: 'Bon', equipementSensible: false,
        domaineGMAO: '', famille: '', sousFamille: '',
        typeEquipement: '', marque: '', modele: '', reference: '', numeroSerie: '',
        photoUrl: '',
        domaineDate: '', dateInstallation: '', dateFinGarantie: '',
      });
      setShowAddForm(false);
      
      toast({
        title: "Succès",
        description: `Équipement ${isEditing ? 'modifié' : 'créé'} avec succès.`,
      });
      
    } catch (error) {
      console.error(`Error ${form.getValues('id') ? 'updating' : 'creating'} equipment:`, error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors de la sauvegarde.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="pt-2">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle className="text-lg flex items-center gap-2">{ICONS.equipement} Équipements</CardTitle>
             <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
               <PlusCircle className="mr-2"/>
               {showAddForm ? 'Annuler' : 'Ajouter un équipement'}
             </Button>
          </div>
        </CardHeader>
        <CardContent>
           {showAddForm && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-6 p-4 border rounded-lg">
                
                <h3 className="text-xl font-semibold -mb-4">
                  {form.getValues('id') ? 'Modifier l\'Équipement' : 'Informations de l\'Équipement'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Section Localisation */}
                    <div className="space-y-4 p-4 border rounded-md">
                        <h4 className="font-medium text-lg border-b pb-2">Localisation / Emplacement</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <FormItem>
                                <FormLabel>Site</FormLabel>
                                <Input disabled value={currentItem?.name || 'N/A'} />
                            </FormItem>
                             <FormField control={form.control} name="zone" render={({ field }) => (
                                <FormItem><FormLabel>Zone</FormLabel><FormControl><Input placeholder="Ex: Atelier, Toiture..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="reseau" render={({ field }) => (
                                <FormItem><FormLabel>Réseau</FormLabel><FormControl><Input placeholder="Ex: CVC-01" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="localisationPrecise" render={({ field }) => (
                                <FormItem><FormLabel>Localisation précise</FormLabel><FormControl><Input placeholder="Ex: Salle TGBT" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="localisationDetaillee" render={({ field }) => (
                                <FormItem className="col-span-2"><FormLabel>Localisation détaillée</FormLabel><FormControl><Input placeholder="Ex: Allée A, Rack 3" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </div>

                     {/* Section Options */}
                    <div className="space-y-4 p-4 border rounded-md">
                        <h4 className="font-medium text-lg border-b pb-2">Options & Référentiels</h4>
                         <div className="space-y-3 pt-2">
                            <FormField control={form.control} name="inclureGMAO" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>À inclure dans la GMAO</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                            )}/>
                            <FormField control={form.control} name="absentReferentiel" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Absent du référentiel client</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                            )}/>
                            <FormField control={form.control} name="inventaireP3" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Dans inventaire P3</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                            )}/>
                        </div>
                    </div>
                </div>

                {/* Section Identification & Statut */}
                <div className="space-y-4 p-4 border rounded-md">
                    <h4 className="font-medium text-lg border-b pb-2">Identification & Statut</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <FormField control={form.control} name="libelle" render={({ field }) => (
                           <FormItem><FormLabel>Libellé *</FormLabel><FormControl><Input placeholder="Chaudière principale" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="code" render={({ field }) => (
                           <FormItem><FormLabel>Code *</FormLabel><FormControl><Input placeholder="CH-001" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="codeBIM" render={({ field }) => (
                           <FormItem><FormLabel>Code BIM</FormLabel><FormControl><Input placeholder="BIM-XYZ-001" {...field} /></FormControl></FormItem>
                        )}/>
                        <FormField control={form.control} name="numIdentification" render={({ field }) => (
                           <FormItem><FormLabel>Numéro d'identification</FormLabel><FormControl><Input placeholder="ID-54321" {...field} /></FormControl></FormItem>
                        )}/>
                        <FormField control={form.control} name="quantite" render={({ field }) => (
                           <FormItem><FormLabel>Quantité</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/></FormControl></FormItem>
                        )}/>
                        <FormField control={form.control} name="statut" render={({ field }) => (
                           <FormItem><FormLabel>Statut *</FormLabel>
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                   <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                   <SelectContent>
                                       <SelectItem value="En service">En service</SelectItem>
                                       <SelectItem value="Hors service">Hors service</SelectItem>
                                       <SelectItem value="Alerte">Alerte</SelectItem>
                                       <SelectItem value="En veille">En veille</SelectItem>
                                   </SelectContent>
                               </Select>
                           </FormItem>
                        )}/>
                        <FormField control={form.control} name="etatSante" render={({ field }) => (
                           <FormItem><FormLabel>État de santé</FormLabel>
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                   <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                   <SelectContent>
                                       <SelectItem value="Bon">Bon</SelectItem>
                                       <SelectItem value="Moyen">Moyen</SelectItem>
                                       <SelectItem value="Mauvais">Mauvais</SelectItem>
                                       <SelectItem value="Critique">Critique</SelectItem>
                                   </SelectContent>
                               </Select>
                           </FormItem>
                        )}/>
                         <FormField control={form.control} name="equipementSensible" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-5"><div className="space-y-0.5"><FormLabel>Équipement sensible</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                        )}/>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Section Données GMAO */}
                    <div className="space-y-4 p-4 border rounded-md">
                        <h4 className="font-medium text-lg border-b pb-2">Données GMAO</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <FormField control={form.control} name="domaineGMAO" render={({ field }) => (
                                <FormItem><FormLabel>Domaine</FormLabel><FormControl><Input placeholder="CVC, Electricité..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="famille" render={({ field }) => (
                                <FormItem><FormLabel>Famille</FormLabel><FormControl><Input placeholder="Ex: PPEB" {...field} /></FormControl></FormItem>
                            )}/>
                             <FormField control={form.control} name="sousFamille" render={({ field }) => (
                                <FormItem><FormLabel>Sous-famille</FormLabel><FormControl><Input placeholder="Ex: Chaudière gaz" {...field} /></FormControl></FormItem>
                            )}/>
                        </div>
                    </div>

                    {/* Section Caractéristiques techniques */}
                    <div className="space-y-4 p-4 border rounded-md">
                        <h4 className="font-medium text-lg border-b pb-2">Caractéristiques techniques</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="typeEquipement" render={({ field }) => (
                                <FormItem className="col-span-2"><FormLabel>Type équipement *</FormLabel><FormControl><Input placeholder="CTA, Chaudière..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="marque" render={({ field }) => (
                                <FormItem><FormLabel>Marque</FormLabel><FormControl><Input placeholder="Siemens, Schneider..." {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField control={form.control} name="modele" render={({ field }) => (
                                <FormItem><FormLabel>Modèle</FormLabel><FormControl><Input placeholder="S7-1200" {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField control={form.control} name="reference" render={({ field }) => (
                                <FormItem><FormLabel>Référence</FormLabel><FormControl><Input placeholder="REF-001" {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField control={form.control} name="numeroSerie" render={({ field }) => (
                                <FormItem><FormLabel>Numéro de série</FormLabel><FormControl><Input placeholder="SN-ABC-123" {...field} /></FormControl></FormItem>
                            )}/>
                         </div>
                    </div>
                </div>
                
                 {/* Section Ressources & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-4 p-4 border rounded-md">
                         <h4 className="font-medium text-lg border-b pb-2">Ressources</h4>
                         <FormField control={form.control} name="photoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Photo générale</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-4">
                                        <Input placeholder="https://..." {...field} />
                                        <Button type="button" variant="outline"><UploadCloud className="mr-2"/>Uploader</Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Separator />
                        <div className="space-y-2">
                             <Label>QR Code</Label>
                             <div className="flex items-center gap-4">
                                {form.watch('qrCode') ? (
                                    <Image src={form.watch('qrCode')} alt="QR Code" width={80} height={80} className="rounded-md border p-1"/>
                                ) : (
                                    <div className="w-20 h-20 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
                                        <QrCode className="w-10 h-10"/>
                                    </div>
                                )}
                                 <Button type="button" variant="outline" onClick={handleGenerateQr} disabled={isGeneratingQr}>
                                     {isGeneratingQr ? <Loader2 className="mr-2 animate-spin" /> : <QrCode className="mr-2" />}
                                     {form.watch('qrCode') ? 'Regénérer le QR Code' : 'Générer le QR Code'}
                                </Button>
                             </div>
                             <FormField control={form.control} name="qrCode" render={({ field }) => (
                                <FormItem className="hidden"><FormControl><Input {...field} /></FormControl></FormItem>
                            )}/>
                        </div>
                    </div>
                    <div className="space-y-4 p-4 border rounded-md">
                         <h4 className="font-medium text-lg border-b pb-2">Domaine & Dates</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="domaineDate" render={({ field }) => (
                                <FormItem><FormLabel>Domaine</FormLabel><FormControl><Input placeholder="Sélectionner un domaine" {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField control={form.control} name="dateInstallation" render={({ field }) => (
                                <FormItem><FormLabel>Date d'installation</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                            )}/>
                            <FormField control={form.control} name="dateFinGarantie" render={({ field }) => (
                                <FormItem><FormLabel>Garantie (fin)</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                            )}/>
                             <FormField control={form.control} name="frequenceMaintenance" render={({ field }) => (
                                <FormItem><FormLabel>Fréq. maintenance (jours)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/></FormControl></FormItem>
                            )}/>
                          </div>
                    </div>
                </div>

                <Separator />
                <div className="flex justify-end gap-2">
                   <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Annuler</Button>
                   <Button type="submit" disabled={loading}>
                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {form.getValues('id') ? 'Modifier l\'équipement' : 'Enregistrer l\'équipement'}
                   </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par libellé, référence..."
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
                <SelectItem value="En service">En service</SelectItem>
                <SelectItem value="Alerte">Alerte</SelectItem>
                <SelectItem value="Hors service">Hors service</SelectItem>
                <SelectItem value="En veille">En veille</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow>
                  <TableHead className="w-[80px]">Image</TableHead><TableHead>Libellé / Référence</TableHead>
                  <TableHead>Domaine</TableHead><TableHead>Marque</TableHead><TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredItems?.length > 0 ? (
                  filteredItems.map(eq => (
                    <TableRow key={eq.id}>
                      <TableCell><Image src={eq.image || 'https://placehold.co/60'} alt={eq.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint="equipment"/></TableCell>
                      <TableCell><div className="font-medium">{eq.name}</div><div className="text-sm text-muted-foreground">{eq.reference}</div></TableCell>
                      <TableCell>{eq.domaineTechnique}</TableCell><TableCell>{eq.marque}</TableCell>
                      <TableCell><Badge variant={eq.statut === 'En service' ? 'default' : eq.statut === 'Alerte' ? 'secondary' : 'destructive'}>{eq.statut}</Badge></TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" className="h-8 w-8" title="Consulter"><Eye className="w-4 h-4" /></Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-8 w-8" 
                           title="Modifier"
                           onClick={() => handleEditEquipment(eq)}
                         >
                           <Edit className="w-4 h-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8" title="Dupliquer" onClick={() => onDuplicate(eq)}><Copy className="w-4 h-4" /></Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-8 w-8 text-destructive" 
                           title="Supprimer" 
                           onClick={() => handleDeleteEquipment(eq.id)}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : ( <TableRow><TableCell colSpan={6} className="text-center h-24">Aucun équipement.</TableCell></TableRow> )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddEditDialog({ item, itemType, onSave, trigger }) {
  const [name, setName] = useState(item?.name || '');
  const [image, setImage] = useState(item?.image || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!item;

  // Reset form when item changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setName(item?.name || '');
      setImage(item?.image || '');
    }
  }, [item, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le nom est requis.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // For sites, use API calls
      if (itemType === 'site') {
        if (isEditing) {
          // Update existing site
          const response = await fetch(`/api/sites/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name.trim(),
              image: image.trim() || null,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update site');
          }

          const updatedSite = await response.json();
          
          // Transform and pass to parent component
          const transformedSite = {
            ...item,
            name: updatedSite.name,
            image: updatedSite.image || `https://picsum.photos/seed/${updatedSite.name.replace(/\s+/g, '')}/400/300`,
          };
          
          onSave(transformedSite);
          
          toast({
            title: "Succès",
            description: "Site modifié avec succès.",
          });
        } else {
          // Create new site - this is handled by the existing onSave
          onSave({ name: name.trim(), image: image.trim() });
        }
      } 
      // For buildings, use API calls
      else if (itemType === 'building') {
        if (isEditing) {
          // Update existing building
          const response = await fetch(`/api/buildings/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name.trim(),
              image: image.trim() || null,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update building');
          }

          const updatedBuilding = await response.json();
          
          // Transform and pass to parent component
          const transformedBuilding = {
            ...item,
            name: updatedBuilding.name,
            image: updatedBuilding.image || `https://picsum.photos/seed/${updatedBuilding.name.replace(/\s+/g, '')}/400/300`,
          };
          
          onSave(transformedBuilding);
          
          toast({
            title: "Succès",
            description: "Bâtiment modifié avec succès.",
          });
        } else {
          // Create new building - this is handled by the existing onSave
          onSave({ name: name.trim(), image: image.trim() });
        }
      }
      // For levels, use API calls
      else if (itemType === 'level') {
        if (isEditing) {
          // Update existing level
          const response = await fetch(`/api/levels/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name.trim(),
              image: image.trim() || null,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update level');
          }

          const updatedLevel = await response.json();
          
          // Transform and pass to parent component
          const transformedLevel = {
            ...item,
            name: updatedLevel.name,
            image: updatedLevel.image || `https://picsum.photos/seed/${updatedLevel.name.replace(/\s+/g, '')}/400/300`,
          };
          
          onSave(transformedLevel);
          
          toast({
            title: "Succès",
            description: "Niveau modifié avec succès.",
          });
        } else {
          // Create new level - this is handled by the existing onSave
          onSave({ name: name.trim(), image: image.trim() });
        }
      }
      // For locations, use API calls
      else if (itemType === 'location') {
        if (isEditing) {
          // Update existing location
          const response = await fetch(`/api/locations/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name.trim(),
              image: image.trim() || null,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update location');
          }

          const updatedLocation = await response.json();
          
          // Transform and pass to parent component
          const transformedLocation = {
            ...item,
            name: updatedLocation.name,
            image: updatedLocation.image || `https://picsum.photos/seed/${updatedLocation.name.replace(/\s+/g, '')}/400/300`,
          };
          
          onSave(transformedLocation);
          
          toast({
            title: "Succès",
            description: "Local modifié avec succès.",
          });
        } else {
          // Create new location - this is handled by the existing onSave
          onSave({ name: name.trim(), image: image.trim() });
        }
      }
      else {
        // For other item types, use existing logic
        onSave({ ...(item || {}), name: name.trim(), image: image.trim() });
      }

      setIsOpen(false);
      setName('');
      setImage('');
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors de la sauvegarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier' : 'Ajouter'} un {itemType}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nom</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="col-span-3" 
              placeholder={`Nom du ${itemType}`}
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Image URL</Label>
            <Input 
              id="image" 
              value={image} 
              onChange={(e) => setImage(e.target.value)} 
              className="col-span-3" 
              placeholder="https://picsum.photos/400/300"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Sauvegarder' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const HIERARCHY = ['site', 'building', 'level', 'location', 'equipment'];

// Map French terms to database model names
const MODEL_MAPPING = {
  'site': 'site',
  'batiment': 'building', 
  'niveau': 'level',
  'local': 'location',
  'equipement': 'equipment'
};

// Transform database data to component format
const transformDataToHierarchy = (sites) => {
  return sites.map(site => ({
    id: site.id,
    name: site.name,
    type: 'site',
    image: site.image || `https://picsum.photos/seed/${site.name.replace(/\s+/g, '')}/400/300`,
    children: site.buildings?.map(building => ({
      id: building.id,
      name: building.name,
      type: 'building',
      image: building.image || `https://picsum.photos/seed/${building.name.replace(/\s+/g, '')}/400/300`,
      children: building.levels?.map(level => ({
        id: level.id,
        name: level.name,
        type: 'level',
        image: level.image || `https://picsum.photos/seed/${level.name.replace(/\s+/g, '')}/400/300`,
        children: level.locations?.map(location => ({
          id: location.id,
          name: location.name,
          type: 'location',
          image: location.image || `https://picsum.photos/seed/${location.name.replace(/\s+/g, '')}/400/300`,
          children: location.equipments?.map(equipment => ({
            id: equipment.id,
            name: equipment.libelle, // Use libelle as name for equipment
            type: 'equipment',
            code: equipment.code,
            image: equipment.image || equipment.photoUrl || `https://picsum.photos/seed/${equipment.code}/400/300`,
            // Include additional equipment data
            ...equipment
          })) || []
        })) || []
      })) || []
    })) || []
  }));
};

export default function HierarchyNavigator({ slug = [] }: { slug?: string[] }) {
  const { selectedClient } = useContext(ClientContext);
  const [treeData, setTreeData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pathname = usePathname();

  // Fetch sites with full hierarchy when selectedClient changes
  useEffect(() => {
    const fetchSitesWithHierarchy = async () => {
      if (!selectedClient) {
        setTreeData({});
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching sites with hierarchy for client:', selectedClient.id);
        
        // For now, we'll use the existing API endpoint
        // TODO: Create a new endpoint that includes the full hierarchy
        const response = await fetch(`/api/sites/client/${selectedClient.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch sites: ${response.statusText}`);
        }

        const sites = await response.json();
        console.log('Raw sites from API:', sites);
        
        // Transform the data to match component expectations
        const transformedSites = transformDataToHierarchy(sites);
        console.log('Transformed sites:', transformedSites);
        
        // Update treeData with the transformed sites
        setTreeData(prev => ({
          ...prev,
          [selectedClient.id]: transformedSites
        }));
      } catch (err) {
        console.error('Error fetching sites:', err);
        setError(err.message || 'Failed to fetch sites');
        setTreeData(prev => ({
          ...prev,
          [selectedClient.id]: []
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchSitesWithHierarchy();
  }, [selectedClient]);

  const { currentItem, itemsToList, parent, itemType } = useMemo(() => {
    if (!selectedClient) return { currentItem: null, itemsToList: [], parent: null, itemType: 'site' };
    
    let currentItems = treeData[selectedClient.id] || [];
    let currentParent = null;
    let foundItem: any = null;

    if (slug.length === 0) {
        return { currentItem: null, itemsToList: currentItems, parent: null, itemType: 'site'};
    }

    for (let i = 0; i < slug.length; i++) {
        const slugId = slug[i];
        foundItem = currentItems.find(item => item.id === slugId);
        if (foundItem) {
            currentParent = foundItem;
            currentItems = foundItem.children || [];
        } else {
            return { currentItem: null, itemsToList: [], parent: null, itemType: 'site' }; // Not found
        }
    }

    const currentTypeIndex = HIERARCHY.indexOf(foundItem.type);
    const nextType = HIERARCHY[currentTypeIndex + 1];

    return { currentItem: foundItem, itemsToList: currentItems, parent: currentParent, itemType: nextType };
  }, [slug, selectedClient, treeData]);

  const handleUpdate = (updatedItem) => {
    if (!selectedClient) return;

    const updateRecursively = (nodes, itemToUpdate) => {
      return nodes.map(node => {
        if (node.id === itemToUpdate.id) return itemToUpdate;
        if (node.children) {
          return { ...node, children: updateRecursively(node.children, itemToUpdate) };
        }
        return node;
      });
    };

    setTreeData(prev => ({
      ...prev,
      [selectedClient.id]: updateRecursively(prev[selectedClient.id], updatedItem)
    }));
  };

  const handleAddSite = async (newItemData) => {
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      
      const siteData = {
        name: newItemData.name,
        image: newItemData.image,
        clientId: selectedClient.id
      };
      
      console.log('Creating new site:', siteData);
      
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create site');
      }
      
      const newSite = await response.json();
      console.log('Site created successfully:', newSite);
      
      // Transform the new site to match component format
      const transformedSite = {
        id: newSite.id,
        name: newSite.name,
        type: 'site',
        image: newSite.image || `https://picsum.photos/seed/${newSite.name.replace(/\s+/g, '')}/400/300`,
        children: []
      };
      
      // Add to local state
      setTreeData(prev => ({
        ...prev,
        [selectedClient.id]: [...(prev[selectedClient.id] || []), transformedSite]
      }));
      
      // Show success message (if you have toast)
      // toast({ title: "Succès", description: "Site créé avec succès" });
      
    } catch (error) {
      console.error('Error creating site:', error);
      setError(error.message);
      // Show error message (if you have toast)
      // toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newItemData) => {
    if (!selectedClient) return;
    
    // For sites, use the API
    if (itemType === 'site') {
      await handleAddSite(newItemData);
      return;
    }
    
    // For buildings, use the API
    if (itemType === 'building') {
      await handleAddBuilding(newItemData);
      return;
    }
    
    // For levels, use the API
    if (itemType === 'level') {
      await handleAddLevel(newItemData);
      return;
    }
    
    // For locations, use the API
    if (itemType === 'location') {
      await handleAddLocation(newItemData);
      return;
    }
    
    // For other items, keep the existing logic
    const newItem = {
      id: `${itemType}-${Date.now()}`,
      name: newItemData.name,
      type: itemType,
      image: newItemData.image || `https://picsum.photos/seed/${newItemData.name?.replace(/\s+/g, '') || 'default'}/400/300`,
      ...(itemType !== 'equipment' && { children: [] }),
      ...newItemData
    };
  
    if (itemType === 'equipment') {
      newItem.code = newItemData.code || `EQ-${Date.now()}`;
      newItem.libelle = newItemData.name;
    }
  
    if (!currentItem) {
      console.warn('Unexpected case: adding item without currentItem for non-site type');
      return;
    } else {
      const newCurrentItem = {
        ...currentItem, 
        children: [...(currentItem.children || []), newItem]
      };
      handleUpdate(newCurrentItem);
    }
  };

  const handleEditSite = async (updatedSiteData) => {
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/sites/${updatedSiteData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedSiteData.name,
          image: updatedSiteData.image,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update site');
      }
      
      const updatedSite = await response.json();
      console.log('Site updated successfully:', updatedSite);
      
      // Update local state
      setTreeData(prev => ({
        ...prev,
        [selectedClient.id]: (prev[selectedClient.id] || []).map(site => 
          site.id === updatedSite.id 
            ? { ...site, name: updatedSite.name, image: updatedSite.image }
            : site
        )
      }));
      
    } catch (error) {
      console.error('Error updating site:', error);
      setError(error.message);
      throw error; // Re-throw to let AddEditDialog handle the toast
    } finally {
      setLoading(false);
    }
  };

  // Add after handleEditSite function
const handleAddBuilding = async (newItemData) => {
  if (!selectedClient || !currentItem) return;
  
  try {
    setLoading(true);
    
    const buildingData = {
      name: newItemData.name,
      image: newItemData.image,
      siteId: currentItem.id // The current site
    };
    
    console.log('Creating new building:', buildingData);
    
    const response = await fetch('/api/buildings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildingData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create building');
    }
    
    const newBuilding = await response.json();
    console.log('Building created successfully:', newBuilding);
    
    // Transform the new building to match component format
    const transformedBuilding = {
      id: newBuilding.id,
      name: newBuilding.name,
      type: 'building',
      image: newBuilding.image || `https://picsum.photos/seed/${newBuilding.name.replace(/\s+/g, '')}/400/300`,
      children: []
    };
    
    // Add to current site's children
    const updatedSite = {
      ...currentItem,
      children: [...(currentItem.children || []), transformedBuilding]
    };
    
    handleUpdate(updatedSite);
    
  } catch (error) {
    console.error('Error creating building:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const handleEditBuilding = async (updatedBuildingData) => {
  try {
    setLoading(true);
    
    const response = await fetch(`/api/buildings/${updatedBuildingData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updatedBuildingData.name,
        image: updatedBuildingData.image,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update building');
    }
    
    const updatedBuilding = await response.json();
    console.log('Building updated successfully:', updatedBuilding);
    
    // Update in the hierarchy
    handleUpdate({
      ...updatedBuildingData,
      name: updatedBuilding.name,
      image: updatedBuilding.image
    });
    
  } catch (error) {
    console.error('Error updating building:', error);
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};

const handleDeleteBuilding = async (buildingId) => {
  try {
    setLoading(true);
    
    const response = await fetch(`/api/buildings/${buildingId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete building');
    }
    
    console.log('Building deleted successfully');
    
    // Remove from local state
    const deleteRecursively = (nodes, idToDelete) => {
      return nodes.filter(node => {
        if (node.id === idToDelete) return false;
        if (node.children) {
          node.children = deleteRecursively(node.children, idToDelete);
        }
        return true;
      });
    };
    
    setTreeData(prev => ({
      ...prev,
      [selectedClient.id]: deleteRecursively(prev[selectedClient.id], buildingId)
    }));
    
  } catch (error) {
    console.error('Error deleting building:', error);
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};

// Add level management functions
const handleAddLevel = async (newItemData) => {
  if (!selectedClient || !currentItem) return;
  
  try {
    setLoading(true);
    
    const levelData = {
      name: newItemData.name,
      image: newItemData.image,
      buildingId: currentItem.id // The current building
    };
    
    console.log('Creating new level:', levelData);
    
    const response = await fetch('/api/levels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(levelData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create level');
    }
    
    const newLevel = await response.json();
    console.log('Level created successfully:', newLevel);
    
    // Transform the new level to match component format
    const transformedLevel = {
      id: newLevel.id,
      name: newLevel.name,
      type: 'level',
      image: newLevel.image || `https://picsum.photos/seed/${newLevel.name.replace(/\s+/g, '')}/400/300`,
      children: []
    };
    
    // Add to current building's children
    const updatedBuilding = {
      ...currentItem,
      children: [...(currentItem.children || []), transformedLevel]
    };
    
    handleUpdate(updatedBuilding);
    
  } catch (error) {
    console.error('Error creating level:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const handleEditLevel = async (updatedLevelData) => {
  try {
    setLoading(true);
    
    const response = await fetch(`/api/levels/${updatedLevelData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updatedLevelData.name,
        image: updatedLevelData.image,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update level');
    }
    
    const updatedLevel = await response.json();
    console.log('Level updated successfully:', updatedLevel);
    
    // Update in the hierarchy
    handleUpdate({
      ...updatedLevelData,
      name: updatedLevel.name,
      image: updatedLevel.image
    });
    
  } catch (error) {
    console.error('Error updating level:', error);
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};

const handleDeleteLevel = async (levelId) => {
  try {
    setLoading(true);
    
    const response = await fetch(`/api/levels/${levelId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete level');
    }
    
    console.log('Level deleted successfully');
    
    // Remove from local state
    const deleteRecursively = (nodes, idToDelete) => {
      return nodes.filter(node => {
        if (node.id === idToDelete) return false;
        if (node.children) {
          node.children = deleteRecursively(node.children, idToDelete);
        }
        return true;
      });
    };
    
    setTreeData(prev => ({
      ...prev,
      [selectedClient.id]: deleteRecursively(prev[selectedClient.id], levelId)
    }));
    
  } catch (error) {
    console.error('Error deleting level:', error);
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};

// Add location management functions
const handleAddLocation = async (newItemData) => {
  if (!selectedClient || !currentItem) return;
  
  try {
    setLoading(true);
    
    const locationData = {
      name: newItemData.name,
      image: newItemData.image,
      levelId: currentItem.id // The current level
    };
    
    console.log('Creating new location:', locationData);
    
    const response = await fetch('/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create location');
    }
    
    const newLocation = await response.json();
    console.log('Location created successfully:', newLocation);
    
    // Transform the new location to match component format
    const transformedLocation = {
      id: newLocation.id,
      name: newLocation.name,
      type: 'location',
      image: newLocation.image || `https://picsum.photos/seed/${newLocation.name.replace(/\s+/g, '')}/400/300`,
      children: []
    };
    
    // Add to current level's children
    const updatedLevel = {
      ...currentItem,
      children: [...(currentItem.children || []), transformedLocation]
    };
    
    handleUpdate(updatedLevel);
    
  } catch (error) {
    console.error('Error creating location:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const handleEditLocation = async (updatedLocationData) => {
  try {
    setLoading(true);
    
    const response = await fetch(`/api/locations/${updatedLocationData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updatedLocationData.name,
        image: updatedLocationData.image,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update location');
    }
    
    const updatedLocation = await response.json();
    console.log('Location updated successfully:', updatedLocation);
    
    // Update in the hierarchy
    handleUpdate({
      ...updatedLocationData,
      name: updatedLocation.name,
      image: updatedLocation.image
    });
    
  } catch (error) {
    console.error('Error updating location:', error);
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};

const handleDeleteLocation = async (locationId) => {
  try {
    setLoading(true);
    
    const response = await fetch(`/api/locations/${locationId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete location');
    }
    
    console.log('Location deleted successfully');
    
    // Remove from local state
    const deleteRecursively = (nodes, idToDelete) => {
      return nodes.filter(node => {
        if (node.id === idToDelete) return false;
        if (node.children) {
          node.children = deleteRecursively(node.children, idToDelete);
        }
        return true;
      });
    };
    
    setTreeData(prev => ({
      ...prev,
      [selectedClient.id]: deleteRecursively(prev[selectedClient.id], locationId)
    }));
    
  } catch (error) {
    console.error('Error deleting location:', error);
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};

const handleUpdateItem = async (updatedItem) => {
  if (!selectedClient) return;

  // For sites, use API call
  if (updatedItem.type === 'site') {
    await handleEditSite(updatedItem);
    return;
  }

  // For buildings, use API call
  if (updatedItem.type === 'building') {
    await handleEditBuilding(updatedItem);
    return;
  }

  // For levels, use API call
  if (updatedItem.type === 'level') {
    await handleEditLevel(updatedItem);
    return;
  }

  // For locations, use API call
  if (updatedItem.type === 'location') {
    await handleEditLocation(updatedItem);
    return;
  }

  // For other items, use existing recursive update logic
  const updateRecursively = (nodes, itemToUpdate) => {
    return nodes.map(node => {
      if (node.id === itemToUpdate.id) return itemToUpdate;
      if (node.children) {
        return { ...node, children: updateRecursively(node.children, itemToUpdate) };
      }
      return node;
    });
  };

  setTreeData(prev => ({
    ...prev,
    [selectedClient.id]: updateRecursively(prev[selectedClient.id], updatedItem)
  }));
};

  const handleDeleteSite = async (siteId) => {
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete site');
      }
      
      console.log('Site deleted successfully');
      
      // Remove from local state
      setTreeData(prev => ({
        ...prev,
        [selectedClient.id]: (prev[selectedClient.id] || []).filter(site => site.id !== siteId)
      }));
      
    } catch (error) {
      console.error('Error deleting site:', error);
      setError(error.message);
      throw error; // Re-throw to let DeleteConfirmDialog handle the toast
    } finally {
      setLoading(false);
    }
  };

// Replace the existing DeleteConfirmDialog function with this fixed version:

function DeleteConfirmDialog({ item, itemType, onDelete, trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // For sites, use API call
      if (itemType === 'site') {
        const response = await fetch(`/api/sites/${item.id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete site');
        }
  
        toast({
          title: "Succès",
          description: "Site supprimé avec succès.",
        });
      } 
      // For buildings, use API call
      else if (itemType === 'building') {
        const response = await fetch(`/api/buildings/${item.id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete building');
        }
  
        toast({
          title: "Succès",
          description: "Bâtiment supprimé avec succès.",
        });
      } 
      // For levels, use API call
      else if (itemType === 'level') {
        const response = await fetch(`/api/levels/${item.id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete level');
        }
  
        toast({
          title: "Succès",
          description: "Niveau supprimé avec succès.",
        });
      } 
      // For locations, use API call
      else if (itemType === 'location') {
        const response = await fetch(`/api/locations/${item.id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete location');
        }
  
        toast({
          title: "Succès",
          description: "Local supprimé avec succès.",
        });
      } 
      else {
        toast({
          title: "Succès",
          description: `${itemType} supprimé avec succès.`,
        });
      }
      
      onDelete(item.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors de la suppression.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}>
          {trigger}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer "<span className="font-medium">{item?.name}</span>" ? 
            {itemType === 'site' && (
              <span className="block mt-2 text-destructive">
                Tous les bâtiments, niveaux, locaux et équipements associés seront également supprimés.
              </span>
            )}
            <span className="block mt-2 font-medium">Cette action est irréversible.</span>
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
  

const handleDeleteItem = async (itemId, itemType) => {
  if (!selectedClient) return;

  // For sites, use API call
  if (itemType === 'site') {
    await handleDeleteSite(itemId);
    return;
  }

  // For buildings, use API call
  if (itemType === 'building') {
    await handleDeleteBuilding(itemId);
    return;
  }

  // For levels, use API call
  if (itemType === 'level') {
    await handleDeleteLevel(itemId);
    return;
  }

  // For locations, use API call
  if (itemType === 'location') {
    await handleDeleteLocation(itemId);
    return;
  }

  // For other items, use existing recursive delete logic
  const deleteRecursively = (nodes, idToDelete) => {
    return nodes.filter(node => {
      if (node.id === idToDelete) return false;
      if (node.children) {
        node.children = deleteRecursively(node.children, idToDelete);
      }
      return true;
    });
  };
  
  setTreeData(prev => ({
    ...prev,
    [selectedClient.id]: deleteRecursively(prev[selectedClient.id], itemId)
  }));
};

  const handleDelete = (itemId) => {
     if (!selectedClient) return;
      const deleteRecursively = (nodes, idToDelete) => {
          return nodes.filter(node => {
              if (node.id === idToDelete) return false;
              if (node.children) {
                  node.children = deleteRecursively(node.children, idToDelete);
              }
              return true;
          });
      };
      setTreeData(prev => ({
          ...prev,
          [selectedClient.id]: deleteRecursively(prev[selectedClient.id], itemId)
      }))
  }
  
  const handleDuplicate = (itemToDuplicate) => {
    const newItem = {
      ...itemToDuplicate,
      id: `${itemToDuplicate.type}-${Date.now()}`,
      name: `${itemToDuplicate.name} (copie)`,
    };
    
    // For equipment, handle code duplication
    if (itemToDuplicate.type === 'equipment' && itemToDuplicate.code) {
      newItem.code = `${itemToDuplicate.code}-copie`;
      newItem.libelle = `${itemToDuplicate.libelle || itemToDuplicate.name} (copie)`;
    }
    
    handleAdd(newItem);
  }

  const handleUpdateEquipment = (updatedEquipment) => {
    if (!selectedClient) return;

    // Check if this is a new equipment (no existing ID in the hierarchy)
    const isNewEquipment = !itemsToList.find(item => item.id === updatedEquipment.id);

    if (isNewEquipment) {
      // Add new equipment to current location
      const addToCurrentLocation = (nodes, targetLocationId) => {
        return nodes.map(node => {
          if (node.id === targetLocationId) {
            return {
              ...node,
              children: [...(node.children || []), updatedEquipment]
            };
          }
          if (node.children) {
            return { ...node, children: addToCurrentLocation(node.children, targetLocationId) };
          }
          return node;
        });
      };

      setTreeData(prev => ({
        ...prev,
        [selectedClient.id]: addToCurrentLocation(prev[selectedClient.id], currentItem?.id)
      }));
    } else {
      // Update existing equipment
      const updateRecursively = (nodes, itemToUpdate) => {
        return nodes.map(node => {
          if (node.id === itemToUpdate.id) return itemToUpdate;
          if (node.children) {
            return { ...node, children: updateRecursively(node.children, itemToUpdate) };
          }
          return node;
        });
      };

      setTreeData(prev => ({
        ...prev,
        [selectedClient.id]: updateRecursively(prev[selectedClient.id], updatedEquipment)
      }));
    }
  };

  if (!selectedClient) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-muted-foreground">Veuillez sélectionner un client pour voir son arborescence.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des sites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Erreur lors du chargement des sites: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-red-600 underline hover:text-red-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Get display names for French UI
  const getDisplayType = (type) => {
    const typeMap = {
      'site': 'site',
      'building': 'bâtiment',
      'level': 'niveau', 
      'location': 'local',
      'equipment': 'équipement'
    };
    return typeMap[type] || type;
  };

  const getDisplayTypePlural = (type) => {
    const typeMap = {
      'site': 'sites',
      'building': 'bâtiments',
      'level': 'niveaux',
      'location': 'locaux', 
      'equipment': 'équipements'
    };
    return typeMap[type] || type;
  };
  
  const title = currentItem ? currentItem.name : `Arborescence de ${selectedClient.name}`;
  const description = currentItem 
    ? `Gestion des ${getDisplayTypePlural(itemType)} pour ${currentItem.name}` 
    : "Gérez les sites, bâtiments, niveaux, locaux et équipements de votre client.";

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      {currentItem && (
        <Card className="overflow-hidden">
            <div className="relative h-48 w-full">
                <Image 
                  src={currentItem.image || 'https://placehold.co/600x400'} 
                  alt={currentItem.name} 
                  fill 
                  objectFit="cover" 
                  data-ai-hint="building exterior"
                />
            </div>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  {ICONS?.[currentItem.type]} {currentItem.name}
                </CardTitle>
                {currentItem.type === 'equipment' && currentItem.code && (
                  <p className="text-sm text-muted-foreground">Code: {currentItem.code}</p>
                )}
            </CardHeader>
        </Card>
      )}

      {itemType !== 'equipment' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                {ICONS?.[itemType]} {getDisplayTypePlural(itemType).charAt(0).toUpperCase() + getDisplayTypePlural(itemType).slice(1)}
              </CardTitle>
              <AddEditDialog
                item={null}
                itemType={itemType}
                onSave={handleAdd}
                trigger={<Button size="sm"><PlusCircle className="mr-2"/>Ajouter un {getDisplayType(itemType)}</Button>}
              />
            </div>
          </CardHeader>
          <CardContent>
            {itemsToList.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Enfants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsToList.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Image 
                            src={item.image || 'https://placehold.co/60'} 
                            alt={item.name} 
                            width={60} 
                            height={60} 
                            className="rounded-md object-cover" 
                            data-ai-hint="building"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          {item.type === 'equipment' && item.code && (
                            <div className="text-sm text-muted-foreground">{item.code}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {item.children?.length || 0} {getDisplayTypePlural(HIERARCHY[HIERARCHY.indexOf(item.type) + 1])}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            title="Consulter"
                          >
                            <Link href={`${pathname}/${item.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <AddEditDialog 
                            item={item} 
                            itemType={item.type} 
                            onSave={handleUpdateItem} 
                            trigger={
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4"/>
                              </Button>
                            }
                          />
                          <DeleteConfirmDialog
                            item={item}
                            itemType={item.type}
                            onDelete={(itemId:any) => handleDeleteItem(itemId, item.type)}
                            trigger={
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive" 
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4"/>
                              </Button>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Aucun {getDisplayTypePlural(itemType)} pour le moment.</p>
                <AddEditDialog
                  item={null}
                  itemType={itemType}
                  onSave={handleAdd}
                  trigger={<Button variant="link" className="mt-2">Commencez par en ajouter un.</Button>}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <EquipmentManager 
          items={itemsToList} 
          onUpdate={handleUpdateEquipment}
          onDelete={(itemId) => handleDeleteItem(itemId, 'equipment')}
          onDuplicate={handleDuplicate}
          currentItem={currentItem}
        />
      )}
    </div>
  );
}

    