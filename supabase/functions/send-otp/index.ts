import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // Supabase Auth Hook automatically injects the phone number and generated OTP
    const phone = payload.user.phone
    const otpCode = payload.sms.otp

    // Fetch Twilio credentials from Supabase secrets
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") || ""
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") || ""
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER") || ""

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Missing Twilio credentials in Edge Function configuration.")
    }
    
    const message = `Your verification code for North East Krishi Mitra is ${otpCode}. Please do not share this with anyone.`

    // Twilio REST API strictly requires application/x-www-form-urlencoded data
    const body = new URLSearchParams({
      To: phone,
      From: TWILIO_PHONE_NUMBER,
      Body: message
    })

    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: body.toString()
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Twilio API Error:", errorData)
      throw new Error(errorData.message || "Twilio rejected the SMS request")
    }

    // Success: Supabase requires an empty JSON object to proceed securely
    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error("Function Error:", error.message)
    
    // Failure: Return a 200 status code but with a structured error object.
    // This securely passes the error to the React frontend without causing an "Invalid payload" crash.
    return new Response(JSON.stringify({
      error: {
        http_code: 400,
        message: error.message
      }
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200, 
    })
  }
})