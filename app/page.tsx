import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

export default async function Home() {
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('id, name, bio, image_url, country, votes_count')
    .eq('is_active', true)
    .order('votes_count', { ascending: false })

  if (error) {
    console.error(error)
    return <div className="p-8 text-red-500">Erreur : {error.message}</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Candidats en ligne</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates?.map((candidate) => (
          <div key={candidate.id} className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition">
    {candidate.image_url && (
  <div className="w-full bg-gray-100">
    <img
      src={candidate.image_url}
      alt={candidate.name}
      className="w-full h-auto block"
    />
  </div>
)}


            <div className="p-4">
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              {candidate.country && <p className="text-sm text-gray-500">{candidate.country}</p>}
              <p className="mt-2 text-gray-700 line-clamp-3">{candidate.bio}</p>
              <div className="mt-2 text-sm text-gray-400">
                🗳️ {candidate.votes_count || 0} vote(s)
              </div>
              <Link
                href={`/vote/${candidate.id}`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Voter pour ce candidat
              </Link>
            </div>
          </div>
        ))}
      </div>
      {(!candidates || candidates.length === 0) && (
        <p className="text-center text-gray-500">Aucun candidat disponible pour le moment.</p>
      )}
    </div>
  )
}
