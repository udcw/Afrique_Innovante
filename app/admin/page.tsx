'use client'

import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [votes, setVotes] = useState<any[]>([])
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
    const { data: votesData } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })
    const { data: candidatesData } = await supabase
      .from('candidates')
      .select('*')
      .order('name')
    setVotes(votesData || [])
    setCandidates(candidatesData || [])
    setLoading(false)
  }

  const handleDeleteVote = async (voteId: string) => {
    if (confirm('Supprimer ce vote définitivement ?')) {
      await supabase.from('votes').delete().eq('id', voteId)
      await loadData()
    }
  }

  const handleDeleteCandidate = async (candidateId: string) => {
    if (confirm('Supprimer ce candidat et tous ses votes associés ?')) {
      await supabase.from('candidates').delete().eq('id', candidateId)
      await loadData()
    }
  }

  const getCandidateName = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    return candidate ? candidate.name : 'Inconnu'
  }

  if (loading) return <div className="p-8">Chargement...</div>

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Administration - Votes</h1>
      
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-3">Liste des votes ({votes.length})</h2>
        {votes.length === 0 ? (
          <p className="text-gray-500">Aucun vote pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Candidat</th>
                  <th className="p-2 border">Email votant</th>
                  <th className="p-2 border">Pays</th>
                  <th className="p-2 border">IP</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote) => (
                  <tr key={vote.id}>
                    <td className="p-2 border">{getCandidateName(vote.candidate_id)}</td>
                    <td className="p-2 border">{vote.voter_email}</td>
                    <td className="p-2 border">{vote.voter_country || 'N/A'}</td>
                    <td className="p-2 border">{vote.ip_address}</td>
                    <td className="p-2 border">{new Date(vote.created_at).toLocaleString()}</td>
                    <td className="p-2 border">
                      <button onClick={() => handleDeleteVote(vote.id)} className="text-red-600 hover:underline">
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

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Candidats</h2>
          <button onClick={() => router.push('/admin/candidates/new')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Nouveau candidat
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <div key={c.id} className="border p-4 rounded flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{c.name}</h3>
                {c.country && <p className="text-sm text-gray-600">{c.country}</p>}
                {c.bio && <p className="text-sm line-clamp-2 mt-1">{c.bio}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  Votes reçus : {c.votes_count || 0} | Actif : {c.is_active ? 'Oui' : 'Non'}
                </p>
              </div>
              <div className="space-x-2">
                <button onClick={() => router.push(`/admin/candidates/${c.id}`)} className="text-blue-600 text-sm">
                  Modifier
                </button>
                <button onClick={() => handleDeleteCandidate(c.id)} className="text-red-600 text-sm">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}