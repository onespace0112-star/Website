'use client'

import React from 'react'

const socialItems = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61550584859367',
    bgClass: 'bg-[#1877F2]',
    shadowColor: 'hover:shadow-[0_0_18px_4px_rgba(24,119,242,0.55)]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M13.5 21v-8.1h2.7l.4-3.1h-3.1V7.8c0-.9.2-1.6 1.5-1.6h1.7V3.4c-.8-.1-1.6-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.2v2.4H7.5v3.1h2.7V21h3.3Z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@onespace192?_r=1&_t=ZT-94fdegamH7N',
    bgClass: 'bg-gradient-to-br from-[#25F4EE] via-[#FE2C55] to-[#000000]',
    shadowColor: 'hover:shadow-[0_0_18px_4px_rgba(255,255,255,0.2)]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M14.6 4c.6 1.7 1.8 2.8 3.4 3.2v2.7c-1.4 0-2.6-.4-3.8-1.2v5.5c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5c.2 0 .4 0 .6.1v2.9c-.2-.1-.4-.1-.6-.1-1.2 0-2.1.9-2.1 2.1s.9 2.1 2.1 2.1c1.2 0 2.1-.9 2.1-2.1V4h3.3Z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/designer_linna?igsh=YjcydmFldDdrZnBv',
    bgClass: 'bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    shadowColor: 'hover:shadow-[0_0_18px_4px_rgba(238,42,123,0.55)]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.9A2.9 2.9 0 0 0 4.9 7.8v8.4a2.9 2.9 0 0 0 2.9 2.9h8.4a2.9 2.9 0 0 0 2.9-2.9V7.8a2.9 2.9 0 0 0-2.9-2.9H7.8Zm8.8 1.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 8a4 4 0 1 1 0 8.1A4 4 0 0 1 12 8Zm0 1.9a2.1 2.1 0 1 0 0 4.3 2.1 2.1 0 0 0 0-4.3Z" />
      </svg>
    ),
  },
]

type SocialLoginButtonsProps = {
  className?: string
}

export default function SocialLoginButtons({ className = '' }: SocialLoginButtonsProps) {
  return (
    <div className={`flex justify-center items-center gap-4 ${className}`}>
      {socialItems.map((item) => (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${item.name}`}
          title={item.name}
          className={`
            w-12 h-12 rounded-full text-white cursor-pointer
            flex items-center justify-center
            transition-all duration-300 ease-out
            hover:scale-115 hover:brightness-110
            shadow-lg ${item.shadowColor}
            ring-1 ring-white/10 hover:ring-white/30
            ${item.bgClass}
          `}
        >
          {item.icon}
        </a>
      ))}
    </div>
  )
}


