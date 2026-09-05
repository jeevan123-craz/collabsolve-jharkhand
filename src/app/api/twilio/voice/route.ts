import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const twiml = `
<Response>
  <Say voice="Polly.Aditi" language="en-IN">
    Namaskar! Welcome to CollabSolve Jharkhand AI Voice Helpline.
    To check the status of a challenge, press 1. To report an urgent civic grievance, press 2. Or simply speak your concern after the beep.
  </Say>
  <Gather input="speech dtmf" timeout="4" numDigits="1" action="/api/twilio/handle-speech">
    <Say voice="Polly.Aditi" language="en-IN">Please make your selection now.</Say>
  </Gather>
</Response>
  `.trim();

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
