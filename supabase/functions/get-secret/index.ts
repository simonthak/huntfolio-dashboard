import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Get secret function started')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { key } = await req.json()
    
    if (!key) {
      throw new Error('No key provided')
    }

    console.log('Fetching secret for key:', key)
    const secret = Deno.env.get(key)
    
    if (!secret) {
      console.error(`Secret ${key} not found in environment variables`)
      throw new Error(`Secret ${key} not found`)
    }

    console.log(`Successfully retrieved secret for key: ${key}`)
    
    return new Response(
      JSON.stringify({ [key]: secret }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-secret function:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})