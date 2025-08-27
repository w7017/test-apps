import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PpaPage() {
  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
        Plan Préventif Annuel (PPA)
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Planification Annuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La fonctionnalité de gestion du plan préventif annuel est en cours de construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
