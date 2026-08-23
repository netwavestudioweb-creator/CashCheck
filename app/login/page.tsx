'use client'

import { useRouter } from 'next/navigation'
import { Camera, ReceiptText } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const handleBypass = () => {
    // Redirection directe vers le dashboard sans authentification
    router.push('/dashboard')
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
        <button
          onClick={handleBypass}
          className="flex items-center justify-center w-full py-4 text-white rounded-full bg-gradient-to-r from-accent to-[#2B73BD] hover:opacity-90 active:scale-[0.98] hover:scale-[1.02] transition-all duration-300 font-semibold text-lg shadow-[0_8px_20px_rgba(55,138,221,0.25)]"
        >
          Continuer
        </button>
        
        <p className="mt-4 text-[13px] text-gray-400 font-medium">
          Mode test local (sans authentification)
        </p>
      </div>
    </div>
  )
}
