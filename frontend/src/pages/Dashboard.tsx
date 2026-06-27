import { useEffect, useState } from 'react'
import api from '../services/api'
import PostGrid from '../components/PostGrid'
import { useAuth } from '../context/AuthContext'

interface Post {
  id: number
  title: string
  excerpt: string
  author: string
  tag: string
  date: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  const fetchPosts = async () => {
    setStatus('loading')
    try {
      const res = await api.get('/posts')
      setPosts(res.data.data)
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-greeting">
            Welcome back{user ? `, ${user.name}` : ''}.
          </p>
        </div>
        <button onClick={fetchPosts}>Refresh</button>
      </div>

      {status === 'loading' && <p className="empty-state">Loading posts…</p>}
      {status === 'error' && (
        <p className="empty-state error">Couldn't load posts. Is the backend running?</p>
      )}
      {status === 'ok' && <PostGrid posts={posts} />}
    </div>
  )
}
