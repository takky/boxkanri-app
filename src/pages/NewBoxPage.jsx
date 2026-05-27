import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

export default function NewBoxPage() {
  const [searchParams] = useSearchParams()
  // 管理場所一覧から遷移した場合は location クエリパラメータを初期値に設定
  const defaultLocation = searchParams.get('location') || ''

  const [name, setName] = useState('')
  const [location, setLocation] = useState(defaultLocation)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase
      .from('boxes')
      .insert({
        name: name.trim(),
        location: location.trim(),
        user_id: user.id,
      })
      .select('id')
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // 登録後は箱の詳細ページへ遷移
    navigate(`/boxes/${data.id}`)
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← 管理場所一覧</Link>

      <div className="page-header">
        <h1>新しい箱を登録</h1>
      </div>

      {error && <div className="message-error">{error}</div>}

      <div style={{ maxWidth: 480 }}>
        <div className="detail-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>箱の名前 *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="例: 段ボールA"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>管理場所 *</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                placeholder="例: ○○倉庫 2F"
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '登録中...' : '登録する'}
              </button>
              <Link to="/" className="btn btn-secondary">キャンセル</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
