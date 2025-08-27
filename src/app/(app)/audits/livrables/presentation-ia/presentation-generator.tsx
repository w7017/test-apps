'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generatePresentation, type GeneratePresentationOutput } from '@/ai/flows/generate-presentation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Presentation, Loader2, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required."),
  auditData: z.string().min(50, "Please provide more detailed audit data for a better presentation."),
});

type FormValues = z.infer<typeof formSchema>;

export function PresentationGenerator() {
  const [generationState, setGenerationState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [presentation, setPresentation] = useState<GeneratePresentationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: '',
      auditData: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setGenerationState('loading');
    setPresentation(null);
    try {
      const result = await generatePresentation(data);
      setPresentation(result);
      setGenerationState('success');
      toast({
        title: "Presentation Generated Successfully",
        description: "The AI has created a presentation for your client.",
      });
    } catch (error) {
      console.error("Error generating presentation:", error);
      setGenerationState('error');
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "An error occurred while generating the presentation. Please try again.",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Générateur de Présentation Client</CardTitle>
              <CardDescription>
                Générez une présentation professionnelle pour votre client à partir des données d'audit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du Client</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="auditData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Données d'Audit</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Collez les mêmes données que pour le rapport d'audit..."
                        className="min-h-[250px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={generationState === 'loading'}>
                {generationState === 'loading' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Presentation className="mr-2 h-4 w-4" />
                )}
                Générer la présentation
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Présentation Générée</CardTitle>
          <CardDescription>Le contenu de la présentation apparaîtra ici.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[384px] prose dark:prose-invert prose-sm max-w-none">
          {generationState === 'loading' && (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground not-prose">
              <Loader2 className="mb-4 h-8 w-8 animate-spin" />
              <p>Génération de la présentation en cours...</p>
            </div>
          )}
          {generationState === 'error' && (
            <div className="flex h-full flex-col items-center justify-center text-destructive not-prose">
              <AlertTriangle className="mb-4 h-8 w-8" />
              <p>La génération a échoué.</p>
              <p className="text-sm">Veuillez réessayer.</p>
            </div>
          )}
          {generationState === 'success' && presentation && (
             <div className="whitespace-pre-wrap">{presentation.presentation}</div>
          )}
           {generationState === 'idle' && (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground not-prose">
              <p>La présentation générée s'affichera ici.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
