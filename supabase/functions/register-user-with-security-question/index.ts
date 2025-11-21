import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { hashAnswer } from '../_shared/hashing.ts'

export const onRequest = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const {
      fullName,
      username,
      email,
      dateOfBirth,
      password,
      securityQuestion,
      securityAnswer,
    } = await req.json()

    // 1. Check if username exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return new Response(
        JSON.stringify({
          error: 'Este user já está em uso. Por favor, escolha outro.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }

    // 2. Create Auth User
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          name: fullName,
        },
      })

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const userId = authData.user.id

    // 3. Update public.users with username, dob and explicitly set username_change_count to 0
    const { error: updateError, count } = await supabase
      .from('users')
      .update({
        username,
        data_nascimento: dateOfBirth,
        username_change_count: 0,
      })
      .eq('id', userId)
      .select('id', { count: 'exact' })

    if (updateError) {
      await supabase.auth.admin.deleteUser(userId)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar dados do usuário.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    // If no rows were updated, it means the user row doesn't exist in public.users yet.
    // We must insert it manually to ensure consistency.
    if (count === 0) {
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email,
        nome: fullName,
        username,
        data_nascimento: dateOfBirth,
        username_change_count: 0,
      })

      if (insertError) {
        await supabase.auth.admin.deleteUser(userId)
        return new Response(
          JSON.stringify({
            error: 'Erro ao criar perfil do usuário: ' + insertError.message,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          },
        )
      }
    }

    // 4. Hash Answer and Insert Security Question
    const answerHash = await hashAnswer(securityAnswer)

    const { error: securityError } = await supabase
      .from('user_security_questions')
      .insert({
        user_id: userId,
        question: securityQuestion,
        answer_hash: answerHash,
      })

    if (securityError) {
      // Rollback
      await supabase.auth.admin.deleteUser(userId)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar pergunta de segurança.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      )
    }

    return new Response(JSON.stringify({ success: true, userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}
