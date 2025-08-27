import { ReportDashboard } from "./report-generator";

export default function RapportIaPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          Générateur de Rapports par IA
        </h2>
        <p className="text-muted-foreground">
          Générez, consultez et gérez vos rapports d'audit synthétisés par l'IA.
        </p>
      </div>
      <ReportDashboard />
    </div>
  );
}
