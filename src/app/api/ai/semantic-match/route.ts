import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { profile, proposals, challenges } = await req.json();

    if (!profile || !proposals || proposals.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Build the context string
    const itemsText = proposals.map((p: any) => {
      const c = challenges.find((ch: any) => ch.id === p.challengeId);
      return `ID: ${p.id}\nTeam: ${p.teamName}\nProposal Approach: ${p.approach}\nSolving Challenge: ${c?.title || 'Unknown'}\nChallenge Desc: ${c?.description || 'Unknown'}`;
    }).join('\n\n---\n\n');

    const prompt = `
You are an advanced semantic matching engine for a civic tech platform.
An industry partner has provided their corporate profile/focus area:
"${profile}"

Here are the active proposals currently seeking funding:
${itemsText}

Task: Evaluate how well each proposal semantically aligns with the industry partner's profile.
Return a JSON array of objects, one for each proposal ID, containing a matchScore (0-100) and a short 1-sentence reason for the match.

Return ONLY a JSON array, no markdown, no backticks:
[
  {
    "proposalId": "string",
    "matchScore": 85,
    "reason": "This water purification proposal perfectly aligns with your focus on clean water initiatives."
  }
]
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

    const matches = JSON.parse(text);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error semantic matching:', error);
    return NextResponse.json({ matches: [] }, { status: 500 });
  }
}
