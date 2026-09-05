import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, type, challengeTitle, challengeId, district } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    let twimlScript = '';
    let promptSummary = '';

    if (type === 'completion') {
      promptSummary = `Informing citizen that challenge "${challengeTitle || 'reported issue'}" in ${district || 'Jharkhand'} has been RESOLVED.`;
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
      promptSummary = `Calling citizen to request on-ground updates for challenge "${challengeTitle || 'reported issue'}".`;
      twimlScript = `
<Response>
  <Say voice="Polly.Aditi" language="en-IN">
    Namaskar! This is an automated follow-up from CollabSolve Jharkhand regarding your registered challenge: "${challengeTitle || 'civic issue'}".
    Our field officers are reviewing progress. Could you please share the current status or any recent developments?
  </Say>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="/api/twilio/handle-speech?challengeId=${encodeURIComponent(challengeId || '')}">
    <Say voice="Polly.Aditi" language="en-IN">Please speak after the tone.</Say>
  </Gather>
  <Say voice="Polly.Aditi" language="en-IN">We did not receive your input. You can also reply on the CollabSolve portal. Thank you.</Say>
</Response>
      `.trim();
    }

    if (accountSid && authToken && fromNumber) {
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', phoneNumber);
      params.append('From', fromNumber);
      params.append('Twiml', twimlScript);

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const twilioData = await twilioRes.json();

      if (!twilioRes.ok) {
        return NextResponse.json(
          {
            error: twilioData.message || 'Twilio call failed',
            details: twilioData,
            liveMode: true,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        callSid: twilioData.sid,
        status: twilioData.status,
        recipient: phoneNumber,
        type,
        liveMode: true,
        message: `Live Twilio voice call placed to ${phoneNumber}.`,
      });
    }

    return NextResponse.json({
      success: true,
      simulated: true,
      liveMode: false,
      callSid: 'CA' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      recipient: phoneNumber,
      type,
      promptSummary,
      twiml: twimlScript,
      message: `AI Voice call successfully dispatched to ${phoneNumber} in simulation mode. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env to place actual live phone calls.`,
    });
  } catch (err: any) {
    console.error('Twilio Call API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
