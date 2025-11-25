'use server';
/**
 * @fileOverview This file defines the AI flow for generating a user bio.
 *
 * It includes:
 * - `generateBio`: The main exported function that runs the AI flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GenerateBioInputSchema, type GenerateBioInput } from './generate-bio.types';


/**
 * An asynchronous function that takes user input and returns a generated bio.
 * This is the main entry point for using this flow from the application.
 * @param input - The user's role, skills, and interests.
 * @returns A promise that resolves to the generated bio string.
 */
export async function generateBio(input: GenerateBioInput): Promise<string> {
  // Execute the flow and return the output.
  const bio = await generateBioFlow(input);
  return bio;
}

// Define the Genkit prompt. This is the core instruction given to the AI model.
// The prompt uses Handlebars syntax `{{{...}}}` to insert the input variables.
// It also specifies the input schema and the desired output format.
const bioPrompt = ai.definePrompt({
  name: 'bioPrompt',
  input: { schema: GenerateBioInputSchema },
  output: { format: 'text' },
  prompt: `You are an expert copywriter for a social media app for creatives.
  Write a compelling, short (2-3 sentences) user bio.

  The user's role is: {{{role}}}.
  Their skills are: {{{skills}}}.
  Their interests/style is: {{{interests}}}.

  Craft a bio that is engaging and reflects their creative identity.
  Be concise and impactful. Do not use hashtags.
  Return only the bio text.`,
});

// Define the Genkit flow. A flow orchestrates the AI generation process.
// It takes an input, calls one or more prompts or tools, and returns an output.
const generateBioFlow = ai.defineFlow(
  {
    name: 'generateBioFlow',
    inputSchema: GenerateBioInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // Run the prompt with the given input.
    const { output } = await bioPrompt(input);

    // Ensure the output is not null and return it.
    // The exclamation mark `!` asserts that output is non-null.
    return output!;
  }
);
