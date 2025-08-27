'use client';

import { useContext, useEffect, useState } from 'react';
import { ClientContext, type Client } from '@/contexts/client-context';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building,
  CheckCircle,
  PlusCircle,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/components/ui/use-toast';

function AddEditClientDialog({
  client,
  onSave,
  trigger,
}: {
  client?: Client;
  onSave: (clientData: Omit<Client, 'id'> & { id?: string }) => void;
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(client?.name || '');
  const [description, setDescription] = useState(client?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!client;

  // Reset form when dialog opens/closes or client changes
  useEffect(() => {
    if (isOpen) {
      setName(client?.name || '');
      setDescription(client?.description || '');
    }
  }, [isOpen, client]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Le nom du client est requis');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({ id: client?.id, name: name.trim(), description: description.trim() || undefined });
      setIsOpen(false);
      if (!isEditing) {
        setName('');
        setDescription('');
      }
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setIsLoading(false);
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
            <Label htmlFor="name">Nom du client *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du client"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description des activités du client"
              disabled={isLoading}
            />
          </div>
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
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Sauvegarder' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteClientDialog({
  client,
  onDelete,
  trigger,
}: {
  client: Client;
  onDelete: (clientId: string) => void;
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(client.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le client <strong>{client.name}</strong> ?
            Cette action ne peut pas être annulée et supprimera également tous les sites,
            bâtiments et équipements associés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function ClientsPage() {
  const {
    clients,
    selectedClient,
    setSelectedClient,
    loading,
  } = useContext(ClientContext);

  const [clientList, setClientList] = useState<Client[]>([]);
  // const { toast } = useToast();

  // Sync client list from context
  useEffect(() => {
    if (clients.length > 0) {
      setClientList(clients);
    }
  }, [clients]);

  const handleSaveClient = async (
    clientData: Omit<Client, 'id'> & { id?: string }
  ) => {
    console.log('Saving client:', clientData);

    if (clientData.id) {
      // UPDATE existing client
      try {
        const res = await fetch(`/api/clients/${clientData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: clientData.name,
            description: clientData.description
          }),
        });

        console.log("Update response status:", res.status);
        console.log("Update response ok:", res.ok);

        if (!res.ok) {
          const error = await res.json();
          console.error("Error updating client:", error);
          alert(`❌ Erreur: ${error.error || 'Échec de la modification du client'}`);
          throw new Error(error.error || 'Failed to update client');
        }

        const updatedClient: Client = await res.json();
        console.log("Client updated:", updatedClient);
        
        // Update local state
        setClientList((prev) =>
          prev.map((c) =>
            c.id === clientData.id ? updatedClient : c
          )
        );

        // Update selected client if it was the one being edited
        if (selectedClient?.id === clientData.id) {
          setSelectedClient(updatedClient);
        }

        alert('✅ Client modifié avec succès');

      } catch (err) {
        console.error("Update error:", err);
        throw err; // Re-throw to handle in dialog
      }
    } else {
      // CREATE new client
      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: clientData.name,
            description: clientData.description
          }),
        });

        console.log("Create response status:", res.status);
        console.log("Create response ok:", res.ok);

        if (!res.ok) {
          const error = await res.json();
          console.error("Error creating client:", error);
          alert(`❌ Erreur: ${error.error || 'Échec de la création du client'}`);
          throw new Error(error.error || 'Failed to create client');
        }

        const newClient: Client = await res.json();
        console.log("New client created:", newClient);
        setClientList((prev) => [...prev, newClient]);


        alert('✅ Client ajouté avec succès');
        
      } catch (err) {
        console.error("Create error:", err);
        throw err; // Re-throw to handle in dialog
      }
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      console.log("Delete response status:", res.status);
      console.log("Delete response ok:", res.ok);

      if (!res.ok) {
        const error = await res.json();
        console.error("Error deleting client:", error);
        alert(`❌ Erreur: ${error.error || 'Échec de la suppression du client'}`);
        throw new Error(error.error || 'Failed to delete client');
      }

      const result = await res.json();
      console.log("Client deleted:", result);

      // Update local state
      setClientList((prev) => prev.filter((c) => c.id !== clientId));
      
      // Clear selection if deleted client was selected
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }

      alert('✅ Client supprimé avec succès');

    } catch (err) {
      console.error("Delete error:", err);
      throw err; // Re-throw to handle in dialog
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement des clients...
      </div>
    );
  }

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

      {clientList.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Aucun client
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Commencez par ajouter votre premier client.
          </p>
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
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clientList.map((client) => (
            <Card
              key={client.id}
              className={`flex flex-col justify-between transition-all group ${
                selectedClient?.id === client.id
                  ? 'border-primary ring-2 ring-primary'
                  : 'hover:shadow-md'
              }`}
            >
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
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteClientDialog
                        client={client}
                        onDelete={handleDeleteClient}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
                <CardDescription>
                  {client.description || 'Aucune description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => setSelectedClient(client)}
                  variant={
                    selectedClient?.id === client.id ? 'default' : 'outline'
                  }
                >
                  {selectedClient?.id === client.id
                    ? 'Client Actif'
                    : 'Sélectionner'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}