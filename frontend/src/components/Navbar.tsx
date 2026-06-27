import { Link } from 'react-router-dom'

export default function Navbar() {
  const env = import.meta.env.VITE_APP_ENV || 'development'
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <span className="env-badge">{env.toUpperCase()}</span>
    </nav>
  )
}
