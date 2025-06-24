import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Red flag detection keywords and patterns
const RED_FLAG_KEYWORDS = [
  'hit', 'hits', 'hitting', 'punch', 'punched', 'slap', 'slapped', 'kick', 'kicked',
  'hurt', 'hurts', 'hurting', 'bruise', 'bruised', 'violence', 'violent',
  'abuse', 'abused', 'abusing', 'beat', 'beaten', 'beating',
  'threaten', 'threatens', 'threatened', 'threatening', 'threat', 'threats',
  'scare', 'scared', 'scaring', 'intimidate', 'intimidated', 'intimidating',
  'afraid', 'fear', 'fearful', 'terrified', 'terror',
  'control', 'controls', 'controlling', 'controlled', 'manipulate', 'manipulated',
  'isolate', 'isolated', 'isolating', 'isolation', 'trapped', 'trap',
  'won\'t let me', 'doesn\'t let me', 'forbid', 'forbidden', 'not allowed',
  'worthless', 'stupid', 'useless', 'pathetic', 'disgusting', 'hate myself',
  'kill myself', 'suicide', 'suicidal', 'end it all', 'better off dead',
  'unsafe', 'danger', 'dangerous', 'emergency', 'help me', 'save me'
];

const RED_FLAG_PATTERNS = [
  /won'?t let me (talk to|see|visit|call)/i,
  /doesn'?t (allow|let) me to/i,
  /makes me feel (worthless|stupid|afraid)/i,
  /threatens to (leave|hurt|kill)/i,
  /says (he|she)'?ll (hurt|leave|kill)/i,
  /controls? (what I|where I|who I)/i,
  /checks? my (phone|email|messages)/i,
  /follows? me (everywhere|around)/i,
];

function detectRedFlags(text: string) {
  const lowerText = text.toLowerCase();
  
  // Check for keyword matches
  for (const keyword of RED_FLAG_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        isRedFlag: true,
        triggerPhrase: keyword,
        severity: categorizeRedFlag(keyword)
      };
    }
  }
  
  // Check for pattern matches
  for (const pattern of RED_FLAG_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        isRedFlag: true,
        triggerPhrase: match[0],
        severity: 'high'
      };
    }
  }
  
  return { isRedFlag: false };
}

function categorizeRedFlag(triggerPhrase: string): string {
  const lowerTrigger = triggerPhrase.toLowerCase();
  
  // Physical violence and threats - highest priority
  const highSeverityKeywords = [
    'hit', 'punch', 'slap', 'kick', 'hurt', 'bruise', 'violence', 'beat',
    'threaten', 'threat', 'afraid', 'fear', 'terrified', 'suicide', 'kill myself'
  ];
  
  if (highSeverityKeywords.some(keyword => lowerTrigger.includes(keyword))) {
    return 'high';
  }
  
  return 'medium';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, questionId, userId, source } = await req.json()

    // Detect red flags in the text
    const redFlagResult = detectRedFlags(text)

    if (redFlagResult.isRedFlag) {
      // Initialize Supabase client
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Log the red flag
      await supabaseClient
        .from('red_flags')
        .insert({
          question_id: questionId,
          trigger_phrase: redFlagResult.triggerPhrase,
          who_triggered: source, // 'asker' or 'partner'
          action_taken: `Red flag detected: ${redFlagResult.severity} severity. Conversation halted and resources provided.`
        })

      // Update question status
      await supabaseClient
        .from('questions')
        .update({ 
          status: 'red_flag',
          red_flag_detected: true 
        })
        .eq('id', questionId)

      return new Response(
        JSON.stringify({
          redFlagDetected: true,
          severity: redFlagResult.severity,
          triggerPhrase: redFlagResult.triggerPhrase,
          action: 'halt_conversation'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ redFlagDetected: false }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in check-red-flags function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})