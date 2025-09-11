import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Presentation, ListChecks, FileSpreadsheet } from "lucide-react";

export default function LivrablesPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          Livrables par IA
        </h2>
        <p className="text-muted-foreground">
          Générez des rapports et des présentations professionnels à partir de vos données d'audit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Rapport d'Audit par IA</CardTitle>
                <CardDescription>
                  Synthétisez vos données brutes en un rapport clair et concis.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              L'IA analyse les données de votre audit pour en extraire les points clés, les anomalies et les recommandations, puis les structure dans un rapport professionnel.
            </p>
            <Button asChild>
              <Link href="/audits/livrables/rapport-ia">
                Générer un Rapport
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Presentation className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Présentation Client par IA</CardTitle>
                <CardDescription>
                  Créez une présentation percutante pour vos clients.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
              Transformez les résultats de l'audit en une présentation visuelle et facile à comprendre, parfaite pour les réunions avec vos clients.
            </p>
            <Button asChild>
              <Link href="/audits/livrables/presentation-ia">
                Générer une Présentation
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListChecks className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Liste des actions</CardTitle>
                <CardDescription>
                  Extrayez et suivez les actions correctives.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
              Générez une liste claire des actions à mener suite à un audit, pour un suivi efficace et une résolution rapide des problèmes identifiés.
            </p>
            <Button>
              Voir la liste
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Import liste des équipements</CardTitle>
                <CardDescription>
                  Intégrez vos équipements depuis un fichier Excel.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
              Importez rapidement toute votre liste d'équipements dans la plateforme à partir d'un simple fichier Excel pour une mise en place rapide.
            </p>
            <Button>
                Importer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}