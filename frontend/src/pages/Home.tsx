import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const checkHealth = async () => {
    try {
      const res = await api.get('/health')
      setMessage(res.data.message)
      setStatus('ok')
    } catch {
      setMessage('Backend unreachable')
      setStatus('error')
    }
  }

  useEffect(() => { checkHealth() }, [])

  return (
    <div className="container">
      <h1>Welcome to MyApp</h1>
      <p>Environment: <strong>{import.meta.env.VITE_APP_ENV}</strong></p>
      <div className="card">
        <h2>Backend Health Check</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          API URL: {import.meta.env.VITE_API_URL}
        </p>
        {status !== 'idle' && (
          <span className={`status ${status}`}>{message}</span>
        )}
        <br />
        <button onClick={checkHealth}>Re-check</button>
      </div>
    </div>
  )
}
