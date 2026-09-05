import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { transcript, currentFormState, history } = await req.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy-key',
    });

    const historyText = history.map((h: any) => `${h.role === 'user' ? 'Citizen' : 'AI'}: ${h.text}`).join('\n');

    const prompt = `
    You are an empathetic Voice AI for the Government of Jharkhand. 
    You are talking to a citizen reporting a local issue.
    
    GOAL: Extract the following 4 pieces of information:
    1. Title (short summary)
    2. Description (detailed)
    3. District (must be a valid Jharkhand district, e.g., Ranchi, Dhanbad)
    4. Category (Healthcare, Infrastructure, Education, Environment, Public Safety, Water Supply, Civic, Other)

    CONVERSATION HISTORY:
    ${historyText}
    Citizen's Latest Reply: "${transcript}"

    CURRENT EXTRACTED DATA:
    ${JSON.stringify(currentFormState, null, 2)}

    INSTRUCTIONS:
    1. Extract or update the fields based on the citizen's latest reply.
    2. Check what is STILL MISSING. 
    3. You MUST ASK EXACTLY ONE COUNTER-QUESTION to get the NEXT missing piece of information. Do not ask for multiple things at once. 
       - If they just said "hello", ask what issue they are facing (Title/Description).
       - If Title/Description are filled but District is missing, ask: "Which district or area is this located in?"
       - If everything is filled, say: "I have all the details. I am submitting your challenge now. Thank you."
    4. Keep your spoken response VERY short, conversational, and natural (no markdown, no bullet points).
    5. Return a JSON object ONLY, in this exact format:
    {
      "bot_response": "Your spoken reply",
      "updated_fields": {
         "title": "...",
         "description": "...",
         "district": "...",
         "category": "..."
      },
      "is_complete": false // set to true ONLY if all 4 fields are filled
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    let jsonMatch = text;
    if (text.startsWith('```json')) {
      jsonMatch = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    return NextResponse.json(JSON.parse(jsonMatch));

  } catch (error: any) {
    console.error('Citizen Assistant V2 Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}