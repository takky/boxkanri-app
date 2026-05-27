import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

export default function LocationDetailPage() {
  const { location } = useParams()
  const decodedLocation = decodeURIComponent(location)
  const [boxes, setBoxes] = useState([])
  const [loading, setLoading] = useState(true)

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
              <Link key={box.id} to={`/boxes/${box.id}`} className="box-item">
                <div>
                  <div className="box-item-name">{box.name}</div>
                  <div className="box-item-meta">
                    物品 {box.items?.length ?? 0} 件 ・ 登録日: {formatDate(box.created_at)}
                  </div>
                </div>
                <span className="box-item-arrow">›</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
