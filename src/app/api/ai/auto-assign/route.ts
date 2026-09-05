import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { Challenge } from '@/lib/data';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AutoAssignOutput {
  assignedTo?: string;
  department?: string;
  reason?: string;
  confidence?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { challenge } = (await req.json()) as { challenge?: Partial<Challenge> };

    if (!challenge || (!challenge.title && !challenge.description)) {
      return NextResponse.json(
        { error: 'Missing challenge data (title, description, category, district required)' },
        { status: 400 }
      );
    }

    const { title, description, category, district } = challenge;

    const prompt = `
You are an expert civic governance and academic matching system for the State of Jharkhand.
Given the following civic challenge, evaluate and recommend the most suitable Higher Education Institution (HEI), research center, or government department in Jharkhand to be assigned or lead the resolution of this challenge.

Challenge Details:
- Title: "${title || 'Untitled'}"
- Description: "${description || 'No description'}"
- Category: "${category || 'General'}"
- District: "${district || 'Jharkhand'}"

Key Academic & Research Institutions in Jharkhand:
- IIT (ISM) Dhanbad (Mining, Hydrology, Earth Sciences, Computer Science, Environmental Eng)
- BIT Mesra, Ranchi (Civil, IoT, GIS, Computer Science, Remote Sensing, Biotechnology)
- Birsa Agricultural University (BAU), Ranchi (Agriculture, Forestry, Soil Science, Climate Adaptation)
- NIT Jamshedpur (Electronics, Mechanical, Civil, Electrical, Smart Systems)
- Rajendra Institute of Medical Sciences (RIMS), Ranchi (Public Health, Nutrition, Medical Science)
- IIM Ranchi / Xavier Institute of Social Service (XISS) (Rural Development, Social Work, Policy)
- JSAC Ranchi (Jharkhand Space Applications Center - Satellite Imagery, GIS)
- Sido Kanhu Murmu University, Dumka / Vinoba Bhave University, Hazaribagh (Tribal languages, Local studies)

State Government Departments:
- Drinking Water & Sanitation Department
- Health, Medical Education & Family Welfare Department
- Department of Agriculture, Animal Husbandry & Co-operative
- Department of Scheduled Tribe, Scheduled Caste, Minorities and Backward Class Welfare
- Department of Mines & Geology
- Forest, Environment and Climate Change Department
- Urban Development & Housing Department
- Rural Development Department

Recommend the single best entity and specific department to assign this challenge to.

Return STRICTLY a JSON object with no markdown fences or backticks:
{
  "assignedTo": "BIT Mesra, Ranchi",
  "department": "Department of Civil & Environmental Engineering",
  "reason": "BIT Mesra's environmental engineering faculty has active GIS groundwater modeling labs and proximity to central Jharkhand districts.",
  "confidence": 0.94
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

    const data: AutoAssignOutput = JSON.parse(text);

    return NextResponse.json({
      assignedTo: data.assignedTo || 'BIT Mesra, Ranchi',
      department: data.department || 'Department of Research & Development',
      reason: data.reason || 'Recommended based on domain alignment and institutional research capabilities.',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0.88,
    });
  } catch (error) {
    console.error('Error auto-assigning challenge:', error);
    return NextResponse.json(
      {
        assignedTo: 'BIT Mesra / IIT ISM Dhanbad',
        department: 'Department of Research & Development',
        reason: 'Recommended based on domain alignment and institutional research capabilities.',
        confidence: 0.75,
      },
      { status: 500 }
    );
  }
}
