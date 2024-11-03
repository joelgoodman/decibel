import { type Template, type TemplateConfig } from '../types'
import { generateApiClient } from './shared/api'
import { generateRouter } from './shared/router'
import { generateStore } from './shared/store'

export async function generateReactTemplate(config: TemplateConfig): Promise<Template> {
  const files = [
    // Core setup
    {
      path: 'src/App.tsx',
      content: generateAppComponent(config),
      type: 'component' as const,
    },
    {
      path: 'src/main.tsx',
      content: generateMainComponent(config),
      type: 'component' as const,
    },
    // API integration
    {
      path: 'src/api/client.ts',
      content: generateApiClient(config),
      type: 'util' as const,
    },
    // Routing
    {
      path: 'src/router.tsx',
      content: generateRouter(config),
      type: 'util' as const,
    },
    // State management
    {
      path: 'src/store.ts',
      content: generateStore(config),
      type: 'util' as const,
    },
    // Styling
    {
      path: generateStylePath(config),
      content: generateStyles(config),
      type: 'style' as const,
    },
  ]

  // Add feature-specific files
  if (config.features.includes('authentication')) {
    files.push(...generateAuthFiles())
  }
  if (config.features.includes('blog')) {
    files.push(...generateBlogFiles())
  }
  if (config.features.includes('podcast')) {
    files.push(...generatePodcastFiles())
  }

  return {
    id: Date.now().toString(),
    config,
    files,
  }
}

function generateAppComponent(config: TemplateConfig): string {
  return `import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from './providers/theme'
${config.styling === 'tailwind' ? "import './styles/tailwind.css'" : "import './styles/main.css'"}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}`
}

function generateMainComponent(config: TemplateConfig): string {
  return `import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)`
}

function generateStylePath(config: TemplateConfig): string {
  switch (config.styling) {
    case 'scss':
      return 'src/styles/main.scss'
    case 'tailwind':
      return 'src/styles/tailwind.css'
    default:
      return 'src/styles/main.css'
  }
}

function generateStyles(config: TemplateConfig): string {
  switch (config.styling) {
    case 'tailwind':
      return `@tailwind base;
@tailwind components;
@tailwind utilities;`
    case 'scss':
      return `// Variables
$primary-color: #2563eb;
$secondary-color: #4f46e5;

// Base styles
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

// Layout
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}`
    default:
      return `:root {
  --primary-color: #2563eb;
  --secondary-color: #4f46e5;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}`
  }
}

function generateAuthFiles(): Template['files'] {
  return [
    {
      path: 'src/features/auth/AuthProvider.tsx',
      content: `import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/api/client'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.auth.getUser()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}`,
      type: 'component',
    },
    {
      path: 'src/features/auth/LoginPage.tsx',
      content: `import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.auth.login({ email })
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <button type="submit">Sign In</button>
    </form>
  )
}`,
      type: 'component',
    },
  ]
}

function generateBlogFiles(): Template['files'] {
  return [
    {
      path: 'src/features/blog/PostList.tsx',
      content: `import { useEffect, useState } from 'react'
import { api } from '@/api/client'

export function PostList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.posts.list()
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="post-grid">
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}`,
      type: 'component',
    },
  ]
}

function generatePodcastFiles(): Template['files'] {
  return [
    {
      path: 'src/features/podcast/PodcastPlayer.tsx',
      content: `import { useState, useRef } from 'react'

export function PodcastPlayer({ episode }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (playing) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setPlaying(!playing)
  }

  return (
    <div className="podcast-player">
      <audio
        ref={audioRef}
        src={episode.audioUrl}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button onClick={togglePlay}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  )
}`,
      type: 'component',
    },
  ]
}