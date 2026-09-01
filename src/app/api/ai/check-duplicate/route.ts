import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { title, description, existingChallenges } = await req.json();

    if (!title || !existingChallenges || existingChallenges.length === 0) {
      return NextResponse.json({ duplicateId: null });
    }

    const prompt = `
You are a civic tech platform moderator. We want to prevent citizens from posting duplicate challenges.
A user is trying to post a new challenge:
Title: "${title}"
Description: "${description}"

Here are some existing challenges currently open:
${existingChallenges.map((c: any) => `ID: ${c.id} | Title: ${c.title} | Desc: ${c.description}`).join('\n---\n')}

Check if the new challenge is semantically identical or highly overlapping with any of the existing challenges. (For example, two challenges about traffic on the exact same road, or water shortage in the exact same village).
If there is a strong duplicate, return a JSON object with the ID and a reason. If there is no strong duplicate, return null for duplicateId.

Return ONLY JSON:
{
  "duplicateId": "string or null",
  "reason": "Short explanation of why it is a duplicate"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    let text = response.text || '{}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const result = JSON.parse(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return NextResponse.json({ duplicateId: null }, { status: 500 });
  }
}
