import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { Providers } from './app/providers'
import { ErrorBoundary } from './app/error-boundary'

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  )
}
