import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-07-29.dahlia',
})

// Client Supabase avec droits d'admin pour passer outre la RLS dans le webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (!signature || !endpointSecret) {
      throw new Error('Missing stripe signature or endpoint secret')
    }
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const customerId = session.customer as string

        if (userId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              abonnement_actif: true,
              stripe_customer_id: customerId,
            })
            .eq('id', userId)

          if (error) {
            console.error('Erreur mise à jour profil (checkout.session.completed):', error)
            throw error
          }
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            abonnement_actif: false,
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Erreur mise à jour profil (customer.subscription.deleted):', error)
          throw error
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erreur traitement webhook:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
