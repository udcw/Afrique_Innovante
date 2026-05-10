'use client'

import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EditCandidate() {
  const { id } = useParams()
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchCandidate = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        alert('Candidat introuvable')
        router.push('/admin')
      } else if (data) {
        setName(data.name)
        setSlug(data.slug)
        setCountry(data.country || '')
        setCountryCode(data.country_code || '')
        setBio(data.bio || '')
        setImageUrl(data.image_url || '')
        setIsActive(data.is_active)
      }
      setLoading(false)
    }
    fetchCandidate()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase
      .from('candidates')
      .update({
        name,
        slug,
        country,
        country_code: countryCode,
        bio,
        image_url: imageUrl,
        is_active: isActive,
        updated_at: new Date()
      })
      .eq('id', id)
    if (error) {
      alert("Erreur : " + error.message)
    } else {
      router.push('/admin')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Modifier {name}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Nom</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
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
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="isActive">Candidat actif (visible pour les votes)</label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}