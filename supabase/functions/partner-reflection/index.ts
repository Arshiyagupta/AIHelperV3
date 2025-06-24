import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AI_PROMPTS, getPrompt, createEmpathicAcknowledgment } from '../_shared/prompts.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionId, partnerId, messages = [] } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get question and user details
    const { data: question } = await supabaseClient
      .from('questions')
      .select(`
        question_text,
        users!questions_partner_id_fkey(full_name)
      `)
      .eq('id', questionId)
      .single()

    // Prepare conversation context
    const context = {
      partnerName: question?.users?.full_name,
      questionText: question?.question_text,
      previousMessages: messages
    }

    // Get the appropriate prompt
    const prompt = getPrompt('PARTNER_REFLECTION', context)

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
        temperature: 0.8,
        max_tokens: 400
      }),
    })

    const aiResponse = await openAIResponse.json()
    let responseText = aiResponse.choices[0].message.content

    // Add empathetic acknowledgment for first interaction
    if (messages.length === 0) {
      const acknowledgment = "Thank you for being willing to have this conversation. I know this might feel a bit different, but your openness really shows how much you care about your relationship."
      responseText = `${acknowledgment} ${responseText}`
    }

    // Save the reflection
    await supabaseClient
      .from('reflections')
      .insert({
        question_id: questionId,
        type: 'partner',
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
    console.error('Error in partner-reflection function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})