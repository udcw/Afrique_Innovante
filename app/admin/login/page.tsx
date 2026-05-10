'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Authentification via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    // 2. Vérifier que l'utilisateur a un email
    const userEmail = authData.user?.email
    if (!userEmail) {
      await supabase.auth.signOut()
      setError("Impossible de récupérer votre email")
      setLoading(false)
      return
    }

    // 3. Vérifier que l'email est dans admin_users (insensible à la casse)
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .ilike('email', userEmail)
      .single()

    if (adminError || !admin || admin.role !== 'admin') {
      await supabase.auth.signOut()
      setError("Vous n'êtes pas autorisé comme administrateur")
      setLoading(false)
      return
    }

    // Succès : redirection vers le dashboard
    router.push('/admin')
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-4">Connexion admin</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}