
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MoreHorizontal, Search, Trash2, Copy, Pencil } from 'lucide-react';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  assignee: string;
  status: 'À faire' | 'Imminent' | 'En cours' | 'En retard' | 'Terminé';
  priority: 'Basse' | 'Moyenne' | 'Haute' | 'Critique';
  color: string;
  tempStartDate?: string;
  tempEndDate?: string;
}

const statusConfig = {
  'À faire': { color: 'bg-gray-100 text-gray-800', label: 'À faire' },
  'Imminent': { color: 'bg-blue-100 text-blue-800', label: 'Imminent' },
  'En cours': { color: 'bg-yellow-100 text-yellow-800', label: 'En cours' },
  'En retard': { color: 'bg-red-100 text-red-800', label: 'En retard' },
  'Terminé': { color: 'bg-green-100 text-green-800', label: 'Terminé' },
};

const priorityConfig = {
    'Basse': { color: 'bg-gray-200', label: 'Basse'},
    'Moyenne': { color: 'bg-yellow-400', label: 'Moyenne'},
    'Haute': { color: 'bg-orange-500', label: 'Haute'},
    'Critique': { color: 'bg-red-600', label: 'Critique'}
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  // Assuming yyyy-MM-dd format from Gantt
  const date = parseISO(dateString + 'T00:00:00');
  return format(date, 'dd MMM yyyy', { locale: fr });
};

function StatusBadge({ status }: { status: Task['status'] }) {
  const config = statusConfig[status] || statusConfig['À faire'];
  return <Badge className={cn('border-transparent', config.color)}>{config.label}</Badge>;
}

function AddEditTaskDialog({
    task,
    resources,
    onSave,
    children,
    isOpen,
    setIsOpen
}: {
    task?: Task | null,
    resources: {id: string, title: string}[],
    onSave: (task: Omit<Task, 'id'> | Task) => void,
    children: React.ReactNode,
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState('');
    const [status, setStatus] = useState<Task['status']>('À faire');
    const [priority, setPriority] = useState<Task['priority']>('Moyenne');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const isEditing = useMemo(() => !!task, [task]);

    useEffect(() => {
        if(task && isOpen) {
            setTitle(task.title);
            setDescription(task.description);
            setAssignee(task.assignee);
            setStatus(task.status);
            setPriority(task.priority);
            setStartDate(task.startDate);
            setEndDate(task.endDate);
        } else {
             setTitle('');
            setDescription('');
            setAssignee('');
            setStatus('À faire');
            setPriority('Moyenne');
            setStartDate('');
            setEndDate('');
        }
    }, [task, isOpen]);


    const handleSubmit = () => {
        const taskData = {
            title, description, assignee, status, priority, startDate, endDate,
            color: 'bg-blue-500' // Default color for now
        };
        if(isEditing && task) {
            onSave({ ...task, ...taskData });
        } else {
            onSave(taskData);
        }
        setIsOpen(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {children}
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifier la tâche' : 'Ajouter une nouvelle tâche'}</DialogTitle>
                    <DialogDescription>
                        Remplissez les détails de l'intervention.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Titre de la tâche</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Maintenance préventive CVC" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions pour les intervenants..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Date de début</Label>
                            <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endDate">Date de fin</Label>
                            <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="assignee">Assigner à</Label>
                             <Select value={assignee} onValueChange={setAssignee}>
                                <SelectTrigger id="assignee"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                <SelectContent>
                                    {resources.map(res => <SelectItem key={res.id} value={res.id}>{res.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Statut</Label>
                            <Select value={status} onValueChange={(v: Task['status']) => setStatus(v)}>
                                <SelectTrigger id="status"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Criticité</Label>
                            <Select value={priority} onValueChange={(v: Task['priority']) => setPriority(v)}>
                                <SelectTrigger id="priority"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(priorityConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
                    <Button onClick={handleSubmit}>{isEditing ? 'Sauvegarder' : 'Ajouter la tâche'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export function PpaTasks({ tasks, onAddTask, onUpdateTask, onDeleteTask, resources }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasks, searchTerm]);
  
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  }

  const handleAdd = () => {
    setSelectedTask(null);
    setIsDialogOpen(true);
  }

  const handleDuplicate = (task: Task) => {
    const newTask = {
      ...task,
      title: `${task.title} (Copie)`,
      startDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    }
    onAddTask(newTask);
  }

  const handleSave = (taskData) => {
    if ('id' in taskData) {
        onUpdateTask(taskData);
    } else {
        onAddTask(taskData);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Liste des Tâches</CardTitle>
          <CardDescription>Gérez toutes les interventions planifiées.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une tâche..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AddEditTaskDialog 
                isOpen={isDialogOpen} 
                setIsOpen={setIsDialogOpen}
                task={selectedTask}
                resources={resources}
                onSave={handleSave}
            >
                <Button onClick={handleAdd}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter
                </Button>
            </AddEditTaskDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Tâche</TableHead>
                <TableHead>Assignation</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                        <div className={cn("w-3 h-10 rounded-full", priorityConfig[task.priority]?.color || 'bg-gray-200')}></div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground italic">{task.description}</div>
                    </TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell>
                      {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Ouvrir le menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(task)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(task)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => onDeleteTask(task.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucune tâche trouvée.
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
