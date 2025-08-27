
'use server';
/**
 * @fileOverview A flow to generate a QR code for a given equipment ID.
 *
 * - generateQrCode - A function that generates a QR code.
 * - GenerateQrCodeInput - The input type for the generateQrCode function.
 * - GenerateQrCodeOutput - The return type for the generateQrCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import QRCode from 'qrcode';

const GenerateQrCodeInputSchema = z.object({
  equipmentId: z.string().describe('The unique identifier for the equipment.'),
});
export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeInputSchema>;

const GenerateQrCodeOutputSchema = z.object({
  qrCodeDataUri: z.string().describe('The generated QR code as a data URI.'),
});
export type GenerateQrCodeOutput = z.infer<typeof GenerateQrCodeOutputSchema>;


export async function generateQrCode(input: GenerateQrCodeInput): Promise<GenerateQrCodeOutput> {
    return generateQrCodeFlow(input);
}

const generateQrCodeFlow = ai.defineFlow(
  {
    name: 'generateQrCodeFlow',
    inputSchema: GenerateQrCodeInputSchema,
    outputSchema: GenerateQrCodeOutputSchema,
  },
  async ({ equipmentId }) => {
    try {
      const qrCodeDataUri = await QRCode.toDataURL(equipmentId, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: 256,
      });
      return { qrCodeDataUri };
    } catch (err) {
      console.error(err);
      throw new Error('Failed to generate QR code.');
    }
  }
);

    