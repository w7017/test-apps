import { PresentationGenerator } from "./presentation-generator";

export default function PresentationIaPage() {
  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
        Génération de Présentation par IA
      </h2>
      <PresentationGenerator />
    </div>
  );
}
