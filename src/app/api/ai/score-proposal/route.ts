import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { approach, timeline, budgetRequest, challengeDescription } = await req.json();

    if (!approach || !challengeDescription) {
      return NextResponse.json({ error: 'Missing approach or challengeDescription' }, { status: 400 });
    }

    const prompt = `
You are an expert grant reviewer and technical evaluator for civic tech challenges.
Evaluate the following proposal against the challenge description.
Score it from 0 to 100 based on Clarity (30%), Feasibility (40%), and Resource Fit / Budget (30%).

Challenge Description:
${challengeDescription}

Proposal Approach:
${approach}
Timeline: ${timeline}
Budget Request: ${budgetRequest}

Return ONLY a JSON object with this exact structure, no markdown, no backticks:
{
  "impactScore": 85,
  "reasoning": "A short 1-sentence explanation of the score."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });

    let text = response.text || '{}';
    // Clean up potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error scoring proposal:', error);
    return NextResponse.json({ impactScore: 0, reasoning: 'Failed to score' }, { status: 500 });
  }
}
