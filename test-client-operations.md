# Test des opérations CRUD sur les clients

## Endpoints disponibles

### 1. Récupération de tous les clients
```
GET /api/clients
```

### 2. Récupération d'un client par ID
```
GET /api/clients/{id}
```

### 3. Création d'un nouveau client
```
POST /api/clients
Content-Type: application/json

{
  "name": "Nom du client",
  "description": "Description optionnelle"
}
```

### 4. Modification d'un client existant
```
PUT /api/clients/{id}
Content-Type: application/json

{
  "name": "Nouveau nom",
  "description": "Nouvelle description"
}
```

### 5. Suppression d'un client
```
DELETE /api/clients/{id}
```

## Exemples de test avec cURL

### Créer un client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "Client Test", "description": "Client pour test"}'
```

### Récupérer un client par ID
```bash
curl -X GET http://localhost:3000/api/clients/{client_id}
```

### Modifier un client
```bash
curl -X PUT http://localhost:3000/api/clients/{client_id} \
  -H "Content-Type: application/json" \
  -d '{"name": "Client Modifié", "description": "Description modifiée"}'
```

### Supprimer un client
```bash
curl -X DELETE http://localhost:3000/api/clients/{client_id}
```

## Gestion des erreurs

### Erreur 400 - Bad Request
- ID manquant
- Données invalides
- Aucun champ à mettre à jour

### Erreur 404 - Not Found
- Client introuvable

### Erreur 409 - Conflict
- Client avec des sites existants (suppression impossible)
- Doublon de nom

### Erreur 500 - Internal Server Error
- Erreur de base de données
- Erreur serveur

## Logique métier implémentée

### Suppression
- Vérification de l'existence du client
- Vérification qu'aucun site n'est associé
- Suppression en cascade impossible pour maintenir l'intégrité

### Modification
- Validation des champs fournis
- Mise à jour partielle possible (seuls les champs fournis sont modifiés)
- Vérification de l'existence du client avant modification

### Validation
- Vérification des types de données
- Validation de la longueur des chaînes
- Gestion des champs optionnels
