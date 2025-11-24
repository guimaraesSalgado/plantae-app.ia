import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

export const onRequest = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()

    if (!image) {
      return new Response(JSON.stringify({ error: 'Imagem não fornecida.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a botanist expert. Identify the plant in the image. Return ONLY a valid JSON object (no markdown) with the following structure: { "nome_popular": string, "nome_cientifico": string, "descricao": string (brief summary), "cuidados_recomendados": [{ "tipo_cuidado": "rega" | "luz" | "adubacao" | "temperatura" | "outro", "descricao": string, "frequencia_sugerida": string, "intervalo_dias": number }], "pontos_positivos": string[], "pontos_negativos": string[], "status_saude": "saudavel" | "atencao" | "critico", "sexo": "Masculino" | "Feminino" | "Hermafrodita" | null, "tempo_de_vida_aproximado_dias": number }. Language: Portuguese.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify this plant and provide care details.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: image, // Base64 data URL or public URL
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error('OpenAI Error:', data.error)
      throw new Error(data.error.message || 'Erro na análise da IA')
    }

    const content = data.choices[0].message.content
    // Clean up markdown if present (e.g. ```json ... ```)
    const jsonStr = content.replace(/```json\n?|```/g, '').trim()
    const result = JSON.parse(jsonStr)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
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
