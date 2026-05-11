'use client'

import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function VotePage() {
  const { candidateId } = useParams()
  const router = useRouter()
  const [candidate, setCandidate] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchCandidate = async () => {
      // Ajout de image_url dans la sélection
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

  // Détection du pays à partir de l'IP
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_name || ''))
      .catch(() => setCountry('Non détecté'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email.trim()) {
      setError("L'email est requis")
      setLoading(false)
      return
    }

    // Récupération de l'IP publique
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

    // Vérification : un seul vote par email (tous candidats confondus)
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_email_hash', emailHash)
      .maybeSingle()

    if (existingVote) {
      setError("Vous avez déjà voté. Un seul vote par email est autorisé.")
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
        social_checks: {}
      })

    if (insertError) {
      console.error(insertError)
      if (insertError.message.includes('duplicate key') || insertError.code === '23505') {
        if (insertError.message.includes('ip')) {
          setError("Cette adresse IP a déjà voté. Si vous êtes plusieurs à la même connexion, contactez l'administrateur.")
        } else if (insertError.message.includes('email')) {
          setError("Vous avez déjà voté avec cet email.")
        } else {
          setError("Vous avez déjà participé au vote. Un seul vote par personne est autorisé.")
        }
      } else {
        setError("Erreur : " + insertError.message)
      }
    } else {
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

      {/* Afficher la photo du candidat si elle existe */}
      {candidate.image_url && (
  <div className="flex justify-center mb-6">
    <img
      src={candidate.image_url}
      alt={candidate.name}
      className="max-w-full max-h-64 object-contain rounded-lg shadow"
    />
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Traitement...' : 'Confirmer mon vote'}
        </button>
      </form>
    </div>
  )
}