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
    const ngrokUrl = process.env.NGROK_URL;

    if (accountSid && authToken && fromNumber && ngrokUrl) {
      const twimlUrl = new URL(ngrokUrl + '/api/twilio/twiml');
      twimlUrl.searchParams.append('type', type || '');
      twimlUrl.searchParams.append('challengeTitle', challengeTitle || '');
      twimlUrl.searchParams.append('challengeId', challengeId || '');
      twimlUrl.searchParams.append('district', district || '');

      const authHeader = 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64');
      const params = new URLSearchParams();
      params.append('To', phoneNumber);
      params.append('From', fromNumber);
      params.append('Url', twimlUrl.toString()); // USE URL FOR TRIAL ACCOUNTS!
      // removed method

      const twilioRes = await fetch(
        'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Calls.json',
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
        message: 'Live Twilio voice call placed to ' + phoneNumber,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Missing Twilio environment variables (including NGROK_URL).',
    }, { status: 500 });
  } catch (err: any) {
    console.error('Twilio Call API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
