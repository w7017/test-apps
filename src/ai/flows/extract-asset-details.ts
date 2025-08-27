'use server';

/**
 * @fileOverview A flow to extract asset details from a QR code using AI.
 *
 * - extractAssetDetailsFromQrCode - A function that handles the extraction of asset details from a QR code.
 * - ExtractAssetDetailsFromQrCodeInput - The input type for the extractAssetDetailsFromQrCode function.
 * - ExtractAssetDetailsFromQrCodeOutput - The return type for the extractAssetDetailsFromQrCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractAssetDetailsFromQrCodeInputSchema = z.object({
  qrCodeDataUri: z
    .string()
    .describe(
      'The QR code data URI scanned from the asset, which must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Properly escaped quotes.
    ),
});
export type ExtractAssetDetailsFromQrCodeInput = z.infer<
  typeof ExtractAssetDetailsFromQrCodeInputSchema
>;

const ExtractAssetDetailsFromQrCodeOutputSchema = z.object({
  assetDetails: z
    .string()
    .describe('The extracted details of the asset from the QR code.'),
});
export type ExtractAssetDetailsFromQrCodeOutput = z.infer<
  typeof ExtractAssetDetailsFromQrCodeOutputSchema
>;

export async function extractAssetDetailsFromQrCode(
  input: ExtractAssetDetailsFromQrCodeInput
): Promise<ExtractAssetDetailsFromQrCodeOutput> {
  return extractAssetDetailsFromQrCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractAssetDetailsFromQrCodePrompt',
  input: {schema: ExtractAssetDetailsFromQrCodeInputSchema},
  output: {schema: ExtractAssetDetailsFromQrCodeOutputSchema},
  prompt: `You are an expert technician. Extract asset details from the following QR code. Only provide the asset details.\n\nQR Code: {{media url=qrCodeDataUri}}`,
});

const extractAssetDetailsFromQrCodeFlow = ai.defineFlow(
  {
    name: 'extractAssetDetailsFromQrCodeFlow',
    inputSchema: ExtractAssetDetailsFromQrCodeInputSchema,
    outputSchema: ExtractAssetDetailsFromQrCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
