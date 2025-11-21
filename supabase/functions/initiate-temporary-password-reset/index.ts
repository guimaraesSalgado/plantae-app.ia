import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

export const onRequest = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { identifier } = await req.json()

    if (!identifier) {
      return new Response(
        JSON.stringify({ error: 'Informe seu e-mail ou nome de usuário.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 1. Find user
    let userId = ''
    let userEmail = ''

    // Check if identifier is email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)

    if (isEmail) {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('email', identifier)
        .single()

      if (error || !users) {
        return new Response(
          JSON.stringify({
            error: 'Não encontramos uma conta com esses dados.',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
      userId = users.id
      userEmail = users.email
    } else {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('username', identifier)
        .single()

      if (error || !users) {
        return new Response(
          JSON.stringify({
            error: 'Não encontramos uma conta com esses dados.',
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
      userId = users.id
      userEmail = users.email
    }

    // 2. Generate Temporary Password
    const tempPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-4).toUpperCase()

    // 3. Update Auth User Password (so they can login)
    const { error: updateAuthError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
      })

    if (updateAuthError) {
      throw updateAuthError
    }

    // 4. Update Public User Flags
    // We store a hash just for record keeping or verification if needed,
    // but the main mechanism is updating the auth password and setting the flag.
    // For the hash, we'll just use a simple one here since we rely on Supabase Auth for the actual login check.
    const encoder = new TextEncoder()
    const data = encoder.encode(tempPassword)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiration

    const { error: updatePublicError } = await supabaseAdmin
      .from('users')
      .update({
        temporary_password_hash: hashHex,
        temporary_password_expires_at: expiresAt.toISOString(),
        is_temporary_password_active: true,
      })
      .eq('id', userId)

    if (updatePublicError) {
      throw updatePublicError
    }

    // 5. Send Email (Simulated)
    console.log(
      `[MOCK EMAIL] To: ${userEmail}, Subject: Sua senha temporária de acesso`,
    )
    console.log(`[MOCK EMAIL] Body: Sua senha temporária é: ${tempPassword}`)

    // Return success (and temp password for demo purposes in response, usually wouldn't do this in prod)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Senha temporária enviada.',
        // IN PRODUCTION: REMOVE THIS FIELD
        debug_temp_password: tempPassword,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}
