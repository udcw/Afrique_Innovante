'use client'

import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
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
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showSocial, setShowSocial] = useState(false)
  const [clickedLinks, setClickedLinks] = useState<{ [key: string]: boolean }>({
    Instagram: false,
    Facebook: false,
    TikTok: false,
    YouTube: false,
  })
  const [socialChecks, setSocialChecks] = useState<{ [key: string]: boolean }>({
    Instagram: false,
    Facebook: false,
    TikTok: false,
    YouTube: false,
  })

  const delaySeconds = parseInt(process.env.NEXT_PUBLIC_SOCIAL_DELAY_SECONDS || '5', 10)

  // Chargement du candidat
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

  // Détection du pays
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_name || ''))
      .catch(() => setCountry('Non détecté'))
  }, [])

  // Affichage différé des réseaux sociaux
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSocial(true)
    }, delaySeconds * 1000)
    return () => clearTimeout(timer)
  }, [delaySeconds])

  const handleLinkClick = (platform: string) => {
    setClickedLinks(prev => ({ ...prev, [platform]: true }))
  }

  const handleCheck = (platform: string, checked: boolean) => {
    if (!clickedLinks[platform]) return
    setSocialChecks(prev => ({ ...prev, [platform]: checked }))
  }

  const allSocialChecked = Object.values(socialChecks).every(v => v === true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Vérifications de base
    if (!email.trim()) {
      setError("L'email est requis")
      setLoading(false)
      return
    }
    if (!allSocialChecked) {
      setError("Vous devez cliquer sur tous les liens et cocher toutes les cases.")
      setLoading(false)
      return
    }

    // Récupération de l'IP et hashage
    let ip = ''
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      ip = data.ip
    } catch {
      ip = 'unknown'
    }

    const emailHash = await sha256(email.trim().toLowerCase())
    const ipHash = await sha256(ip)

    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = uuidv4()
      localStorage.setItem('device_id', deviceId)
    }

    // Vérification : email déjà utilisé (tous candidats)
    const { data: existingEmail } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_email_hash', emailHash)
      .maybeSingle()

    if (existingEmail) {
      setError("Vous avez déjà voté. Un seul vote par email est autorisé.")
      setLoading(false)
      return
    }

    // Vérification : IP déjà utilisée (tous candidats)
    const { data: existingIp } = await supabase
      .from('votes')
      .select('id')
      .eq('ip_hash', ipHash)
      .maybeSingle()

    if (existingIp) {
      setError("Cette adresse IP a déjà voté. Un seul vote par connexion est autorisé.")
      setLoading(false)
      return
    }

    // Insertion du vote
    const { error: insertError } = await supabase
      .from('votes')
      .insert({
        candidate_id: candidateId,
        voter_email: email,
        voter_email_hash: emailHash,
        voter_country: country,
        ip_address: ip,
        ip_hash: ipHash,
        device_id: deviceId,
        social_checks: socialChecks,
      })

    if (insertError) {
      console.error(insertError)
      setError("Erreur : " + insertError.message)
    } else {
      // Incrémentation du compteur (optionnel)
      try {
        await supabase.rpc('increment_vote_count', { candidate_id: candidateId })
      } catch (err) {
        console.warn("Incrémentation échouée:", err)
      }
      setSuccess(true)
      setTimeout(() => router.push('/'), 3000)
    }
    setLoading(false)
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="votre@email.com"
          />
        </div>
        <div>
          <label className="block font-medium">Pays</label>
          <input type="text" value={country} disabled className="w-full border rounded px-3 py-2 bg-gray-100" />
        </div>

        {!showSocial ? (
          <div className="text-center py-4 text-gray-500 animate-pulse">
            Chargez les réseaux sociaux... ({delaySeconds} secondes)
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-zinc-800">
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
            {(!clickedLinks.Instagram || !clickedLinks.Facebook || !clickedLinks.TikTok || !clickedLinks.YouTube) && (
              <p className="text-gray-500 text-xs mt-2">* Cliquez sur chaque lien, puis cochez la case correspondante.</p>
            )}
            {!allSocialChecked && showSocial && clickedLinks.Instagram && clickedLinks.Facebook && clickedLinks.TikTok && clickedLinks.YouTube && (
              <p className="text-red-500 text-xs mt-2">Cochez toutes les cases pour voter.</p>
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !showSocial || !allSocialChecked}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Traitement...' : 'Confirmer mon vote'}
        </button>
      </form>
    </div>
  )
}