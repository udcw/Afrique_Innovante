'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function NewCandidate() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [bio, setBio] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  const generateSlug = () => {
    const newSlug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    setSlug(newSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setUploading(false)

    let imageUrl: string | null = null

    // Upload image si présente
    if (imageFile) {
      setUploading(true)
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${slug || name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('candidates')
        .upload(fileName, imageFile)

      if (uploadError) {
        alert("Erreur upload : " + uploadError.message)
        setLoading(false)
        setUploading(false)
        return
      }
      // Récupérer l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('candidates')
        .getPublicUrl(fileName)
      imageUrl = publicUrlData.publicUrl
      setUploading(false)
    }

    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-')

    const { error } = await supabase
      .from('candidates')
      .insert({
        name,
        slug: finalSlug,
        country,
        country_code: countryCode,
        bio,
        image_url: imageUrl,
        is_active: true,
        votes_count: 0,
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
          <label className="block font-medium">Photo du candidat</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            {imagePreview ? (
              <img src={imagePreview} alt="Aperçu" className="max-h-40 mx-auto rounded" />
            ) : (
              <p>Glissez une image ici ou cliquez pour sélectionner</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {uploading ? 'Upload en cours...' : loading ? 'Création...' : 'Créer le candidat'}
        </button>
      </form>
    </div>
  )
}