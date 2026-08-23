'use client'

import { Check, Lock, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<'mensuel' | 'annuel'>('annuel')
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erreur lors de la redirection vers le paiement')
        setIsLoading(false)
      }
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 pt-16 pb-12 bg-white">
      {/* Icon */}
      <div className="flex justify-center mb-6 animate-[fade-in_0.5s_ease-out]">
        <div className="w-16 h-16 bg-[#EAF3FA] rounded-full flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8 text-accent" strokeWidth={2.5} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8 space-y-3 animate-[fade-in_0.6s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <h1 className="text-3xl font-bold text-[#171717] tracking-tight leading-tight px-4">
          Débloque ton bilan complet
        </h1>
        <p className="text-[15px] text-gray-500 leading-snug px-2">
          Scans illimités et suivi mensuel de ta trésorerie réelle
        </p>
      </div>

      {/* Plans */}
      <div className="space-y-4 mb-8 animate-[fade-in_0.7s_ease-out]" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        {/* Mensuel */}
        <div 
          onClick={() => setSelectedPlan('mensuel')}
          className={`relative p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${
            selectedPlan === 'mensuel' ? 'border-accent bg-[#F2F8FE] shadow-[0_8px_20px_rgba(55,138,221,0.1)]' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div>
            <h3 className={`font-bold text-[17px] ${selectedPlan === 'mensuel' ? 'text-accent' : 'text-[#171717]'}`}>Mensuel</h3>
            <p className="text-gray-500 text-[13px] mt-0.5">Flexibilité totale</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-[#171717] text-[15px]">9,99 €/mois</span>
          </div>
        </div>

        {/* Annuel */}
        <div 
          onClick={() => setSelectedPlan('annuel')}
          className={`relative p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 flex items-center justify-between mt-6 ${
            selectedPlan === 'annuel' ? 'border-accent bg-[#F2F8FE] shadow-[0_0_24px_rgba(55,138,221,0.2)] ring-4 ring-accent/10' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-accent to-[#2B73BD] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
            Recommandé
          </div>
          <div>
            <h3 className={`font-bold text-[17px] ${selectedPlan === 'annuel' ? 'text-accent' : 'text-[#171717]'}`}>Annuel</h3>
            <p className="text-accent font-medium text-[13px] mt-0.5">Économise 50 %</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-accent text-[15px]">4,99 €/mois</span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-4 mb-auto px-2 animate-[fade-in_0.8s_ease-out]" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-[#EAF3FA] rounded-full flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-accent" strokeWidth={3} />
          </div>
          <span className="text-[15px] font-medium text-[#171717]">Scans illimités chaque mois</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-[#EAF3FA] rounded-full flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-accent" strokeWidth={3} />
          </div>
          <span className="text-[15px] font-medium text-[#171717]">Bilan complet de ta trésorerie</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-[#EAF3FA] rounded-full flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-accent" strokeWidth={3} />
          </div>
          <span className="text-[15px] font-medium text-[#171717]">Suivi mensuel automatique</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center animate-[fade-in_0.9s_ease-out]" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        <button 
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full py-4 text-white rounded-full bg-gradient-to-r from-accent to-[#2B73BD] shadow-[0_8px_20px_rgba(55,138,221,0.25)] hover:opacity-90 active:scale-[0.98] transition-all font-semibold text-[17px] tracking-wide mb-3 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : 'Débloquer pour 1 €'}
        </button>
        <p className="text-[13px] font-medium text-gray-500">
          Essai 7 jours, puis {selectedPlan === 'annuel' ? '4,99 €' : '9,99 €'}/mois
        </p>
      </div>
    </div>
  )
}
