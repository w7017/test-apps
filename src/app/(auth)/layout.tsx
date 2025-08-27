import { Icons } from "@/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-6 flex items-center gap-3 text-2xl font-bold text-primary sm:text-3xl">
        <Icons.logo className="h-8 w-8 sm:h-9 sm:w-9" />
        <h1 className="font-headline">
          <span className="text-navy-blue">Diag</span>
          <span className="text-dark-orange">IA</span>
        </h1>
      </div>
      {children}
    </div>
  );
}
