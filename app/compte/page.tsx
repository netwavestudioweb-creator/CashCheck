'use client'

import { ArrowLeft, Bell, ChevronRight, CreditCard, HelpCircle, Tag, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ComptePage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)

  const handlePortal = async () => {
    setIsLoadingPortal(true)
    try {
      const res = await fetch('/api/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erreur lors de la redirection vers le portail')
        setIsLoadingPortal(false)
      }
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue')
      setIsLoadingPortal(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-4 sm:px-6 pt-12 pb-12 bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 animate-[fade-in_0.5s_ease-out]">
        <button onClick={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#171717]" />
        </button>
        <h1 className="text-[17px] font-semibold text-[#171717] flex-1 text-center pr-10">Paramètres</h1>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center mb-12 animate-[fade-in_0.6s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div className="w-[88px] h-[88px] bg-gradient-to-br from-[#EAF3FA] to-[#d4e8f7] rounded-full flex items-center justify-center mb-4 shadow-sm border border-white">
          <span className="text-accent text-2xl font-bold tracking-tight">JD</span>
        </div>
        <h2 className="text-xl font-bold text-[#171717]">Julien Dubois</h2>
        <p className="text-gray-500 mt-1 text-[15px]">julien@email.com</p>
      </div>

      {/* List */}
      <div className="flex-1 animate-[fade-in_0.7s_ease-out]" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 px-2">
          Mon compte
        </p>

        <div className="space-y-1">
          {/* Item 1 */}
          <div className="group flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-2xl transition-all duration-300">
            <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-[#EAF3FA] rounded-full flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                <Tag className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
              </div>
              <span className="font-semibold text-[#171717]">Statut fiscal</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-[15px] group-hover:text-gray-500 transition-colors">Auto-entrepreneur</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-4"></div>

          {/* Item 2 */}
          <div 
            onClick={handlePortal}
            className={`group flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-2xl transition-all duration-300 ${isLoadingPortal ? 'opacity-70 pointer-events-none' : ''}`}
          >
            <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-[#EAF3FA] rounded-full flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                <CreditCard className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
              </div>
              <span className="font-semibold text-[#171717]">Gérer mon abonnement</span>
            </div>
            <div className="flex items-center gap-3">
              {isLoadingPortal ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-4"></div>

          {/* Item 3 */}
          <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
            <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-[#EAF3FA] rounded-full flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                <Bell className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
              </div>
              <span className="font-semibold text-[#171717]">Notifications</span>
            </div>
            
            {/* Custom Toggle Switch */}
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-[52px] h-7 rounded-full transition-colors duration-300 flex items-center px-1 shadow-inner focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                notifications ? 'bg-gradient-to-r from-accent to-[#2B73BD]' : 'bg-gray-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
                notifications ? 'translate-x-[24px]' : 'translate-x-0'
              }`}></div>
            </button>
          </div>

          <div className="h-px bg-gray-100 mx-4"></div>

          {/* Item 4 */}
          <div className="group flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-2xl transition-all duration-300">
            <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform duration-300">
              <div className="w-10 h-10 bg-[#EAF3FA] rounded-full flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
                <HelpCircle className="w-5 h-5 text-accent group-hover:text-white transition-colors" />
              </div>
              <span className="font-semibold text-[#171717]">Aide et support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 animate-[fade-in_0.8s_ease-out]" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <button className="w-full py-4 text-[#EF4444] font-semibold text-[17px] bg-red-50/50 hover:bg-red-50 rounded-full transition-colors hover:text-red-500 active:scale-95 border border-transparent hover:border-red-100">
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
