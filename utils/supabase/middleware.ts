import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback')

  if (!user && !isLoginPage && !isAuthCallback) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Protection du Paywall pour les routes protégées
  const isDashboardOrHistorique = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/historique')

  if (user && isDashboardOrHistorique) {
    // Vérifier le statut de l'abonnement
    const { data: profile } = await supabase
      .from('profiles')
      .select('abonnement_actif')
      .eq('id', user.id)
      .single()

    if (!profile?.abonnement_actif) {
      // S'il n'est pas abonné, on compte le nombre de scans
      const { count } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // S'il a déjà fait au moins 1 scan, il doit payer
      if (count && count >= 1) {
        const url = request.nextUrl.clone()
        url.pathname = '/paywall'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
