import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { plan } = await req.json()

    if (!plan || (plan !== 'mensuel' && plan !== 'annuel')) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Récupérer le stripe_customer_id de l'utilisateur s'il existe déjà
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    const customerId = profile?.stripe_customer_id

    // Configuration des prix selon le plan
    const priceData = plan === 'mensuel'
      ? {
          currency: 'eur',
          unit_amount: 999, // 9,99€
          product_data: {
            name: 'Abonnement Mensuel CashCheck',
            description: 'Scans illimités et suivi mensuel',
          },
          recurring: {
            interval: 'month' as const,
          },
        }
      : {
          currency: 'eur',
          unit_amount: 5988, // 4,99€ * 12 = 59,88€ facturé annuellement
          product_data: {
            name: 'Abonnement Annuel CashCheck',
            description: 'Scans illimités et suivi mensuel (Facturé annuellement)',
          },
          recurring: {
            interval: 'year' as const,
          },
        }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/paywall`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan: plan
      }
    }

    // Si le customer existe déjà, on l'associe à la session
    if (customerId) {
      sessionConfig.customer = customerId
    } else {
      sessionConfig.customer_email = user.email // Pré-remplit l'email s'il n'y a pas de customer
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Erreur Checkout:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
