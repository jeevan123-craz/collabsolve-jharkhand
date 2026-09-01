import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { updates, challengeTitle, challengeDescription } = await req.json();

    if (!updates || updates.length === 0) {
      return NextResponse.json({ summary: 'No updates to summarize yet.' });
    }

    const updatesText = updates.map((u: any) => `[${u.authorName}]: ${u.content}`).join('\n');

    const prompt = `
You are a project manager. Summarize the progress of this project based on the following updates.
Make it a short, plain-language status report (1 paragraph, max 3 sentences) suitable for a non-technical government official.

Project: ${challengeTitle}
Goal: ${challengeDescription}

Recent Updates:
${updatesText}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });

    return NextResponse.json({ summary: response.text });
  } catch (error) {
    console.error('Error summarizing project:', error);
    return NextResponse.json({ summary: 'Failed to generate summary.' }, { status: 500 });
  }
}
