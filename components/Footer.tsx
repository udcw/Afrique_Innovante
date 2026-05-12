'use client'

import { FaShieldAlt, FaMobileAlt, FaGlobe, FaHeart, FaEnvelope, FaWhatsapp } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      {/* Bandeau promotionnel (votre pub) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-6 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
            <FaMobileAlt /> <FaShieldAlt /> <FaGlobe />
          </p>
          <p className="text-sm md:text-base opacity-90">
            Développement d’applications <strong>web sécurisées</strong> & <strong>mobiles</strong> – 
            Next.js, React Native, Supabase, architecture robuste et haute performance.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            <a
              href="mailto:fokoufossojordan@gmail.com"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2 rounded-full font-medium text-sm hover:bg-gray-100 transition"
            >
              <FaEnvelope /> fokoufossojordan@gmail.com
            </a>
            <a
              href="https://wa.me/237671628735"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-full font-medium text-sm hover:bg-green-600 transition"
            >
              <FaWhatsapp /> +237 671 628 735
            </a>
          </div>
        </div>
      </div>

      {/* Contenu classique du footer */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <FaGlobe className="text-blue-400" /> Afrique Innovante
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Plateforme de vote dédiée à l'innovation africaine au féminin. 
            Développée avec Next.js, Tailwind CSS et Supabase.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <FaShieldAlt className="text-green-400" /> Sécurité & Performance
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>✔️ Vote unique par email (hashé SHA256)</li>
            <li>✔️ Protection contre les doublons d'IP</li>
            <li>✔️ Sessions chiffrées avec Supabase RLS</li>
            <li>✔️ Hébergement Vercel ultra-rapide</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <FaMobileAlt className="text-yellow-400" /> Mobile & Web
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Applications responsives (mobile, tablette, desktop). 
            Également disponible en application mobile React Native (iOS/Android) sur demande.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-gray-400 text-xs">
            <span className="bg-gray-800 px-2 py-1 rounded">Next.js</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Supabase</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Tailwind</span>
            <span className="bg-gray-800 px-2 py-1 rounded">Vercel</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-gray-500 text-xs">
        <p>&copy; {new Date().getFullYear()} Afrique Innovante – Tous droits réservés.</p>
        <p className="mt-1">
          Conçu & développé par <strong>Jordan Fokou Fosso</strong> – 
          solutions sécurisées, mobiles et scalables.
        </p>
      </div>
    </footer>
  )
}