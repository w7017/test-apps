import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GmaoLivrablesPage() {
  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
        Livrables GMAO
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Livrables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La page des livrables de la GMAO est en cours de construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
