import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  source: string;
  url: string;
  description: string;
  posted_at: string;
}

export async function searchJobs(query: string, location: string = "", salaryRange: string = ""): Promise<Job[]> {
  const prompt = `Find current job openings for "${query}" ${location ? `in ${location}` : ""} ${salaryRange ? `with salary around ${salaryRange}` : ""}. 
  Focus on LinkedIn, Indeed, and major company career pages. 
  Return a list of jobs with title, company, location, estimated salary (if found), source (LinkedIn, Indeed, or Company Name), URL, and a brief 2-sentence description.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            salary: { type: Type.STRING },
            source: { type: Type.STRING },
            url: { type: Type.STRING },
            description: { type: Type.STRING },
            posted_at: { type: Type.STRING },
          },
          required: ["title", "company", "url"],
        },
      },
    },
  });

  try {
    const jobs = JSON.parse(response.text || "[]");
    // Ensure IDs exist
    return jobs.map((job: any, index: number) => ({
      ...job,
      id: job.id || `${Date.now()}-${index}`,
      posted_at: job.posted_at || "Recently",
      salary: job.salary || "Not specified",
      location: job.location || "Remote/Not specified",
      source: job.source || "Web",
    }));
  } catch (e) {
    console.error("Failed to parse jobs:", e);
    return [];
  }
}
