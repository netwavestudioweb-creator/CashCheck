'use client'

import { ArrowLeft, Camera, ChevronRight, ReceiptText, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [scans, setScans] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchScans()
  }, [])

  const fetchScans = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Pour les besoins du prototype, on ne redirige pas de force, 
      // mais en prod on le ferait: router.push('/login')
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
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Calculate totals
  const totalBrut = scans.reduce((acc, scan) => acc + (Number(scan.montant_brut) || 0), 0)
  const totalCharges = scans.reduce((acc, scan) => acc + (Number(scan.charges_estimees) || 0), 0)
  const totalImpot = scans.reduce((acc, scan) => acc + (Number(scan.impot_estime) || 0), 0)
  const totalNet = scans.reduce((acc, scan) => acc + (Number(scan.montant_net) || 0), 0)

  const latestScan = scans.length > 0 ? scans[0] : null

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)
  }

  // Format de la date pour le dernier scan
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-white relative">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-50 px-4 sm:px-6 pt-12 pb-4 bg-white/80 backdrop-blur-md border-b border-gray-100/50 mb-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#171717]" />
          </button>
          <h1 className="text-[17px] font-semibold text-[#171717] flex-1 text-center pr-10">Résultat</h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 animate-[fade-in_0.5s_ease-out]">
        {/* Main Result */}
        <div className="flex flex-col items-center mt-2">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Il te reste vraiment
          </p>
          <h2 className="text-[64px] font-extrabold bg-gradient-to-br from-accent to-[#1f66aa] bg-clip-text text-transparent leading-none mt-4 tracking-tight drop-shadow-sm flex items-end justify-center">
            {formatCurrency(totalNet)} <span className="text-[56px] ml-2">€</span>
          </h2>
          <p className="text-[15px] text-gray-500 mt-4 text-center px-4">
            après charges et impôts provisionnés
          </p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8 opacity-60"></div>

        {/* Details */}
        <div className="animate-[fade-in_0.6s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4">
            Détail du calcul
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
              <span className="text-[#171717] font-medium text-[15px]">Revenu brut</span>
              <span className="font-semibold text-[#171717]">{formatCurrency(totalBrut)} €</span>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
              <span className="text-[#171717] font-medium text-[15px]">Charges estimées</span>
              <span className="font-semibold text-[#EF4444]">{formatCurrency(-totalCharges)} €</span>
            </div>
            
            <div className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
              <span className="text-[#171717] font-medium text-[15px]">Impôt provisionné</span>
              <span className="font-semibold text-[#EF4444]">{formatCurrency(-totalImpot)} €</span>
            </div>
          </div>
        </div>

        {/* Scanned Receipt Card */}
        {latestScan && (
          <Link 
            href="/historique"
            className="mt-6 flex items-center justify-between p-5 bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all active:scale-[0.99] animate-[fade-in_0.7s_ease-out]"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#EDF1F5] rounded-xl flex items-center justify-center">
                <ReceiptText className="w-5 h-5 text-[#171717]" />
              </div>
              <div>
                <p className="text-[#171717] font-semibold text-[15px]">Reçu scanné ({latestScan.nom_marchand})</p>
                <p className="text-gray-500 text-sm">Aujourd'hui, {formatTime(latestScan.date_scan)}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        )}
        
        {!latestScan && (
          <div 
            className="mt-6 flex items-center justify-between p-5 bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all active:scale-[0.99] animate-[fade-in_0.7s_ease-out]"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#EDF1F5] rounded-xl flex items-center justify-center">
                <ReceiptText className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 font-medium text-[15px]">Aucun reçu scanné</p>
                <p className="text-gray-400 text-sm">Commence par scanner un reçu</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full px-4 sm:px-6 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent md:static md:translate-x-0 md:bg-none md:mt-10 md:pb-0 md:px-0 animate-[fade-in_0.8s_ease-out]" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef}
          onChange={handleCapture}
          className="hidden" 
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-4 text-accent rounded-full border-2 border-accent bg-white font-semibold text-[17px] flex items-center justify-center gap-2 transition-all hover:bg-accent hover:text-white group md:w-auto md:px-8 md:mx-auto shadow-[0_0_0_rgba(55,138,221,0)] hover:shadow-[0_8px_20px_rgba(55,138,221,0.25)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          )}
          {isUploading ? 'Analyse en cours...' : 'Scanner un reçu'}
        </button>
      </div>
    </div>
  )
}
