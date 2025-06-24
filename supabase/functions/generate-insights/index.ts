import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AI_PROMPTS, getPrompt } from '../../../lib/prompts.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionId } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get question details and reflections
    const { data: question } = await supabaseClient
      .from('questions')
      .select(`
        question_text,
        asker:users!questions_asker_id_fkey(full_name),
        partner:users!questions_partner_id_fkey(full_name)
      `)
      .eq('id', questionId)
      .single()

    const { data: reflections } = await supabaseClient
      .from('reflections')
      .select('type, content')
      .eq('question_id', questionId)

    // Prepare context with both reflections
    const askerReflection = reflections?.find(r => r.type === 'asker')
    const partnerReflection = reflections?.find(r => r.type === 'partner')

    const context = {
      questionText: question?.question_text,
      emotionalContext: JSON.stringify(askerReflection?.content),
      // Partner reflection would be summarized here
    }

    // Get the insight generation prompt
    const prompt = getPrompt('INSIGHT_GENERATION', context)

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
        max_tokens: 600
      }),
    })

    const aiResponse = await openAIResponse.json()
    const insightText = aiResponse.choices[0].message.content

    // Parse the structured response (you'd implement proper parsing here)
    const insights = {
      emotional_summary: "Your partner is feeling...", // Extract from AI response
      contextual_summary: "This is happening because...", // Extract from AI response  
      suggested_action: "Here's what might help..." // Extract from AI response
    }

    // Save insights to database
    await supabaseClient
      .from('insights')
      .insert({
        question_id: questionId,
        ...insights
      })

    // Update question status
    await supabaseClient
      .from('questions')
      .update({ status: 'answered' })
      .eq('id', questionId)

    return new Response(
      JSON.stringify({ insights }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in generate-insights function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})