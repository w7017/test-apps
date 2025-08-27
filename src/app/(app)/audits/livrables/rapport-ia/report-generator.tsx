
'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateAuditReport, type GenerateAuditReportOutput } from '@/ai/flows/generate-audit-report';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, AlertTriangle, Download, Edit, Eye, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const generateFormSchema = z.object({
  reportName: z.string().min(3, "Le nom du rapport est requis."),
  scopeType: z.enum(['site', 'building']),
  scopeId: z.string().min(1, "Veuillez sélectionner un périmètre."),
});

type GenerateFormValues = z.infer<typeof generateFormSchema>;

// Mock data for sites and buildings
const mockData = {
    sites: [
        { id: 'site-1', name: 'Site de Production Alpha' },
        { id: 'site-2', name: 'Entrepôt Logistique Bravo' }
    ],
    buildings: [
        { id: 'bat-1', name: 'Bâtiment Principal (Site Alpha)', siteId: 'site-1' },
        { id: 'bat-2', name: 'Bâtiment Secondaire (Site Alpha)', siteId: 'site-1' },
    ]
};

const mockReports = [
    { id: 'rep-1', name: "Rapport Mensuel - Site Alpha", scope: "Site de Production Alpha", date: "2024-07-15", status: "Généré"},
    { id: 'rep-2', name: "Analyse Bâtiment Principal", scope: "Bâtiment Principal", date: "2024-07-10", status: "En cours"},
    { id: 'rep-3', name: "Rapport d'incident CVC", scope: "Bâtiment Principal", date: "2024-06-28", status: "Archivé"},
];


export function ReportDashboard() {
  const [reports, setReports] = useState(mockReports);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      reportName: '',
    },
  });
  
  const scopeType = form.watch('scopeType');

  const onSubmit: SubmitHandler<GenerateFormValues> = async (data) => {
    setIsGenerating(true);
    // In a real app, you would fetch audit data based on scopeId
    const auditData = `Données d'audit collectées pour le ${data.scopeType} avec l'ID ${data.scopeId}. Le rapport concerne ${data.reportName}.`;

    try {
      // We pass a dummy string for now.
      const result = await generateAuditReport({ auditData });
      const newReport = {
        id: `rep-${Date.now()}`,
        name: data.reportName,
        scope: data.scopeType === 'site' 
            ? mockData.sites.find(s => s.id === data.scopeId)?.name || 'N/A'
            : mockData.buildings.find(b => b.id === data.scopeId)?.name || 'N/A',
        date: new Date().toISOString().split('T')[0],
        status: 'Généré'
      };
      setReports(prev => [newReport, ...prev]);
      
      toast({
        title: "Rapport généré avec succès",
        description: "Le nouveau rapport est disponible dans la liste.",
      });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "La génération a échoué",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Vos Rapports</CardTitle>
            <CardDescription>Liste des rapports d'audit générés par l'IA.</CardDescription>
        </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Générer un rapport
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Générer un nouveau rapport</DialogTitle>
                            <DialogDescription>
                                Sélectionnez le périmètre pour que l'IA collecte les données et génère le rapport.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                           <FormField
                                control={form.control}
                                name="reportName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom du rapport</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Ex: Rapport Mensuel Q3" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="scopeType"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Type de périmètre</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez un type" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="site">Site</SelectItem>
                                        <SelectItem value="building">Bâtiment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {scopeType && (
                                <FormField
                                    control={form.control}
                                    name="scopeId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Périmètre spécifique</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Sélectionnez un ${scopeType === 'site' ? 'site' : 'bâtiment'}`} />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {(scopeType === 'site' ? mockData.sites : mockData.buildings).map(item => (
                                                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isGenerating}>
                                {isGenerating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Wand2 className="mr-2 h-4 w-4" />
                                )}
                                Lancer la génération
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du Rapport</TableHead>
                  <TableHead>Périmètre</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.scope}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.status}</TableCell>
                      <TableCell className="text-right">
                         <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" title="Consulter">
                                <Eye className="h-4 w-4"/>
                            </Button>
                            <Button variant="ghost" size="icon" title="Modifier">
                                <Edit className="h-4 w-4"/>
                            </Button>
                             <Button variant="ghost" size="icon" title="Télécharger">
                                <Download className="h-4 w-4"/>
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Aucun rapport généré pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
      </CardContent>
    </Card>
  );
}
