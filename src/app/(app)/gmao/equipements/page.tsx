import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GmaoEquipementsPage() {
  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
        Préparation des Équipements (GMAO)
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Préparation Équipements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La fonctionnalité de préparation des équipements pour la GMAO est en cours de construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
