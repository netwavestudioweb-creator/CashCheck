'use client'

import { createClient } from '@/utils/supabase/client'
import { Camera, ReceiptText, Mail } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      console.error('Error logging in:', error.message)
      setMessage(error.message)
    } else {
      setMessage('Lien magique envoyé ! Vérifie tes emails.')
    }
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 pt-16 pb-12">
      {/* Header */}
      <div 
        className="flex items-center gap-2 mb-8 animate-[fade-in_0.6s_ease-out]"
        style={{ animationFillMode: 'both' }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">CashCheck</h1>
        <Camera className="w-6 h-6 text-[#171717]" strokeWidth={2.5} />
      </div>

      <div 
        className="space-y-4 mb-16 animate-[fade-in_0.6s_ease-out]"
        style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
      >
        <h2 className="text-[40px] leading-[1.1] font-bold text-[#171717] tracking-tight">
          Sais-tu combien il te reste vraiment ?
        </h2>
        <p className="text-lg text-gray-500 leading-snug">
          Scanne une facture, connais ton revenu net en 3 secondes.
        </p>
      </div>

      {/* Illustration */}
      <div 
        className="flex justify-center mb-auto pt-8 animate-[fade-in_0.8s_ease-out]"
        style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
      >
        <div className="w-[200px] h-[300px] border-[12px] border-accent rounded-[36px] flex flex-col items-center justify-center bg-white relative shadow-[0_8px_40px_rgba(55,138,221,0.15)] transition-transform hover:scale-[1.02] duration-500">
          <div className="w-24 h-28 border border-accent/30 rounded-xl flex flex-col items-center justify-center bg-white shadow-sm gap-2">
            <ReceiptText className="w-8 h-8 text-[#171717]" strokeWidth={1.5} />
          </div>
          <p className="text-accent font-bold mt-4 text-lg">12,50 €</p>
        </div>
      </div>

      {/* Footer / Actions */}
      <div 
        className="relative w-full mt-12 flex flex-col items-center animate-[fade-in_0.6s_ease-out]"
        style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
      >
        {/* Floating Bubble */}
        <div className="absolute -top-16 right-0 bg-white/80 backdrop-blur-md border border-accent/20 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-36 z-10 animate-[pulse_4s_ease-in-out_infinite]">
          <p className="text-sm font-semibold text-[#171717] mb-1">Reçu</p>
          <p className="text-accent font-bold text-lg drop-shadow-sm">Détecté</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-3 relative z-0">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Ton adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-[#171717]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full py-4 text-white rounded-full bg-gradient-to-r from-accent to-[#2B73BD] hover:opacity-90 active:scale-[0.98] hover:scale-[1.02] transition-all duration-300 font-semibold text-lg shadow-[0_8px_20px_rgba(55,138,221,0.25)] disabled:opacity-50"
          >
            {loading ? 'Envoi...' : 'Recevoir le lien magique'}
          </button>
          
          {message && (
            <p className="text-sm text-center font-medium mt-2 text-accent">
              {message}
            </p>
          )}
        </form>

        <p className="mt-4 text-[13px] text-gray-400 font-medium">
          En continuant, tu acceptes les CGU
        </p>
      </div>
    </div>
  )
}
