import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // SMSCountry hates the "+" symbol. Let's strip it out! (+91... becomes 91...)
    const phone = payload.user.phone.replace('+', '')
    const otpCode = payload.sms.otp

    const AUTH_KEY = Deno.env.get("SMSCOUNTRY_AUTH_KEY") || ""
    const AUTH_TOKEN = Deno.env.get("SMSCOUNTRY_AUTH_TOKEN") || ""
    
    // IMPORTANT: This must be your EXACT approved 6-letter Sender ID
    const SENDER_ID = "KRISHI" 
    
    // IMPORTANT: This text MUST exactly match your approved DLT template
    const message = `Your verification code for North East Krishi Mitra is ${otpCode}. Please do not share this with anyone.`

    const credentials = btoa(`${AUTH_KEY}:${AUTH_TOKEN}`)
    
    // FIXED: Changed api.smscountry.com to restapi.smscountry.com
    const response = await fetch(`https://restapi.smscountry.com/v0.1/Accounts/${AUTH_KEY}/SMSes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        Text: message,
        Number: phone,
        SenderId: SENDER_ID,
        Tool: "API"
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("SMSCountry Error:", errorText)
      throw new Error(`SMSCountry Error: ${errorText}`)
    }

    return new Response(JSON.stringify({}), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error("Function Error:", error.message)
    
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