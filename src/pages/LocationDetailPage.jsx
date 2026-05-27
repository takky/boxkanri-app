import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export default function LocationDetailPage() {
  const { location } = useParams()
  const decodedLocation = decodeURIComponent(location)
  const [boxes, setBoxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBoxes()
  }, [decodedLocation])

  async function fetchBoxes() {
    // items(id) で物品IDリストを取得し、件数は .length で算出する
    const { data, error } = await supabase
      .from('boxes')
      .select('id, name, location, created_at, updated_at, items(id)')
      .eq('location', decodedLocation)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }
    setBoxes(data)
    setLoading(false)
  }

  // 箱を削除する（物品が残っている場合はアラートを出して中断）
  async function handleDeleteBox(box) {
    if (box.items?.length > 0) {
      window.alert(`「${box.name}」には物品が ${box.items.length} 件あります。\n物品をすべて削除してから、箱を削除してください。`)
      return
    }
    if (!window.confirm(`「${box.name}」を削除しますか？`)) return

    const { error } = await supabase.from('boxes').delete().eq('id', box.id)
    if (error) {
      setError(error.message)
    } else {
      setBoxes(prev => prev.filter(b => b.id !== box.id))
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) return <div className="loading">読み込み中...</div>

  return (
    <div className="container">
      <Link to="/" className="back-link">← 管理場所一覧</Link>

      <div className="page-header">
        <h1>{decodedLocation}</h1>
        <Link
          to={`/boxes/new?location=${encodeURIComponent(decodedLocation)}`}
          className="btn btn-primary btn-sm"
        >
          + この場所に箱を登録
        </Link>
      </div>

      {error && <div className="message-error">{error}</div>}

      {boxes.length === 0 ? (
        <div className="empty-state">
          <p>この場所に箱がありません</p>
        </div>
      ) : (
        <>
          <p style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '0.85rem' }}>
            {boxes.length} 箱
          </p>
          <div className="box-list">
            {boxes.map(box => (
              <div key={box.id} className="box-item">
                {/* 箱名・メタ情報クリックで詳細へ */}
                <Link
                  to={`/boxes/${box.id}`}
                  style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="box-item-name">{box.name}</div>
                  <div className="box-item-meta">
                    物品 {box.items?.length ?? 0} 件 ・ 登録日: {formatDate(box.created_at)}
                  </div>
                </Link>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="box-item-arrow">›</span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteBox(box)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
