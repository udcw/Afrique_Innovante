'use client'

import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function EditCandidate() {
  const { id } = useParams()
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
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
        setImagePreview(data.image_url || null)
        setIsActive(data.is_active)
      }
      setLoading(false)
    }
    fetchCandidate()
  }, [id, router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    let finalImageUrl = imageUrl

    // Si un nouveau fichier image a été sélectionné, on l'upload
    if (imageFile) {
      setUploading(true)
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${slug || name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('candidates')
        .upload(fileName, imageFile)

      if (uploadError) {
        alert("Erreur upload : " + uploadError.message)
        setSubmitting(false)
        setUploading(false)
        return
      }
      const { data: publicUrlData } = supabase.storage
        .from('candidates')
        .getPublicUrl(fileName)
      finalImageUrl = publicUrlData.publicUrl
      setUploading(false)
    }

    const { error } = await supabase
      .from('candidates')
      .update({
        name,
        slug,
        country,
        country_code: countryCode,
        bio,
        image_url: finalImageUrl,
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
          <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium">Slug</label>
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium">Pays</label>
          <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium">Code pays (2 lettres)</label>
          <input type="text" value={countryCode} onChange={e => setCountryCode(e.target.value.toUpperCase())} className="w-full border rounded px-3 py-2" maxLength={2} />
        </div>
        <div>
          <label className="block font-medium">Biographie</label>
          <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium">Photo actuelle</label>
          {imagePreview && <img src={imagePreview} alt="Aperçu" className="max-h-40 mb-2 rounded" />}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <p>Glissez une nouvelle image ou cliquez pour remplacer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4" />
          <label htmlFor="isActive">Candidat actif (visible pour les votes)</label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={submitting || uploading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {uploading ? 'Upload...' : submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={() => router.push('/admin')} className="bg-gray-400 text-white px-4 py-2 rounded">
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}