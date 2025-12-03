import { GoogleGenAI } from "@google/genai";
import { VideoMetadata, AIAnalysisData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract JSON from markdown code blocks if present
function extractJSON(text: string): any {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    // Try parsing the raw text if no code blocks
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response", e);
    return null;
  }
}

export const analyzeVideoUrl = async (url: string): Promise<{ metadata: VideoMetadata; analysis: AIAnalysisData } | null> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // We ask Gemini to search for the video and return structured data.
    // Note: We cannot force JSON mode when using googleSearch tool, so we ask nicely in the prompt.
    const prompt = `
      I have this YouTube video URL: "${url}".
      
      Please perform the following steps:
      1. Use Google Search to find the specific video details: Title, Channel Name, View Count (approx), Duration, and a Thumbnail description or context.
      2. Analyze the likely content of this video based on the search results.
      3. Generate a "Smart Transcript" or key moments log for this video.
      
      Return a SINGLE JSON object with the following structure (do not include markdown formatting outside the JSON):
      {
        "metadata": {
          "title": "Exact Video Title",
          "channel": "Channel Name",
          "views": "e.g. 1.2M views",
          "length": "e.g. 10:05",
          "description": "A short 2 sentence description of the video context.",
          "thumbnailUrl": "LEAVE_THIS_EMPTY_STRING" 
        },
        "analysis": {
          "summary": "A concise 3-bullet point summary of the video content.",
          "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
          "sentiment": "Positive" | "Neutral" | "Negative",
          "sentimentScore": 85,
          "keyTopics": ["Topic A", "Topic B", "Topic C"],
          "transcript": [
             { "timestamp": "00:00", "text": "Brief description of intro..." },
             { "timestamp": "02:15", "text": "Key point discussed here..." },
             { "timestamp": "05:30", "text": "Another important segment..." }
          ]
        }
      }
      
      For the 'sentimentScore', give a number between 0 and 100 representing positivity.
      For 'thumbnailUrl', please just leave it as an empty string, I will handle it in the frontend.
      For 'transcript', generate 5-8 key segments that represent the flow of the video.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = extractJSON(text);

    if (!data) {
        throw new Error("Could not parse video data");
    }

    // Since Gemini can't actually see the thumbnail URL reliably, we'll try to use a high-res default or a trick if the user provides a valid ID. 
    // For this demo, we will generate a valid YouTube thumbnail URL if the input was a standard youtube link.
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    if (videoId && data.metadata) {
      data.metadata.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else {
        // Fallback
        data.metadata.thumbnailUrl = "https://picsum.photos/800/450?blur=2"; 
    }

    // Fallback for transcript if missing from AI response
    if (!data.analysis.transcript) {
        data.analysis.transcript = [];
    }

    return {
      metadata: { ...data.metadata, url }, // Include the original URL
      analysis: data.analysis
    };

  } catch (error) {
    console.error("Error analyzing video:", error);
    return null;
  }
};