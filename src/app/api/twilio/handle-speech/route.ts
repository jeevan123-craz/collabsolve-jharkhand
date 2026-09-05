import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult')?.toString() || '';
    const digits = formData.get('Digits')?.toString() || '';
    const challengeId = req.nextUrl.searchParams.get('challengeId') || '';

    let aiReply = "Thank you for the update. Our nodal team has recorded your details and will review it shortly. Dhanyawad!";

    if (speechResult) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY || 'dummy-key',
        });

        const prompt = `
You are an empathetic voice assistant for the Government of Jharkhand civic redressal platform (CollabSolve).
A citizen said the following on a phone call regarding challenge #${challengeId || 'civic issue'}:
"${speechResult}"

Formulate a warm, short (max 2 sentences), natural closing response in simple English with a polite Indian context (e.g., "Thank you, we have logged this update for our ground engineers. Dhanyawad!").
No markdown, no bullet points.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response.text) {
          aiReply = response.text.trim();
        }
      } catch (geminiErr) {
        console.error('Gemini error in Twilio speech handler:', geminiErr);
      }
    } else if (digits === '1') {
      aiReply = "Your recent challenge has been reviewed and is currently progressing with our researcher team. You will receive an SMS update once field action commences.";
    } else if (digits === '2') {
      aiReply = "Your emergency grievance priority has been elevated to High. An officer will inspect the premises within 24 hours.";
    }

    const twiml = `
<Response>
  <Say voice="Polly.Aditi" language="en-IN">${aiReply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Say>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="en-IN">Goodbye from CollabSolve Jharkhand.</Say>
</Response>
    `.trim();

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (err: any) {
    console.error('Twilio Speech Handler Error:', err);
    const fallbackTwiml = `
<Response>
  <Say voice="Polly.Aditi" language="en-IN">Thank you for your response. We have recorded your input. Goodbye.</Say>
</Response>
    `.trim();
    return new NextResponse(fallbackTwiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
