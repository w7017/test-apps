
'use client';

import { useContext, useState } from 'react';
import { ClientContext, type Client } from '@/contexts/client-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Building,
  CheckCircle,
  PlusCircle,
  Edit,
  Trash2
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';


const initialClients = [
  { id: 'client-1', name: 'Client Alpha', description: 'Grand compte industriel avec plusieurs sites de production.' },
  { id: 'client-2', name: 'Client Bravo', description: 'Réseau de boutiques dans le secteur du retail.' },
  { id: 'client-3', name: 'Client Charlie', description: 'Gestionnaire de parc immobilier de bureaux.' },
  { id: 'client-4', name: 'Client Delta', description: 'Hôpital et centre de recherche médicale.' },
];

function AddEditClientDialog({ client, onSave, trigger }: { client?: Client, onSave: (clientData: Omit<Client, 'id'> & { id?: string }) => void, trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(client?.name || '');
  const [description, setDescription] = useState(client?.description || '');
  const isEditing = !!client;

  const handleSave = () => {
    onSave({ id: client?.id, name, description });
    setIsOpen(false);
    if (!isEditing) {
      setName('');
      setDescription('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le client' : 'Ajouter un nouveau client'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du client</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du client" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description des activités du client" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button onClick={handleSave}>{isEditing ? 'Sauvegarder' : 'Ajouter'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function ClientsPage() {
  const { selectedClient, setSelectedClient } = useContext(ClientContext);
  const [clients, setClients] = useState<Client[]>(initialClients);

  const handleSaveClient = (clientData: Omit<Client, 'id'> & { id?: string }) => {
    if (clientData.id) { // Editing existing client
      setClients(clients.map(c => c.id === clientData.id ? { ...c, name: clientData.name, description: clientData.description } : c));
    } else { // Adding new client
      const newClient = { ...clientData, id: `client-${Date.now()}` };
      setClients([...clients, newClient]);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId));
    if (selectedClient?.id === clientId) {
      setSelectedClient(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline">
            Gestion des Clients
            </h2>
            <p className="text-muted-foreground">
            Sélectionnez le client actif pour commencer à travailler sur son parc.
            </p>
        </div>
        <AddEditClientDialog
            onSave={handleSaveClient}
            trigger={
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un client
                </Button>
            }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {clients.map((client) => (
          <Card key={client.id} className={`flex flex-col justify-between transition-all group ${selectedClient?.id === client.id ? 'border-primary ring-2 ring-primary' : 'hover:shadow-md'}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="text-muted-foreground" />
                  {client.name}
                </CardTitle>
                {selectedClient?.id === client.id ? (
                  <CheckCircle className="text-primary" />
                ) : (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddEditClientDialog
                            client={client}
                            onSave={handleSaveClient}
                            trigger={<Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4"/></Button>}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClient(client.id)}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
              </div>
              <CardDescription>{client.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => setSelectedClient(client)}
                variant={selectedClient?.id === client.id ? 'default' : 'outline'}
              >
                {selectedClient?.id === client.id ? 'Client Actif' : 'Sélectionner'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
