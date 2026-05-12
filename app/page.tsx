'use client'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { getFlagUrl } from '@/lib/flagEmoji'
import { FaSearch, FaEnvelope, FaMobileAlt, FaCheckCircle, FaGift, FaExclamationTriangle, FaBullseye, FaStar } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export default function Home() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, bio, image_url, country, country_code, votes_count')
        .eq('is_active', true)
        .order('name')
      if (!error && data) setCandidates(data)
      setLoading(false)
    }
    fetchCandidates()
  }, [])

  if (loading) return <div className="p-8 text-center">Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Section héro - Présentation */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">AFRIQUE INNOVANTE</h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 mb-12">LA COMPÉTITION DE L'INNOVATION AFRICAINE AU FÉMININ</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-4xl font-black">300+</div>
              <div className="text-sm uppercase tracking-wide">Candidates</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-4xl font-black">100</div>
              <div className="text-sm uppercase tracking-wide">Sélectionnées</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-4xl font-black">5</div>
              <div className="text-sm uppercase tracking-wide">Gagnantes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-4xl font-black">3+</div>
              <div className="text-sm uppercase tracking-wide">Pays</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission et Vision */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-4xl mb-3 text-blue-600"><FaBullseye /></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Notre Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Afrique Innovante valorise les femmes entrepreneures et innovatrices du continent. 
            Sur 300 candidates issues de plusieurs pays, 100 femmes d'exception ont été sélectionnées. 
            Parmi elles, 5 gagnantes représenteront l'Afrique à l'international pour porter la voix de l'innovation africaine.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-4xl mb-3 text-yellow-500"><FaStar /></div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Notre Vision</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Nous croyons que l'avenir de l'Afrique se construit par ses femmes. 
            Afrique Innovante crée une plateforme d'excellence, de visibilité et de réseautage 
            pour les pionnières du continent — des femmes qui transforment leurs communautés, 
            créent des emplois, et repoussent les frontières de l'innovation.
          </p>
        </div>
      </div>

      {/* Comment voter */}
      <div className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">📌 COMMENT VOTER ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2 flex justify-center"><FaSearch /></div>
              <div className="text-xl font-semibold mb-1">Choisissez</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Parcourez les candidates, filtrez par pays ou recherchez par nom.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2 flex justify-center"><FaEnvelope /></div>
              <div className="text-xl font-semibold mb-1">Email</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Entrez votre adresse email valide. 1 vote par email uniquement.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2 flex justify-center"><FaMobileAlt /></div>
              <div className="text-xl font-semibold mb-1">Abonnez-vous</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Suivez les 4 pages officielles du concours sur les réseaux sociaux.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2 flex justify-center"><FaCheckCircle /></div>
              <div className="text-xl font-semibold mb-1">Votez !</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Confirmez votre vote. Il est comptabilisé en temps réel.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-5 py-2 rounded-full text-sm font-medium">
              <FaGift /> Les votes sont 100% gratuits — aucun paiement requis
            </div>
          </div>
          <div className="mt-6 text-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg text-sm max-w-2xl mx-auto flex items-center justify-center gap-2">
            <FaExclamationTriangle /> Important : Méfiez-vous de toute personne vous demandant de payer pour voter. Si cela arrive, signalez-le à l'organisateur.
          </div>
        </div>
      </div>

      {/* Liste des candidates */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">🏆 Candidates en lice</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Votez pour l’une des 100 femmes sélectionnées</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates?.map((candidate) => (
            <div key={candidate.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
              {candidate.image_url && (
                <div className="w-full bg-gray-100">
                  <img src={candidate.image_url} alt={candidate.name} className="w-full h-auto block" />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1">{candidate.name}</h2>
                  {candidate.country_code && <img src={getFlagUrl(candidate.country_code, 24)} alt={candidate.country_code} className="w-6 h-4 rounded-sm shadow-sm" />}
                </div>
                {candidate.country && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{candidate.country}</p>}
                <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">{candidate.bio}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <span className="text-lg">🗳️</span> {candidate.votes_count || 0} vote{candidate.votes_count !== 1 ? 's' : ''}
                  </div>
                </div>
                <Link href={`/vote/${candidate.id}`} className="mt-5 w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                  Voter pour ce candidat
                </Link>
              </div>
            </div>
          ))}
        </div>
        {candidates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun candidat disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}