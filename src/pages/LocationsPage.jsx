import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = ['本', '雑誌', '資料', 'CD', 'DVD']

export default function LocationsPage() {
  const [locations, setLocations] = useState([])
  const [categoryStats, setCategoryStats] = useState({})
  const [loading, setLoading] = useState(true)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    // 管理場所集計と物品カテゴリ集計を並列取得する
    const [boxesRes, itemsRes] = await Promise.all([
      supabase.from('boxes').select('location'),
      supabase.from('items').select('category'),
    ])

    if (boxesRes.error) {
      console.error(boxesRes.error)
      setLoading(false)
      return
    }

    // 管理場所ごとの箱数を集計する
    const countMap = {}
    boxesRes.data.forEach(({ location }) => {
      countMap[location] = (countMap[location] || 0) + 1
    })
    const sorted = Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
    setLocations(sorted)

    // カテゴリごとの物品数を集計する
    if (!itemsRes.error) {
      const stats = {}
      CATEGORIES.forEach(c => { stats[c] = 0 })
      itemsRes.data.forEach(({ category }) => {
        if (stats[category] !== undefined) stats[category]++
      })
      setCategoryStats(stats)
    }

    setLoading(false)
  }

  // 箱が0件の管理場所を削除する
  // location は DB の実体ではなく boxes.location から導出されるため、UI 状態から除去するだけでよい
  function handleDeleteLocation(locationName) {
    if (!window.confirm(`「${locationName}」を削除しますか？`)) return
    setLocations(prev => prev.filter(loc => loc.name !== locationName))
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  if (loading) return <div className="loading">読み込み中...</div>

  return (
    <div className="container">
      <div className="page-header">
        <h1>ボックス管理システム</h1>
        <div className="header-actions">
          <Link to="/boxes/new" className="btn btn-primary btn-sm">
            + 新しい箱を登録
          </Link>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">
            ログアウト
          </button>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="empty-state">
          <p>まだ箱が登録されていません</p>
          <Link to="/boxes/new" className="btn btn-primary">
            最初の箱を登録する
          </Link>
        </div>
      ) : (
        <>
          <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '0.85rem' }}>
            管理場所 {locations.length} 件
          </p>
          <div className="card-grid">
            {locations.map(({ name, count }) => (
              <div key={name} className="card" style={{ cursor: 'default' }}>
                {/* 場所名・箱数クリックで詳細へ */}
                <Link
                  to={`/location/${encodeURIComponent(name)}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}
                >
                  <p className="card-title">{name}</p>
                  <p className="card-count">{count}</p>
                  <p className="card-label">箱</p>
                </Link>
                {/* 箱が0件のときのみ削除ボタンを表示 */}
                {count === 0 && (
                  <button
                    className="btn btn-danger btn-sm btn-full"
                    style={{ marginTop: '14px' }}
                    onClick={() => handleDeleteLocation(name)}
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 物品統計セクション */}
          <div className="stats-section">
            <h2 className="stats-title">物品統計</h2>
            <div className="stats-grid">
              {CATEGORIES.map(category => (
                <div key={category} className="stats-card">
                  <p className="stats-category">{category}</p>
                  <p className="stats-count">{categoryStats[category] ?? 0}</p>
                  <p className="stats-label">件</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
