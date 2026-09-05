import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || 'dummy-key',
    });
    
    let prompt = '';

    if (type === 'progress_report') {
      prompt = `
      You are an expert AI Nodal Admin assistant. Write a professional, concise executive Progress Report based on the following dashboard data.
      Highlight key metrics, bottlenecks, and the most active districts. Format it beautifully using Markdown.
      
      Data:
      ${JSON.stringify(data, null, 2)}
      `;
    } else if (type === 'solution_brief') {
      prompt = `
      You are an expert Nodal Admin assistant. Write a 1-page Executive Solution Brief for the following accepted proposal.
      This brief will be forwarded to higher government officials and Industry CSR sponsors.
      Include:
      1. Executive Summary
      2. Problem Statement Context
      3. Proposed Technical Approach
      4. Expected Societal Impact & Feasibility
      
      Proposal & Challenge Data:
      ${JSON.stringify(data, null, 2)}
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ report: response.text });

  } catch (error: any) {
    console.error('Admin Report Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}