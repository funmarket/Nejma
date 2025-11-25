/**
 * @fileOverview This file configures and initializes the Genkit AI instance.
 * It sets up the necessary plugins, such as the Google AI plugin for Gemini,
 * and configures the API key from environment variables.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Initialize the Genkit AI instance with the Google AI plugin.
// The plugin is configured with the API key from the environment variables.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
});
