'use server';
/**
 * @fileOverview AI agent that generates presentation for the client with the audit data.
 *
 * - generatePresentation - A function that handles the presentation generation process.
 * - GeneratePresentationInput - The input type for the generatePresentation function.
 * - GeneratePresentationOutput - The return type for the generatePresentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePresentationInputSchema = z.object({
  auditData: z.string().describe('The audit data to generate the presentation from.'),
  clientName: z.string().describe('The name of the client.'),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const GeneratePresentationOutputSchema = z.object({
  presentation: z.string().describe('The generated presentation content.'),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;

export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePresentationPrompt',
  input: {schema: GeneratePresentationInputSchema},
  output: {schema: GeneratePresentationOutputSchema},
  prompt: `You are an AI assistant that generates presentations for clients based on audit data.

  Generate a presentation for {{clientName}} based on the following audit data:
  {{auditData}}

  The presentation should be professional and easy to understand.
`,
});

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
