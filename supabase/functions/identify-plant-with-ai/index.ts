import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

export const onRequest = async (req: Request) => {
  // 1. Handle CORS Preflight (OPTIONS) requests immediately
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Allow only POST requests for the identification logic
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Input Validation
    let body
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { imageUrl } = body

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing mandatory "imageUrl" property' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      console.error('OPENAI_API_KEY is not set')
      throw new Error('Internal Server Error: Missing API Key')
    }

    console.log('Starting OpenAI analysis...')

    // 4. OpenAI Integration
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a botanist expert. Identify the plant in the image. Return ONLY a valid JSON object (no markdown) with the following structure: { "nome_popular": string, "nome_cientifico": string, "descricao": string (max 200 chars), "cuidados_recomendados": [{ "tipo_cuidado": "rega" | "luz" | "adubacao" | "temperatura" | "outro", "descricao": string, "frequencia_sugerida": string, "intervalo_dias": number }], "pontos_positivos": string[], "pontos_negativos": string[], "status_saude": "saudavel" | "atencao" | "critico", "sexo": "Masculino" | "Feminino" | "Hermafrodita" | null, "tempo_de_vida_aproximado_dias": number, "nivel_confianca": number }. The "nivel_confianca" should be a number between 0 and 1 indicating how sure you are. Language: Portuguese.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify this plant and analyze its health.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Clean and parse JSON
    const jsonStr = content.replace(/```json\n?|```/g, '').trim()
    let result
    try {
      result = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse OpenAI response:', content)
      throw new Error('Failed to parse AI response')
    }

    console.log('Analysis successful:', result.nome_popular)

    // 5. Standardized JSON Response
    // Ensure we return the specific fields requested in the user story
    const standardizedResponse = {
      ...result,
      nome_planta_sugerido: result.nome_popular,
      frequencia_rega_sugerida:
        result.cuidados_recomendados?.find(
          (c: any) => c.tipo_cuidado === 'rega',
        )?.frequencia_sugerida || 'Verificar ficha',
      luz_recomendada:
        result.cuidados_recomendados?.find((c: any) => c.tipo_cuidado === 'luz')
          ?.descricao || 'Verificar ficha',
      nivel_confianca: result.nivel_confianca ?? 0.8,
    }

    return new Response(JSON.stringify(standardizedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // 6. Robust Error Handling & Logging
    console.error('Edge Function Error:', error)
    return new Response(
      JSON.stringify({
        error:
          'Não foi possível identificar a planta. Tente novamente ou preencha manualmente.',
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}
