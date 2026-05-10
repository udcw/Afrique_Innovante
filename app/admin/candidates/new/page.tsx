'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewCandidate() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // Générer un slug à partir du nom
  const generateSlug = () => {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    setSlug(slug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('candidates').insert({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      country,
      country_code: countryCode,
      bio,
      image_url: imageUrl,
      is_active: true,
      votes_count: 0
    })
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      router.push('/admin')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ajouter un candidat</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Nom *</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => { setName(e.target.value); generateSlug() }}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Slug (identifiant URL)</label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500">Laissez vide pour génération automatique</p>
        </div>
        <div>
          <label className="block font-medium">Pays</label>
          <input
            type="text"
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Code pays (2 lettres)</label>
          <input
            type="text"
            value={countryCode}
            onChange={e => setCountryCode(e.target.value.toUpperCase())}
            className="w-full border rounded px-3 py-2"
            maxLength={2}
          />
        </div>
        <div>
          <label className="block font-medium">Biographie</label>
          <textarea
            rows={4}
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">URL de l'image</label>
          <input
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Création...' : 'Créer le candidat'}
        </button>
      </form>
    </div>
  )
}