import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

export async function POST(req: NextRequest) {
  try {
    const { challenges } = await req.json();

    if (!challenges || challenges.length === 0) {
      return NextResponse.json({ clusters: [] });
    }

    // Pass minimal data to save tokens
    const challengeData = challenges.map((c: any) => ({
      id: c.id,
      title: c.title,
      desc: c.description,
      district: c.district,
      category: c.category
    }));

    const prompt = `
You are an expert civic intelligence AI for the Government of Jharkhand.
I will give you a list of citizen-reported challenges.
Your job is to cluster similar or related issues into common "themes" so administrators don't have to read 100 separate tickets about the same problem in the same district.
Also, assign an overall Urgency (Critical, High, Medium, Low) and Sentiment to the cluster based on the descriptions.

Return ONLY a JSON object exactly like this:
{
  "clusters": [
    {
      "theme": "Brief title of the cluster",
      "district": "The district this affects (or 'Multiple')",
      "category": "The main category",
      "urgency": "Critical | High | Medium | Low",
      "sentiment": "e.g., Frustrated, Desperate, Neutral",
      "summary": "1-2 sentence executive summary of the issue.",
      "challengeIds": ["id1", "id2", ...]
    }
  ]
}

Challenges data:
${JSON.stringify(challengeData)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "{}";
    if (text.startsWith('```json')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Cluster Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
