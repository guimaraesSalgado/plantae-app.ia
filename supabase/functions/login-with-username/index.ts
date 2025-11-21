import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

export const onRequest = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Nome de usuário e senha são obrigatórios.' }),
        {
          status: 200, // Return 200 to handle error message in frontend easily
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Create a Supabase client with the Service Role Key to query users table
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    let emailToSignIn = username
    // Check if the input looks like an email address
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)

    if (!isEmail) {
      // 1. Find email by username if input is not an email
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('username', username)
        .single()

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado.' }),
          {
            status: 200, // Return 200 to handle error message in frontend easily
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
      emailToSignIn = user.email
    }

    // 2. Sign in with email and password using the public client context
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: emailToSignIn,
        password: password,
      })

    if (authError) {
      return new Response(JSON.stringify({ error: 'Senha incorreta.' }), {
        status: 200, // Return 200 to handle error message in frontend easily
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(authData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}
