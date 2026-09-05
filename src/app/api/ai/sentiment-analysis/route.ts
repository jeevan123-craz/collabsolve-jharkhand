import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface SentimentResponse {
  sentiment: 'positive' | 'negative' | 'neutral' | 'urgent';
  confidence: number;
  keywords: string[];
  summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json();

    if (!title && !description) {
      return NextResponse.json(
        { error: 'Missing title or description' },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert NLP sentiment and emotional tone analyzer for a civic grievance and public challenge reporting platform.
Analyze the following citizen-submitted challenge for emotional sentiment, urgency, and core themes:

Title: "${title || ''}"
Description: "${description || ''}"

Classify the overall sentiment into exactly one of these 4 categories:
- "positive" (constructive, optimistic, community-driven)
- "negative" (frustrated, dissatisfied, aggrieved)
- "neutral" (factual, descriptive, objective report)
- "urgent" (critical emergency, hazardous, life-threatening, requiring immediate intervention)

Also extract:
- "confidence": A float number between 0.0 and 1.0 indicating model confidence
- "keywords": An array of 3 to 6 key thematic tags or keywords extracted from the text
- "summary": A concise 1-2 sentence summary of the emotional tone and core issue

Return STRICTLY a JSON object without markdown code fences or backticks:
{
  "sentiment": "urgent",
  "confidence": 0.92,
  "keywords": ["water crisis", "groundwater", "drought", "farming"],
  "summary": "The submission conveys high distress and urgency regarding severe drinking water shortages impacting farming livelihoods."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
      },
    });

    let text = response.text || '{}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data: SentimentResponse = JSON.parse(text);

    return NextResponse.json({
      sentiment: ['positive', 'negative', 'neutral', 'urgent'].includes(data.sentiment) ? data.sentiment : 'neutral',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0.85,
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      summary: data.summary || 'Sentiment analysis completed.',
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      {
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        summary: 'Failed to analyze sentiment.',
      },
      { status: 500 }
    );
  }
}
