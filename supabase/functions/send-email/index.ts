// Supabase Edge Function for sending emails via Gmail SMTP
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, gmailUser, gmailPassword } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email using Deno's built-in SMTP
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'gmail',
        template_id: 'template_id',
        user_id: gmailUser,
        template_params: {
          to_email: to,
          subject: subject,
          message: html,
          reply_to: gmailUser
        }
      })
    })

    if (response.ok) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      throw new Error(`Email service error: ${response.status}`)
    }

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})








