import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">
        {process.env.NEXT_PUBLIC_APP_NAME}
      </Link>
      <div className="space-x-4">
        <Link href="/" className="hover:underline">Candidats</Link>
        <Link href="/admin" className="hover:underline">Admin</Link>
      </div>
    </nav>
  )
}