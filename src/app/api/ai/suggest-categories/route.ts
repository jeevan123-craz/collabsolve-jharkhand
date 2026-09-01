import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();
    
    if (!title || !description) {
      return NextResponse.json({ error: "Missing title or description" }, { status: 400 });
    }

    const prompt = `Based on the following civic challenge description, suggest 1 to 2 relevant departments or categories (e.g., Healthcare, Education, Agriculture, Water Management, Environment, Public Service, Tribal Welfare, Smart City, Infrastructure), 2 to 3 required skills to solve it, and 1 to 2 relevant academic institutions in Jharkhand (e.g., IIT ISM Dhanbad, BIT Mesra, BAU Ranchi, NIT Jamshedpur, IIM Ranchi). 
    Return the output strictly in valid JSON format with keys: "categories" (array of strings), "skills" (array of strings), "institutions" (array of strings). Do not use markdown blocks.
    
    Title: ${title}
    Description: ${description}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    
    let text = response.text || "{}";
    if (text.startsWith("\`\`\`json")) {
        text = text.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    }
    const data = JSON.parse(text);

    return NextResponse.json({ 
        suggestions: data.categories || [],
        skills: data.skills || [],
        institutions: data.institutions || []
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
