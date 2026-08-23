import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { image } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'Aucune image fournie' }, { status: 400 })
    }

    // Analyse avec OpenAI Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant spécialisé dans l\'extraction de données de reçus et factures. Tu dois retourner uniquement un objet JSON valide, sans aucun texte additionnel ou bloc markdown.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extrais le nom du marchand et le montant total TTC en euros de cette facture. Retourne la réponse au format JSON avec exactement les clés: "nom_marchand" (string) et "montant_brut" (number). Si le nom du marchand n\'est pas clair, renvoie "Inconnu". Assure-toi que "montant_brut" est bien un nombre.'
            },
            {
              type: 'image_url',
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('Erreur lors de l\'analyse de l\'image par OpenAI')
    }

    const extractedData = JSON.parse(content)
    const nom_marchand = extractedData.nom_marchand || 'Inconnu'
    const montant_brut = parseFloat(extractedData.montant_brut)

    if (isNaN(montant_brut)) {
      return NextResponse.json({ error: 'Impossible d\'extraire un montant valide.' }, { status: 400 })
    }

    // Calculs (arrondis à 2 décimales)
    const charges_estimees = Number((montant_brut * 0.22).toFixed(2))
    const impot_estime = Number((montant_brut * 0.10).toFixed(2))
    const montant_net = Number((montant_brut - charges_estimees - impot_estime).toFixed(2))

    // Sauvegarde dans Supabase
    const { data: scanData, error: dbError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        nom_marchand,
        montant_brut,
        charges_estimees,
        impot_estime,
        montant_net
      })
      .select()
      .single()

    if (dbError) {
      console.error('Erreur Supabase:', dbError)
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde dans la base de données.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: scanData })

  } catch (error: any) {
    console.error('Erreur /api/scan:', error)
    return NextResponse.json({ error: error.message || 'Une erreur est survenue' }, { status: 500 })
  }
}
