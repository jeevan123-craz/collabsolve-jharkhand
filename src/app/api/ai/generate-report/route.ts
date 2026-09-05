import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { Challenge, Proposal } from '@/lib/data';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerateReportAiOutput {
  report?: string;
  highlights?: string[];
  recommendations?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { challenges = [], proposals = [] } = (await req.json()) as {
      challenges?: Challenge[];
      proposals?: Proposal[];
    };

    const challengeCount = challenges.length;
    const proposalCount = proposals.length;

    // Build concise statistical summary to supply Gemini
    const categoryCounts: Record<string, number> = {};
    const districtCounts: Record<string, number> = {};
    let urgentCount = 0;
    let resolvedCount = 0;

    challenges.forEach((c) => {
      if (c.category) categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      if (c.district) districtCounts[c.district] = (districtCounts[c.district] || 0) + 1;
      if (c.urgency === 'Critical' || c.urgency === 'High') urgentCount++;
      if (c.status === 'Resolved') resolvedCount++;
    });

    const acceptedProposals = proposals.filter((p) => p.status === 'Accepted').length;

    const summaryContext = {
      totalChallenges: challengeCount,
      totalProposals: proposalCount,
      acceptedProposals,
      criticalOrHighUrgency: urgentCount,
      resolvedChallenges: resolvedCount,
      topCategories: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topDistricts: Object.entries(districtCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      sampleChallenges: challenges.slice(0, 10).map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        district: c.district,
        status: c.status,
        urgency: c.urgency
      })),
      sampleProposals: proposals.slice(0, 5).map((p) => ({
        id: p.id,
        teamName: p.teamName,
        institution: p.institution,
        budgetRequest: p.budgetRequest,
        status: p.status
      }))
    };

    const prompt = `
You are the Chief Policy Analyst and Civic Intelligence Director for the CollabSolve Jharkhand State Innovation Platform.
Generate a comprehensive, high-level executive summary report based on the following real-time data snapshot:

Data Snapshot:
${JSON.stringify(summaryContext, null, 2)}

Requirements:
1. "report": A beautifully structured markdown executive report (approx 250-400 words) with clear sections:
   - ## Executive Overview
   - ## District & Thematic Vulnerability Analysis
   - ## Innovation & University Response Rate
   - ## Strategic Impact Assessment
2. "highlights": An array of 3 to 5 crisp, impactful bullet statements capturing key metrics, critical hotspots, and momentum.
3. "recommendations": An array of 3 to 5 concrete, actionable policy and funding recommendations for the State Administration and CSR partners.

Return STRICTLY a JSON object with no markdown code fences or backticks around the json:
{
  "report": "## Executive Overview\\nCivic challenge engagement across Jharkhand indicates substantial momentum...",
  "highlights": [
    "Groundwater depletion and nutrition monitoring remain the highest-urgency challenges in Chatra and Pakur.",
    "University engagement is strong with leading proposals from IIT ISM Dhanbad and BIT Mesra."
  ],
  "recommendations": [
    "Accelerate CSR co-funding for water conservation projects in mining corridors.",
    "Establish regional innovation hubs at Sido Kanhu Murmu University for tribal language EdTech."
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    let text = response.text || '{}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data: GenerateReportAiOutput = JSON.parse(text);

    return NextResponse.json({
      report: data.report || 'Executive report generated successfully.',
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    });
  } catch (error) {
    console.error('Error generating AI report:', error);
    return NextResponse.json(
      {
        report: '## Executive Overview\nCivic challenge resolution is progressing across Jharkhand with active participation from academic institutions and local administrations.\n\n## District & Thematic Vulnerability Analysis\nKey priority sectors include Water Management, Healthcare, and Education in regional hotspots.\n\n## Innovation & University Response Rate\nUniversities such as BIT Mesra, IIT ISM Dhanbad, and RIMS Ranchi are developing targeted technical interventions.\n\n## Strategic Impact Assessment\nStrengthening multi-sector collaboration between government, academia, and industry will accelerate ground implementation.',
        highlights: [
          'Multiple civic challenges reported across healthcare, education, and water management in Jharkhand.',
          'Academic proposals are actively being submitted and evaluated.',
          'Focus areas include Chatra, Pakur, Dumka, and Palamu districts.'
        ],
        recommendations: [
          'Increase inter-departmental collaboration for rapid challenge resolution.',
          'Expand CSR and government funding opportunities for student and faculty innovators.',
          'Deploy localized monitoring units for critical drinking water and healthcare initiatives.'
        ],
      },
      { status: 500 }
    );
  }
}
