import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Mock database of industry partners
const INDUSTRY_PARTNERS = [
  { id: '1', name: 'Tata Steel Foundation', focus: 'Infrastructure, Heavy Industry, Rural Development', pastEngagement: 'High' },
  { id: '2', name: 'Adani Green Energy', focus: 'Renewable Energy, Solar, Environment', pastEngagement: 'Medium' },
  { id: '3', name: 'Wipro Foundation', focus: 'Education, Digital Literacy, Health', pastEngagement: 'High' },
  { id: '4', name: 'Jindal Steel & Power', focus: 'Infrastructure, Water Supply, Mining', pastEngagement: 'Low' },
  { id: '5', name: 'Infosys Foundation', focus: 'Healthcare, Education, Technology', pastEngagement: 'High' },
];

export async function POST(req: NextRequest) {
  try {
    const { challenge } = await req.json();

    if (!challenge) {
      return NextResponse.json({ nudgedPartners: [] });
    }

    const prompt = `
You are a Smart Notification Engine.
We have a new civic challenge:
Title: ${challenge.title}
Description: ${challenge.description}
Category: ${challenge.category}

We have the following industry partners in our network:
${JSON.stringify(INDUSTRY_PARTNERS, null, 2)}

Determine which 1 to 3 industry partners are the most highly relevant for this challenge based on their "focus" and "pastEngagement".
Do not blast everyone. Be selective.

Return ONLY a JSON array of the partner IDs you selected:
["1", "4"]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const selectedIds = JSON.parse(text);
    const nudgedPartners = INDUSTRY_PARTNERS.filter(p => selectedIds.includes(p.id));

    return NextResponse.json({ nudgedPartners });
  } catch (error) {
    console.error('Error in nudge engine:', error);
    return NextResponse.json({ nudgedPartners: [] }, { status: 500 });
  }
}
