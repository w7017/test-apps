
"use client";

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockEquipments = [
    { id: 'eq-1', name: 'Presse Hydraulique P-101' },
    { id: 'eq-2', name: 'Convoyeur C-203' },
    { id: 'eq-3', name: 'Serveur S-01' },
    { id: 'eq-4', name: 'Climatiseur CLIM-12' },
]

function AddInterventionForm({ onAddEvent, resources, equipments }) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [resourceId, setResourceId] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !start || !resourceId) return;
    
    const newEvent = {
      id: String(Date.now()),
      title,
      start,
      end,
      resourceId,
      color: '#' + Math.floor(Math.random()*16777215).toString(16) // random color for new event
    };
    
    onAddEvent(newEvent);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Titre de l'intervention</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Maintenance préventive" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="start">Date de début</Label>
                <Input id="start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="end">Date de fin</Label>
                <Input id="end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="equipment">Équipement</Label>
            <Select>
                <SelectTrigger id="equipment"><SelectValue placeholder="Sélectionner un équipement" /></SelectTrigger>
                <SelectContent>
                    {equipments.map(eq => <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
         <div className="grid gap-2">
            <Label htmlFor="resource">Assigner à</Label>
             <Select onValueChange={setResourceId} value={resourceId} required>
                <SelectTrigger id="resource"><SelectValue placeholder="Sélectionner un technicien" /></SelectTrigger>
                <SelectContent>
                    {resources.map(res => <SelectItem key={res.id} value={res.id}>{res.title}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>
       <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit">Ajouter l'intervention</Button>
        </DialogFooter>
    </form>
  )
}


export function PpaCalendar({ events, resources }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // onAddEvent is not used here anymore, it's handled by the parent
  const handleAddEvent = (event) => {
    // setEvents(prev => [...prev, event]);
    setIsDialogOpen(false); // Close dialog on submit
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Calendrier de Maintenance</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une intervention
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle Intervention</DialogTitle>
              <DialogDescription>Planifiez une nouvelle tâche de maintenance.</DialogDescription>
            </DialogHeader>
            <AddInterventionForm 
              onAddEvent={handleAddEvent}
              resources={resources}
              equipments={mockEquipments}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border p-4 bg-card">
           <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, resourceTimeGridPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,resourceTimeGridDay,listWeek'
            }}
            initialView="dayGridMonth"
            weekends={true}
            events={events}
            resources={resources}
            editable={true}
            selectable={true}
            droppable={true}
            selectMirror={true}
            dayMaxEvents={true}
            height="auto"
            locale="fr"
            buttonText={{
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                list: "Liste",
            }}
            // eventDrop={(info) => console.log('event drop', info)}
            // eventResize={(info) => console.log('event resize', info)}
            // select={(info) => console.log('select', info)}
          />
        </div>
      </CardContent>
    </Card>
  );
}