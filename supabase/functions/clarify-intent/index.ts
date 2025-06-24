import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AI_PROMPTS, getPrompt, createEmpathicAcknowledgment } from '../../../lib/prompts.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionText, userId, messages = [] } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user profile for context
    const { data: user } = await supabaseClient
      .from('users')
      .select('full_name')
      .eq('id', userId)
      .single()

    // Prepare conversation context
    const context = {
      userName: user?.full_name,
      questionText,
      previousMessages: messages
    }

    // Get the appropriate prompt
    const prompt = getPrompt('CLARIFY_INTENT', context)

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    })

    const aiResponse = await openAIResponse.json()
    let responseText = aiResponse.choices[0].message.content

    // Add empathetic acknowledgment if this is the first message
    if (messages.length === 0) {
      const acknowledgment = createEmpathicAcknowledgment(questionText)
      responseText = `${acknowledgment} ${responseText}`
    }

    // Save the reflection
    await supabaseClient
      .from('reflections')
      .insert({
        question_id: questionText, // You'll need to pass the actual question ID
        type: 'asker',
        content: {
          messages: [...messages, { role: 'assistant', content: responseText }]
        }
      })

    return new Response(
      JSON.stringify({ response: responseText }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in clarify-intent function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})