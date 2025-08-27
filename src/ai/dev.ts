import { config } from 'dotenv';
config();

import '@/ai/flows/generate-audit-report.ts';
import '@/ai/flows/extract-asset-details.ts';
import '@/ai/flows/generate-presentation.ts';
import '@/ai/flows/generate-qr-code.ts';

    