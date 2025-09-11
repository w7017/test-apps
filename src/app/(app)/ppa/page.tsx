
'use client';

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, GanttChartSquare, ListTodo } from "lucide-react";
import { PpaCalendar } from "./ppa-calendar";
import { PpaGantt } from "./ppa-gantt";
import { PpaTasks, type Task } from "./ppa-tasks";
import { parse, format } from 'date-fns';

const DATE_FORMAT = 'yyyy-MM-dd';

const initialMockTasks: Task[] = [
  { id: 'task-1', title: 'Visite de chantier', description: 'Inspection générale du site Alpha.', startDate: '2024-09-30', endDate: '2024-09-30', color: 'bg-gray-400', assignee: 'Équipe A', status: 'Terminé', priority: 'Moyenne' },
  { id: 'task-2', title: 'Contrôle sécurité', description: 'Vérification des équipements de sécurité incendie.', startDate: '2024-10-01', endDate: '2024-10-22', color: 'bg-orange-400', assignee: 'Jean Dupont', status: 'En cours', priority: 'Haute' },
  { id: 'task-3', title: 'Pose fenêtre', description: 'Installation des fenêtres du 1er étage, bâtiment B.', startDate: '2024-10-06', endDate: '2024-10-12', color: 'bg-green-500', assignee: 'Alice Martin', status: 'En cours', priority: 'Moyenne' },
  { id: 'task-4', title: 'Vérifier sprinkleur', description: 'Test mensuel du système de sprinklers.', startDate: '2024-10-14', endDate: '2024-10-15', color: 'bg-red-500', assignee: 'Équipe CVC', status: 'Imminent', priority: 'Critique' },
  { id: 'task-5', title: 'Manque pré-découpe plafond', description: 'Ajustement des découpes pour le passage des gaines.', startDate: '2024-10-15', endDate: '2024-10-20', color: 'bg-yellow-500', assignee: 'Marc Petit', status: 'À faire', priority: 'Basse' },
  { id: 'task-6', title: 'Déplacer boîtier électrique', description: 'Déplacement du boîtier B-12 de 2 mètres.', startDate: '2024-10-16', endDate: '2024-10-23', color: 'bg-yellow-500', assignee: 'Électriciens', status: 'En cours', priority: 'Haute' },
  { id: 'task-7', title: 'Mise en service pompe', description: 'Démarrage et tests de la pompe P-101.', startDate: '2024-10-18', endDate: '2024-10-25', color: 'bg-orange-400', assignee: 'Jean Dupont', status: 'En retard', priority: 'Critique' },
  { id: 'task-8', title: 'Basse tension', description: 'Raccordement des circuits basse tension.', startDate: '2024-10-20', endDate: '2024-10-27', color: 'bg-green-500', assignee: 'Électriciens', status: 'À faire', priority: 'Moyenne' },
  { id: 'task-9', title: 'Reprendre mise à la terre', description: 'Vérification et correction de la mise à la terre générale.', startDate: '2024-10-22', endDate: '2024-11-01', color: 'bg-orange-400', assignee: 'Équipe B', status: 'À faire', priority: 'Haute' },
  { id: 'task-10', title: 'Vérifier raccordement', description: 'Inspection visuelle des raccordements CVC.', startDate: '2024-10-25', endDate: '2024-10-28', color: 'bg-red-500', assignee: 'Alice Martin', status: 'Imminent', priority: 'Critique' },
];

export default function PpaPage() {
  const [tasks, setTasks] = useState<Task[]>(initialMockTasks);

  const calendarEvents = tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: parse(task.startDate, DATE_FORMAT, new Date()),
      end: parse(task.endDate, DATE_FORMAT, new Date()),
      resourceId: task.assignee, // Assuming assignee can map to a resourceId
      color: task.color.replace('bg-', '#').split('-')[0] // A bit hacky way to get a color
  }));
  
  const resources = Array.from(new Set(tasks.map(t => t.assignee))).map(assignee => ({
      id: assignee,
      title: assignee
  }));

  const handleUpdateTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
  };
  
  const handleAddTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
    };
    setTasks(prev => [...prev, newTask]);
  }
  
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          Plan Préventif Annuel (PPA)
        </h2>
        <p className="text-muted-foreground">
          Planifiez, visualisez et ajustez vos interventions de maintenance préventive.
        </p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
          <TabsTrigger value="tasks">
            <ListTodo className="mr-2 h-4 w-4" />
            Tâches
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="gantt">
            <GanttChartSquare className="mr-2 h-4 w-4" />
            Diagramme de Gantt
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-6">
            <PpaTasks 
              tasks={tasks} 
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              resources={resources}
            />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <PpaCalendar events={calendarEvents} resources={resources}/>
        </TabsContent>
        <TabsContent value="gantt" className="mt-6">
            <PpaGantt tasks={tasks} setTasks={handleUpdateTasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}