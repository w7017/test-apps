'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating audit reports using AI.
 *
 * The flow takes audit data as input and uses an LLM to summarize key findings and action items.
 * @fileOverview
 * - `generateAuditReport` - A function that generates an audit report.
 * - `GenerateAuditReportInput` - The input type for the `generateAuditReport` function.
 * - `GenerateAuditReportOutput` - The output type for the `generateAuditReport` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAuditReportInputSchema = z.object({
  auditData: z.string().describe('The audit data to summarize.'),
});
export type GenerateAuditReportInput = z.infer<
  typeof GenerateAuditReportInputSchema
>;

const GenerateAuditReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the key findings.'),
  actionItems: z
    .string()
    .describe('A list of action items based on the audit data.'),
});
export type GenerateAuditReportOutput = z.infer<
  typeof GenerateAuditReportOutputSchema
>;

/**
 * Generates an audit report summarizing key findings and action items from audit data.
 * @param input - The input data for generating the audit report.
 * @returns A promise that resolves to the generated audit report.
 */
export async function generateAuditReport(
  input: GenerateAuditReportInput
): Promise<GenerateAuditReportOutput> {
  return generateAuditReportFlow(input);
}

const generateAuditReportPrompt = ai.definePrompt({
  name: 'generateAuditReportPrompt',
  input: {schema: GenerateAuditReportInputSchema},
  output: {schema: GenerateAuditReportOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing audit data and extracting key action items.
  Given the following audit data, please provide a concise summary of the key findings and a list of actionable items.

  Audit Data:
  {{auditData}}

  Summary:
  Action Items:`,
});

const generateAuditReportFlow = ai.defineFlow(
  {
    name: 'generateAuditReportFlow',
    inputSchema: GenerateAuditReportInputSchema,
    outputSchema: GenerateAuditReportOutputSchema,
  },
  async input => {
    const {output} = await generateAuditReportPrompt(input);
    return output!;
  }
);
