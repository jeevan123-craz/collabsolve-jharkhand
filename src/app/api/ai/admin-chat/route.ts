import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { query, challenges, proposals } = await req.json();

    if (!query) {
      return NextResponse.json({ reply: 'Please provide a query.' });
    }

    const context = `
You are the "Impact Chatbot", an AI assistant for government administrators overseeing civic challenges in Jharkhand.
You have access to the following current database state in JSON format:

Challenges:
${JSON.stringify(challenges)}

Proposals:
${JSON.stringify(proposals)}

Answer the administrator's query based ONLY on the data provided above. Be concise, professional, and directly answer their question. If they ask for statistics (e.g., "how many water challenges..."), calculate it from the JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: context }] },
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        temperature: 0.1,
      }
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Error in admin chat:', error);
    return NextResponse.json({ reply: 'Sorry, I encountered an error querying the database.' }, { status: 500 });
  }
}
