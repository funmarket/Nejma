"use server";

import { youtubeVideoSummarization, type YoutubeVideoSummarizationInput } from "@/ai/flows/youtube-video-summarization";

export async function summarizeVideo(input: YoutubeVideoSummarizationInput) {
    try {
        const result = await youtubeVideoSummarization(input);
        return { success: true, summary: result.summary };
    } catch (error) {
        console.error("Error summarizing video:", error);
        return { success: false, error: "Failed to summarize video." };
    }
}
