import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const env = import.meta.env.VITE_APP_ENV || 'development'
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      {token && <Link to="/dashboard">Dashboard</Link>}
      <span className="env-badge">{env.toUpperCase()}</span>
      {token ? (
        <button className="nav-button" onClick={handleLogout}>
          Logout{user ? ` (${user.name})` : ''}
        </button>
      ) : (
        <Link to="/login" className="nav-button-link">Login</Link>
      )}
    </nav>
  )
}
