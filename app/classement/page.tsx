'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { getFlagUrl } from '@/lib/flagEmoji'

interface Candidate {
  id: string
  name: string
  votes_count: number
  image_url: string | null
  country: string
  country_code: string
}

export default function Classement() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, votes_count, image_url, country, country_code')
        .eq('is_active', true)
        .order('votes_count', { ascending: false })

      if (!error && data) setCandidates(data)
      setLoading(false)
    }

    fetchCandidates()

    const subscription = supabase
      .channel('candidates_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'candidates' }, (payload) => {
        const updated = payload.new as Candidate
        setCandidates((prev) => {
          const index = prev.findIndex(c => c.id === updated.id)
          if (index !== -1) {
            const newList = [...prev]
            newList[index] = updated
            newList.sort((a, b) => b.votes_count - a.votes_count)
            return newList
          }
          return prev
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  if (loading) return <div className="text-center p-8">Chargement du classement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* En-tête du classement */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6 text-center shadow-lg">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">🏆 Classement des candidats</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Découvrez les scores en temps réel
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-4">
          {candidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4 p-4 sm:p-5">
                {/* Position */}
                <div className="flex-shrink-0 w-12 text-center">
                  <span className={`text-2xl font-black ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-400' : 
                    index === 2 ? 'text-amber-600' : 
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Image du candidat - Taille augmentée */}
                <div className="flex-shrink-0">
                  {candidate.image_url ? (
                    <img
                      src={candidate.image_url}
                      alt={candidate.name}
                      className="w-20 h-20 rounded-full object-cover border-3 border-blue-500 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl">
                      📷
                    </div>
                  )}
                </div>

                {/* Infos candidat */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                      {candidate.name}
                    </h3>
                    {candidate.country_code && (
                      <img
                        src={getFlagUrl(candidate.country_code, 20)}
                        alt={candidate.country_code}
                        className="w-5 h-3.5 rounded-sm shadow-sm"
                      />
                    )}
                  </div>
                  {candidate.country && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {candidate.country}
                    </p>
                  )}
                </div>

                {/* Votes */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {candidate.votes_count}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    vote{candidate.votes_count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun candidat pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}