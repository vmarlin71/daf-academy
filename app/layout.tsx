import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'DAF Academy',
  description: 'Parcours progressif pour apprendre les compétences d’un DAF.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'DAF Academy' }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body><AppShell>{children}</AppShell></body>
    </html>
  )
}
