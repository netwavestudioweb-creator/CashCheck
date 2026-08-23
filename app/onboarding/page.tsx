'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedStatut, setSelectedStatut] = useState<string>('auto-entrepreneur')

  const options = [
    {
      id: 'auto-entrepreneur',
      title: 'Auto-entrepreneur',
      subtitle: 'Micro-entreprise',
    },
    {
      id: 'societe',
      title: 'Société (EURL/SASU)',
      subtitle: '',
    },
    {
      id: 'unknown',
      title: 'Je ne sais pas encore',
      subtitle: '',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 pt-12 pb-8 bg-white relative">
      {/* Progress Bar */}
      <div className="mb-8 animate-[fade-in_0.5s_ease-out]">
        <div className="flex gap-2 mb-3">
          <div className="h-1.5 flex-1 bg-gradient-to-r from-accent to-[#2B73BD] rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-100 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-100 rounded-full"></div>
        </div>
        <p className="text-gray-500 text-sm font-medium">Étape 1 sur 3</p>
      </div>

      <div className="mb-8 space-y-3 animate-[fade-in_0.6s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <h1 className="text-4xl font-bold tracking-tight text-[#171717]">Ton statut</h1>
        <p className="text-lg text-gray-500">Pour calculer tes charges réelles</p>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-auto">
        {options.map((option, index) => {
          const isSelected = selectedStatut === option.id
          return (
            <button
              key={option.id}
              onClick={() => setSelectedStatut(option.id)}
              className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 text-left cursor-pointer animate-[fade-in_0.5s_ease-out] hover:-translate-y-1 ${
                isSelected
                  ? 'border-accent bg-[#F2F8FE] shadow-[0_8px_20px_rgba(55,138,221,0.1)] ring-2 ring-accent/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              style={{ animationDelay: `${0.2 + (index * 0.1)}s`, animationFillMode: 'both' }}
            >
              <div>
                <h3 className={`font-semibold text-[17px] transition-colors ${isSelected ? 'text-accent' : 'text-[#171717]'}`}>
                  {option.title}
                </h3>
                {option.subtitle && (
                  <p className={`text-[15px] mt-1 transition-colors ${isSelected ? 'text-accent/80' : 'text-gray-500'}`}>
                    {option.subtitle}
                  </p>
                )}
              </div>
              
              {/* Custom Radio Button */}
              <div
                className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  isSelected ? 'border-accent' : 'border-gray-300'
                }`}
              >
                <div className={`w-3 h-3 bg-accent rounded-full transition-transform duration-300 ease-out ${
                  isSelected ? 'scale-100' : 'scale-0'
                }`}></div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer Action */}
      <div className="pt-8 animate-[fade-in_0.8s_ease-out]" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-4 text-white rounded-full bg-gradient-to-r from-accent to-[#2B73BD] shadow-[0_8px_20px_rgba(55,138,221,0.25)] hover:opacity-90 active:scale-[0.98] transition-all font-semibold text-[17px] tracking-wide"
        >
          Continuer
        </button>
      </div>
    </div>
  )
}
