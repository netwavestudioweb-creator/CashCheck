'use client'

import { ArrowLeft, Camera, ReceiptText, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function HistoriquePage() {
  const router = useRouter()
  const [scans, setScans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchScans()
  }, [])

  const fetchScans = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('date_scan', { ascending: false })

    if (data && !error) {
      setScans(data)
    }
    setIsLoading(false)
  }

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result as string

        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        })

        const result = await response.json()
        
        if (result.success && result.data) {
          setScans([result.data, ...scans])
        } else {
          alert('Erreur lors du scan : ' + (result.error || 'Erreur inconnue'))
        }
        setIsUploading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      console.error(error)
      alert('Une erreur est survenue')
      setIsUploading(false)
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-white relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 px-4 sm:px-6 pt-12 pb-4 bg-white/80 backdrop-blur-md border-b border-gray-100/50 mb-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#171717]" />
          </button>
          <h1 className="text-[17px] font-semibold text-[#171717] flex-1 text-center pr-10">Tes scans</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <div className="mb-8 animate-[fade-in_0.5s_ease-out]">
          <h2 className="text-[32px] font-bold text-[#171717] tracking-tight mb-1">Historique</h2>
          <p className="text-[15px] text-gray-500">{scans.length} scan{scans.length !== 1 ? 's' : ''} enregistré{scans.length !== 1 ? 's' : ''}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun scan pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan, index) => {
              const isLatest = index === 0
              return (
                <div
                  key={scan.id}
                  className={`flex items-center justify-between p-5 rounded-[24px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] cursor-pointer animate-[fade-in_0.5s_ease-out] ${
                    isLatest 
                      ? 'border-gray-100 border-l-[6px] border-l-accent shadow-sm bg-white' 
                      : 'border-transparent bg-[#F9FAFB] hover:bg-white hover:border-gray-100'
                  }`}
                  style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center shrink-0 ${isLatest ? 'bg-[#EAF3FA]' : 'bg-white shadow-sm'}`}>
                      <ReceiptText className={`w-5 h-5 ${isLatest ? 'text-accent' : 'text-[#171717]'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#171717] text-[15px]">{scan.nom_marchand}</h3>
                      <p className="text-gray-500 text-[13px] mt-0.5">{formatDate(scan.date_scan)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-[#171717] text-[15px] mb-1">+{formatCurrency(scan.montant_net)} €</span>
                    <span className="bg-[#EAF3FA] text-accent text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      Net
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 right-6 md:absolute md:bottom-8 md:right-8 z-50 animate-[fade-in_0.8s_ease-out]" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef}
          onChange={handleCapture}
          className="hidden" 
        />

        <div className="relative group">
          <div className="absolute inset-0 bg-accent rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="relative w-[60px] h-[60px] bg-accent rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <Camera className="w-7 h-7 text-white" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
