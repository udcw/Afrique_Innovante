'use client'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa'

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const SOCIAL_LINKS = [
  { name: 'Instagram', url: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM!, icon: FaInstagram },
  { name: 'Facebook', url: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK!, icon: FaFacebook },
  { name: 'TikTok', url: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK!, icon: FaTiktok },
  { name: 'YouTube', url: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE!, icon: FaYoutube },
]

export default function VotePage() {
  const { candidateId } = useParams()
  const router = useRouter()
  const [candidate, setCandidate] = useState<any>(null)
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [socialChecks, setSocialChecks] = useState<{ [key: string]: boolean }>({
    Instagram: false,
    Facebook: false,
    TikTok: false,
    YouTube: false,
  })
  const [clickedLinks, setClickedLinks] = useState<{ [key: string]: boolean }>({
    Instagram: false,
    Facebook: false,
    TikTok: false,
    YouTube: false,
  })
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)

  useEffect(() => {
    const fetchCandidate = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('name, bio, country, image_url')
        .eq('id', candidateId)
        .single()
      if (error) setError("Candidat introuvable")
      else setCandidate(data)
    }
    fetchCandidate()
  }, [candidateId])

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_name || ''))
      .catch(() => setCountry('Non détecté'))
  }, [])

  // Créer une session au chargement de la page (si aucune session en cours)
  useEffect(() => {
    const initSession = async () => {
      // Récupérer l'IP et la hacher
      let ip = ''
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        ip = data.ip
      } catch { ip = 'unknown' }
      const ipHash = await sha256(ip)

      // Vérifier s'il existe déjà une session incomplète pour cette IP et ce candidat
      const { data: existing } = await supabase
        .from('vote_sessions')
        .select('id, social_checks, expires_at, is_complete')
        .eq('ip_hash', ipHash)
        .eq('candidate_id', candidateId)
        .eq('is_complete', false)
        .maybeSingle()

      if (existing) {
        // Reprendre la session existante
        setSessionId(existing.id)
        setExpiresAt(new Date(existing.expires_at))
        if (existing.social_checks) {
          setSocialChecks(existing.social_checks)
          setClickedLinks(existing.social_checks) // Pour préremplir les cases
        }
      } else {
        // Créer une nouvelle session
        const { data: newSession, error: insertError } = await supabase
          .from('vote_sessions')
          .insert({
            candidate_id: candidateId,
            ip_hash: ipHash,
            social_checks: {},
            is_complete: false,
          })
          .select('id, expires_at')
          .single()

        if (!insertError && newSession) {
          setSessionId(newSession.id)
          setExpiresAt(new Date(newSession.expires_at))
        } else {
          console.error("Erreur création session", insertError)
        }
      }
    }
    if (candidateId) initSession()
  }, [candidateId])

  const handleLinkClick = async (platform: string) => {
    if (!sessionId) return
    const newClicked = { ...clickedLinks, [platform]: true }
    setClickedLinks(newClicked)
    // Mettre à jour la session (on peut stocker les clics ou attendre les cases)
  }

  const handleCheck = async (platform: string, checked: boolean) => {
    if (!clickedLinks[platform]) return
    const newChecks = { ...socialChecks, [platform]: checked }
    setSocialChecks(newChecks)
    // Sauvegarder l'état dans la session
    if (sessionId) {
      await supabase
        .from('vote_sessions')
        .update({ social_checks: newChecks })
        .eq('id', sessionId)
    }
  }

  const allSocialChecked = Object.values(socialChecks).every(v => v === true)

  const handleConfirmVote = async () => {
    if (!sessionId) return
    setLoading(true)
    setError('')

    if (!allSocialChecked) {
      setError("Vous devez cocher toutes les cases.")
      setLoading(false)
      return
    }

    // Marquer la session comme complète
    const { error: updateError } = await supabase
      .from('vote_sessions')
      .update({ is_complete: true })
      .eq('id', sessionId)

    if (updateError) {
      setError("Erreur lors de la validation du vote.")
    } else {
      // Incrémenter le compteur du candidat
      await supabase.rpc('increment_vote_count', { candidate_id: candidateId })
      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    }
    setLoading(false)
  }

  // Vérifier si la session a expiré
  if (expiresAt && new Date() > expiresAt) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Votre session a expiré (30 min). Veuillez recharger la page pour recommencer.
        </div>
      </div>
    )
  }

  if (error && !candidate) return <div className="p-8 text-red-500">{error}</div>
  if (!candidate) return <div className="p-8">Chargement...</div>

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="bg-green-100 text-green-700 p-4 rounded-lg">
          Merci ! Votre vote pour {candidate.name} a été enregistré.
        </div>
        <p className="mt-4">Redirection vers l'accueil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-center">Votez pour {candidate.name}</h1>
      {candidate.country && <p className="text-gray-500 text-center mb-4">{candidate.country}</p>}
      {candidate.image_url && (
        <div className="flex justify-center mb-6">
          <img src={candidate.image_url} alt={candidate.name} className="max-w-full max-h-64 object-contain rounded-lg shadow" />
        </div>
      )}

      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-zinc-800 mb-4">
        <p className="font-medium mb-2">Pour voter, vous devez suivre nos pages :</p>
        <div className="space-y-2">
          {SOCIAL_LINKS.map((social) => (
            <div key={social.name} className="flex items-center justify-between gap-2">
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(social.name)}
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <social.icon className="text-xl" />
                {social.name}
              </a>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  disabled={!clickedLinks[social.name]}
                  checked={socialChecks[social.name]}
                  onChange={(e) => handleCheck(social.name, e.target.checked)}
                />
                Je suis abonné(e)
              </label>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleConfirmVote}
        disabled={loading || !allSocialChecked}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Traitement...' : 'Confirmer mon vote'}
      </button>
    </div>
  )
}