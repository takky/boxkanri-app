import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { data, error } = await signUp(email, password)

    if (error) {
      setError(error.message)
    } else if (data.session) {
      // メール確認なしで即ログインできた場合
      navigate('/')
    } else {
      // メール確認が必要な場合
      setMessage('確認メールを送信しました。メール内のリンクをクリックしてから、ログインしてください。')
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>会員登録</h1>
        {error && <div className="message-error">{error}</div>}
        {message && <div className="message-success">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>パスワード（6文字以上）</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="パスワードを入力"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? '登録中...' : '会員登録'}
          </button>
        </form>
        <div className="auth-link">
          アカウントをお持ちの方は <Link to="/login">ログイン</Link>
        </div>
      </div>
    </div>
  )
}
