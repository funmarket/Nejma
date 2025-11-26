'use server';

/**
 * @fileOverview Summarizes a YouTube video given its URL.
 *
 * - youtubeVideoSummarization - A function that takes a YouTube video URL and returns a summary.
 * - YoutubeVideoSummarizationInput - The input type for the youtubeVideoSummarization function.
 * - YoutubeVideoSummarizationOutput - The return type for the youtubeVideoSummarization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YoutubeVideoSummarizationInputSchema = z.object({
  youtubeVideoUrl: z.string().describe('The URL of the YouTube video to summarize.'),
  format: z.enum(['paragraph', 'bullet']).default('paragraph').describe('The format of the summary: paragraph or bullet points.'),
  length: z.enum(['short', 'medium', 'long']).default('short').describe('The desired length of the summary: short, medium, or long.'),
});
export type YoutubeVideoSummarizationInput = z.infer<typeof YoutubeVideoSummarizationInputSchema>;

const YoutubeVideoSummarizationOutputSchema = z.object({
  summary: z.string().describe('A summary of the YouTube video.'),
});
export type YoutubeVideoSummarizationOutput = z.infer<typeof YoutubeVideoSummarizationOutputSchema>;

export async function youtubeVideoSummarization(
  input: YoutubeVideoSummarizationInput
): Promise<YoutubeVideoSummarizationOutput> {
  return youtubeVideoSummarizationFlow(input);
}

const youtubeVideoSummarizationPrompt = ai.definePrompt({
  name: 'youtubeVideoSummarizationPrompt',
  input: {schema: YoutubeVideoSummarizationInputSchema},
  output: {schema: YoutubeVideoSummarizationOutputSchema},
  prompt: `You are an AI expert in generating summaries of YouTube videos. You will generate a
  summary of the YouTube video given the URL. 

  Summary Format: {{{format}}}

  Summary Length: {{{length}}}

  Youtube Video URL: {{{youtubeVideoUrl}}}

  Summary:
  `,
});

const youtubeVideoSummarizationFlow = ai.defineFlow(
  {
    name: 'youtubeVideoSummarizationFlow',
    inputSchema: YoutubeVideoSummarizationInputSchema,
    outputSchema: YoutubeVideoSummarizationOutputSchema,
  },
  async input => {
    const {output} = await youtubeVideoSummarizationPrompt(input);
    return output!;
  }
);
