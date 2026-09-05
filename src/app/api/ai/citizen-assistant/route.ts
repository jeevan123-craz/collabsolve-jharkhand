import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { transcript, currentFormState } = await req.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy-key',
    });
    
    const prompt = `
    You are a friendly, helpful voice assistant for the Government of Jharkhand. 
    You are helping a citizen report a societal, health, or infrastructure issue. 
    The citizen might not know technical terms. Your job is to ask clarifying questions and extract form data.
    
    Current Form State:
    ${JSON.stringify(currentFormState, null, 2)}
    
    Citizen's Latest Message:
    "${transcript}"
    
    Instructions:
    1. Analyze the citizen's message.
    2. Extract any relevant information to update the form fields (title, description, district, category). 
       - Districts must be one of: Ranchi, East Singhbhum, Dhanbad, Bokaro, Hazaribagh, Palamu, Deoghar, Giridih, Ramgarh, West Singhbhum.
       - Categories: Healthcare, Infrastructure, Education, Environment, Public Safety, Water Supply, Civic, Other.
    3. If the form is missing critical information (like where it happened, or what exactly the issue is), formulate a short, conversational question to ask them.
    4. Return a JSON object ONLY, in this exact format:
    {
      "bot_response": "Your conversational reply/question back to the citizen",
      "updated_fields": {
        "title": "...", 
        "description": "...",
        "district": "...",
        "category": "..."
      },
      "is_complete": false 
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
    console.error('Citizen Assistant Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}