import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tokens, title, body, data = {} } = await req.json()

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tokens provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Prepare notifications for each token
    const notifications: NotificationPayload[] = tokens.map(token => ({
      to: token,
      title,
      body,
      data,
      sound: 'default',
      badge: 1
    }))

    // Send notifications to Expo Push API
    const responses = await Promise.allSettled(
      notifications.map(async (notification) => {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
      })
    )

    // Count successful and failed notifications
    const successful = responses.filter(r => r.status === 'fulfilled').length
    const failed = responses.filter(r => r.status === 'rejected').length

    console.log(`Notifications sent: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed: failed,
        details: responses 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending notifications:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send notifications' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})