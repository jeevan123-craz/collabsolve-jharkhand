import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { query, challenges } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const challengeSummaries = (challenges || []).slice(0, 30).map((c: any, i: number) => 
      `[${i}] Title: "${c.title}", Category: ${c.category}, District: ${c.district}, Status: ${c.status}, Urgency: ${c.urgency}`
    ).join('\n');

    const prompt = `You are a semantic search AI for a civic grievance platform in Jharkhand, India.

A user searched: "${query}"

Here are the available challenges:
${challengeSummaries}

Rank these challenges by semantic relevance to the search query. Return ONLY valid JSON (no markdown fences, no backticks):
{
  "rankedIndices": [0, 2, 5],
  "aiSummary": "Brief explanation of what was found and how it relates to the query"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    let text = response.text || '{}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    const rankedChallenges = (parsed.rankedIndices || [])
      .filter((i: number) => i < (challenges || []).length)
      .map((i: number) => challenges[i]);

    return NextResponse.json({ 
      results: rankedChallenges.length > 0 ? rankedChallenges : (challenges || []), 
      aiSummary: parsed.aiSummary || 'Semantic ranking completed.' 
    });
  } catch (error) {
    console.error('Error in smart search:', error);
    return NextResponse.json({ results: [], aiSummary: 'AI search temporarily unavailable.' }, { status: 500 });
  }
}
