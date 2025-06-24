import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to generate unique invite codes
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const prefix = 'SAFE-';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + code;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if user already has an invite code
    const { data: existingUser, error: fetchError } = await supabaseClient
      .from('users')
      .select('invite_code')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user:', fetchError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // If user already has an invite code, return it
    if (existingUser.invite_code && existingUser.invite_code.trim() !== '') {
      return new Response(
        JSON.stringify({ 
          inviteCode: existingUser.invite_code,
          message: 'Existing invite code returned'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Generate a new unique invite code
    let newInviteCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      newInviteCode = generateInviteCode();
      attempts++;

      // Check if this code already exists
      const { data: existingCode } = await supabaseClient
        .from('users')
        .select('id')
        .eq('invite_code', newInviteCode)
        .single()

      if (!existingCode) {
        break; // Code is unique
      }

      if (attempts >= maxAttempts) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate unique invite code' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    } while (attempts < maxAttempts);

    // Update user with the new invite code
    const { error: updateError } = await supabaseClient
      .from('users')
      .update({ invite_code: newInviteCode })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user with invite code:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to save invite code' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        inviteCode: newInviteCode,
        message: 'New invite code generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in generate-invite-code function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})