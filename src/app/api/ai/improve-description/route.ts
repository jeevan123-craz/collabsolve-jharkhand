import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Missing description" }, { status: 400 });
    }

    const prompt = `You are an expert at writing problem statements for societal challenges. A citizen has submitted the following issue. Rewrite the description to be more formal, structured, clear, and actionable for universities and industry partners to solve. Do not change the core meaning, just improve the clarity and tone. Keep it concise (1-2 paragraphs). Return ONLY the improved description without any extra conversational text.
    
    Original Title: ${title}
    Original Description: ${description}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    
    return NextResponse.json({ improvedDescription: response.text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Failed to generate improved description' }, { status: 500 });
  }
}
