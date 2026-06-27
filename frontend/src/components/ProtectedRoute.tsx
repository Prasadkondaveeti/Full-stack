import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth()

  if (loading) {
    return <div className="container">Loading…</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
