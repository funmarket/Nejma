import { z } from 'genkit';

// Define the schema for the input of the bio generation flow.
// This ensures that the input data is in the correct format.
export const GenerateBioInputSchema = z.object({
  role: z.string().describe('The role of the user (e.g., artist, fan, creator).'),
  skills: z.string().describe('A comma-separated list of the user\'s skills or talents.'),
  interests: z.string().describe('A comma-separated list of the user\'s interests or artistic style.'),
});
export type GenerateBioInput = z.infer<typeof GenerateBioInputSchema>;
