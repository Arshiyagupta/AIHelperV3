import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { currentUserId, partnerInviteCode } = await req.json()

    if (!currentUserId || !partnerInviteCode) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find partner by invite code
    const { data: partner, error: partnerError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('invite_code', partnerInviteCode)
      .single()

    if (partnerError || !partner) {
      return new Response(
        JSON.stringify({ error: 'Invalid invite code' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Check if users are trying to connect to themselves
    if (partner.id === currentUserId) {
      return new Response(
        JSON.stringify({ error: 'Cannot connect to yourself' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check if current user is already connected to this partner
    const { data: currentUser } = await supabaseClient
      .from('users')
      .select('partner_id')
      .eq('id', currentUserId)
      .single()

    if (currentUser?.partner_id === partner.id) {
      return new Response(
        JSON.stringify({ error: 'Already connected to this partner' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check if either user is already connected to someone else
    if (currentUser?.partner_id) {
      return new Response(
        JSON.stringify({ error: 'You are already connected to another partner' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (partner.partner_id) {
      return new Response(
        JSON.stringify({ error: 'This partner is already connected to someone else' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Update both users to connect them
    const { error: updateError1 } = await supabaseClient
      .from('users')
      .update({ partner_id: partner.id })
      .eq('id', currentUserId)

    if (updateError1) {
      console.error('Error updating current user:', updateError1)
      return new Response(
        JSON.stringify({ error: 'Failed to connect users' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const { error: updateError2 } = await supabaseClient
      .from('users')
      .update({ partner_id: currentUserId })
      .eq('id', partner.id)

    if (updateError2) {
      console.error('Error updating partner:', updateError2)
      
      // Rollback the first update
      await supabaseClient
        .from('users')
        .update({ partner_id: null })
        .eq('id', currentUserId)

      return new Response(
        JSON.stringify({ error: 'Failed to connect users' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Create connection record
    const { error: connectionError } = await supabaseClient
      .from('connections')
      .insert({
        user_a_id: currentUserId,
        user_b_id: partner.id,
      })

    if (connectionError) {
      console.error('Error creating connection record:', connectionError)
      // Don't fail the entire operation for this - the users are still connected
    }

    // Return success with partner info (excluding sensitive data)
    return new Response(
      JSON.stringify({ 
        success: true,
        partner: {
          id: partner.id,
          full_name: partner.full_name,
          email: partner.email
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in connect-partner function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})