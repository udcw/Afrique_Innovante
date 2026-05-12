'use client'

import { useState, useEffect } from 'react'
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa'

const SOCIAL_LINKS = [
  { name: 'Instagram', url: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM!, icon: FaInstagram },
  { name: 'Facebook', url: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK!, icon: FaFacebook },
  { name: 'TikTok', url: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK!, icon: FaTiktok },
  { name: 'YouTube', url: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE!, icon: FaYoutube },
]

export default function SocialLinks() {
  const [visible, setVisible] = useState(false)
  const delay = parseInt(process.env.NEXT_PUBLIC_SOCIAL_DELAY_SECONDS || '5', 10) * 1000

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-3 flex gap-4 z-50">
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl hover:opacity-80 transition"
          aria-label={social.name}
        >
          <social.icon />
        </a>
      ))}
    </div>
  )
}