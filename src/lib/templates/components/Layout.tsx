import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'
import { useStore } from '../store'

interface LayoutProps {
  children: React.ReactNode
  sidebar?: boolean
}

export function Layout({ children, sidebar = false }: LayoutProps) {
  const theme = useStore((state) => state.theme)

  return (
    <div className={theme}>
      <Header />
      <div className="flex min-h-screen">
        {sidebar && <Sidebar />}
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}