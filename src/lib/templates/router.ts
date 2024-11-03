import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Framework-agnostic route configuration
export interface Route {
  path: string
  component: React.ComponentType<any>
  layout?: React.ComponentType<any>
  meta?: {
    auth?: boolean
    roles?: string[]
    title?: string
  }
}

export function createRouter(routes: Route[]) {
  const router = createBrowserRouter(
    routes.map(route => ({
      path: route.path,
      element: route.layout ? (
        <route.layout>
          <route.component />
        </route.layout>
      ) : (
        <route.component />
      ),
    }))
  )

  return <RouterProvider router={router} />
}