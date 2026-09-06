import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || '';
  const challengeTitle = url.searchParams.get('challengeTitle') || '';
  const challengeId = url.searchParams.get('challengeId') || '';
  const district = url.searchParams.get('district') || '';
  const ngrokUrl = process.env.NGROK_URL || '';

  let twimlScript = '';

  if (type === 'completion') {
    twimlScript = `
<Response>
  <Say voice="Polly.Aditi" language="en-IN">
    Namaskar! This is an automated update from CollabSolve, Government of Jharkhand civic redressal platform.
    We are pleased to inform you that your reported issue regarding "${challengeTitle || 'your civic challenge'}" in ${district || 'your district'} has been successfully resolved by the nodal department.
    Thank you for being an active citizen and helping build a better Jharkhand. Have a great day!
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="en-IN">Goodbye.</Say>
</Response>
    `.trim();
  } else {
    twimlScript = `
<Response>
  <Say voice="Polly.Aditi" language="en-IN">
    Namaskar! Greetings from CollabSolve, Government of Jharkhand. We have successfully registered the challenge you provided regarding: "${challengeTitle || 'your civic issue'}".
    To help our nodal teams resolve this faster, could you please provide any extra details or share the current status on the ground?
  </Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="${ngrokUrl}/api/twilio/handle-speech?challengeId=${encodeURIComponent(challengeId)}">
    <Say voice="Polly.Aditi" language="en-IN">Please speak your details after the tone.</Say>
  </Gather>
  <Say voice="Polly.Aditi" language="en-IN">We did not receive your input. You can also provide details directly on the CollabSolve portal. Thank you.</Say>
</Response>
    `.trim();
  }

  return new NextResponse(twimlScript, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
