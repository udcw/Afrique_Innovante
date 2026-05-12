'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [votes, setVotes] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.email) {
        router.push('/admin/login')
        return
      }
      const { data: admin } = await supabase
        .from('admin_users')
        .select('role')
        .ilike('email', user.email)
        .single()
      if (!admin) {
        await supabase.auth.signOut()
        router.push('/admin/login')
        return
      }
      await loadData()
    }
    checkAdmin()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    // Votes existants (ancienne table)
    const { data: votesData } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })
    // Nouvelles sessions de vote
    const { data: sessionsData } = await supabase
      .from('vote_sessions')
      .select('*, candidates(id, name)')
      .order('created_at', { ascending: false })
    // Candidats
    const { data: candidatesData } = await supabase
      .from('candidates')
      .select('*')
      .order('name')
    setVotes(votesData || [])
    setSessions(sessionsData || [])
    setCandidates(candidatesData || [])
    setLoading(false)
  }

  const handleDeleteVote = async (voteId: string) => {
    if (confirm('Supprimer ce vote définitivement ?')) {
      await supabase.from('votes').delete().eq('id', voteId)
      await loadData()
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Supprimer cette session de vote ?')) {
      await supabase.from('vote_sessions').delete().eq('id', sessionId)
      await loadData()
    }
  }

  const handleDeleteCandidate = async (candidateId: string) => {
    if (confirm('Supprimer ce candidat et tous ses votes/sessions associés ?')) {
      await supabase.from('candidates').delete().eq('id', candidateId)
      await loadData()
    }
  }

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    return candidate ? candidate.name : 'Inconnu'
  }

  if (loading) return <div className="flex justify-center items-center h-64">Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-6 text-center shadow-lg">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">⚙️ Administration</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-90">Gérez les votes, sessions et candidats</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Section des sessions de vote (nouvelles) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              🕒 Sessions de vote (vote_sessions)
              <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                {sessions.length}
              </span>
            </h2>
          </div>
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center text-gray-500 dark:text-gray-400">
              Aucune session pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold">Candidat</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold">IP hash</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold">Réseaux validés</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold">Terminée ?</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold">Expiration</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold">Création</th>
                    <th className="py-3 px-4 text-center text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-4">{s.candidates?.name || getCandidateName(s.candidate_id)}</td>
                      <td className="py-2 px-4 font-mono text-xs">{s.ip_hash?.substring(0, 20)}…</td>
                      <td className="py-2 px-4">
                        {s.social_checks ? Object.entries(s.social_checks).filter(([,v]) => v).map(([k]) => k).join(', ') || '-' : '-'}
                      </td>
                      <td className="py-2 px-4">{s.is_complete ? '✅ Oui' : '❌ Non'}</td>
                      <td className="py-2 px-4 text-sm">{new Date(s.expires_at).toLocaleString()}</td>
                      <td className="py-2 px-4 text-sm">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="py-2 px-4 text-center">
                        <button onClick={() => handleDeleteSession(s.id)} className="text-red-600 hover:underline text-sm">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section des votes classiques (ancienne table votes) - identique à avant */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              📋 Votes enregistrés (votes)
              <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                {votes.length}
              </span>
            </h2>
          </div>
          {votes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center text-gray-500 dark:text-gray-400">
              Aucun vote pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full bg-white dark:bg-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Candidat</th>
                    <th className="py-3 px-4 text-left">Email votant</th>
                    <th className="py-3 px-4 text-left">Pays</th>
                    <th className="py-3 px-4 text-left">IP</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((vote) => (
                    <tr key={vote.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-2 px-4">{getCandidateName(vote.candidate_id)}</td>
                      <td className="py-2 px-4">{vote.voter_email}</td>
                      <td className="py-2 px-4">{vote.voter_country || 'N/A'}</td>
                      <td className="py-2 px-4">{vote.ip_address}</td>
                      <td className="py-2 px-4 text-sm">{new Date(vote.created_at).toLocaleString()}</td>
                      <td className="py-2 px-4 text-center">
                        <button onClick={() => handleDeleteVote(vote.id)} className="text-red-600 hover:underline text-sm">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section candidats avec images (inchangée, mais améliorée) */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              👥 Candidats
              <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{candidates.length}</span>
            </h2>
            <button onClick={() => router.push('/admin/candidates/new')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-5 rounded-xl shadow-md transition-all transform hover:scale-105">
              + Nouveau candidat
            </button>
          </div>
          <div className="space-y-4">
            {candidates.map((c) => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 flex items-start gap-4">
                <div className="flex-shrink-0">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl">📷</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap justify-between gap-2">
                    <h3 className="font-bold text-xl">{c.name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/admin/candidates/${c.id}`)} className="text-blue-600 hover:underline text-sm">Modifier</button>
                      <button onClick={() => handleDeleteCandidate(c.id)} className="text-red-600 hover:underline text-sm">Supprimer</button>
                    </div>
                  </div>
                  {c.country && <p className="text-sm text-gray-500 mt-1">{c.country}</p>}
                  {c.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.bio}</p>}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">🗳️ {c.votes_count || 0} vote(s)</span>
                    <span className={`px-2 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {c.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}