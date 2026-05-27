import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

const CATEGORIES = ['本', '雑誌', '資料', 'CD', 'DVD']

export default function BoxDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // 箱情報
  const [box, setBox] = useState(null)
  const [editName, setEditName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [isEditingBox, setIsEditingBox] = useState(false)
  const [boxSaving, setBoxSaving] = useState(false)

  // 物品リスト
  const [items, setItems] = useState([])

  // 物品追加フォーム
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState(CATEGORIES[0])
  const [addingItem, setAddingItem] = useState(false)

  // 物品インライン編集
  const [editingItemId, setEditingItemId] = useState(null)
  const [editItemName, setEditItemName] = useState('')
  const [editItemCategory, setEditItemCategory] = useState(CATEGORIES[0])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBox()
    fetchItems()
  }, [id])

  async function fetchBox() {
    const { data, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      navigate('/')
      return
    }
    setBox(data)
    setEditName(data.name)
    setEditLocation(data.location)
    setLoading(false)
  }

  async function fetchItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('box_id', id)
      .order('created_at', { ascending: true })

    if (!error) setItems(data)
  }

  // 箱情報を保存
  async function handleSaveBox() {
    if (!editName.trim() || !editLocation.trim()) return
    setBoxSaving(true)
    setError('')

    const { data, error } = await supabase
      .from('boxes')
      .update({ name: editName.trim(), location: editLocation.trim() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      setError(error.message)
    } else {
      setBox(data)
      setIsEditingBox(false)
    }
    setBoxSaving(false)
  }

  // 箱を削除（物品が0件のときのみ実行可能）
  async function handleDeleteBox() {
    if (items.length > 0) return
    if (!window.confirm(`「${box.name}」を削除しますか？`)) return

    const { error } = await supabase.from('boxes').delete().eq('id', id)
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
  }

  // 物品を追加
  async function handleAddItem(e) {
    e.preventDefault()
    setAddingItem(true)
    setError('')

    const { data, error } = await supabase
      .from('items')
      .insert({ box_id: id, name: newItemName.trim(), category: newItemCategory })
      .select('*')
      .single()

    if (error) {
      setError(error.message)
    } else {
      setItems(prev => [...prev, data])
      setNewItemName('')
      setNewItemCategory(CATEGORIES[0])
      setShowAddForm(false)
    }
    setAddingItem(false)
  }

  // 物品の編集開始
  function startEditItem(item) {
    setEditingItemId(item.id)
    setEditItemName(item.name)
    setEditItemCategory(item.category)
  }

  // 物品を保存
  async function handleSaveItem(itemId) {
    if (!editItemName.trim()) return
    setError('')

    const { data, error } = await supabase
      .from('items')
      .update({ name: editItemName.trim(), category: editItemCategory })
      .eq('id', itemId)
      .select('*')
      .single()

    if (error) {
      setError(error.message)
    } else {
      setItems(prev => prev.map(i => (i.id === itemId ? data : i)))
      setEditingItemId(null)
    }
  }

  // 物品を削除
  async function handleDeleteItem(itemId) {
    if (!window.confirm('この物品を削除しますか？')) return
    setError('')

    const { error } = await supabase.from('items').delete().eq('id', itemId)
    if (error) {
      setError(error.message)
    } else {
      setItems(prev => prev.filter(i => i.id !== itemId))
    }
  }

  function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) return <div className="loading">読み込み中...</div>

  return (
    <div className="container">
      <Link
        to={`/location/${encodeURIComponent(box.location)}`}
        className="back-link"
      >
        ← {box.location}
      </Link>

      {error && <div className="message-error">{error}</div>}

      {/* 箱の情報カード */}
      <div className="detail-card">
        <div className="detail-card-header">
          <h2>箱の情報</h2>
          {!isEditingBox && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsEditingBox(true)}
            >
              編集
            </button>
          )}
        </div>

        {isEditingBox ? (
          <div>
            <div className="form-group">
              <label>箱の名前</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>管理場所</label>
              <input
                type="text"
                value={editLocation}
                onChange={e => setEditLocation(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveBox}
                disabled={boxSaving}
              >
                {boxSaving ? '保存中...' : '保存'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIsEditingBox(false)
                  setEditName(box.name)
                  setEditLocation(box.location)
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="detail-box-name">{box.name}</p>
            <p className="detail-box-location">{box.location}</p>
          </div>
        )}

        <div className="detail-dates">
          <span>登録日: {formatDateTime(box.created_at)}</span>
          {/* updated_at は UPDATE トリガーで自動更新される */}
          {box.updated_at !== box.created_at && (
            <span>更新日時: {formatDateTime(box.updated_at)}</span>
          )}
        </div>
      </div>

      {/* 物品セクション */}
      <div className="items-section">
        <div className="items-section-header">
          <h2>物品リスト（{items.length} 件）</h2>
          {!showAddForm && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddForm(true)}
            >
              + 物品を追加
            </button>
          )}
        </div>

        {/* 物品追加フォーム */}
        {showAddForm && (
          <div className="add-item-form">
            <h3>新しい物品を追加</h3>
            <form onSubmit={handleAddItem}>
              <div className="form-row">
                <div className="form-group">
                  <label>物品名 *</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    required
                    placeholder="例: JavaScript入門"
                    autoFocus
                  />
                </div>
                <div className="form-group" style={{ flex: '0 0 150px' }}>
                  <label>カテゴリ</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={addingItem}
                >
                  {addingItem ? '追加中...' : '追加'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewItemName('')
                    setNewItemCategory(CATEGORIES[0])
                  }}
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 物品テーブル */}
        {items.length === 0 && !showAddForm ? (
          <div className="empty-state">
            <p>物品が登録されていません</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              物品を追加する
            </button>
          </div>
        ) : items.length > 0 ? (
          <table className="items-table">
            <thead>
              <tr>
                <th>物品名</th>
                <th>カテゴリ</th>
                <th>登録日</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  {editingItemId === item.id ? (
                    // インライン編集モード
                    <>
                      <td>
                        <input
                          className="inline-input"
                          type="text"
                          value={editItemName}
                          onChange={e => setEditItemName(e.target.value)}
                        />
                      </td>
                      <td>
                        <select
                          className="inline-select"
                          value={editItemCategory}
                          onChange={e => setEditItemCategory(e.target.value)}
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        {new Date(item.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSaveItem(item.id)}
                          >
                            保存
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingItemId(null)}
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // 通常表示モード
                    <>
                      <td>{item.name}</td>
                      <td><span className="badge">{item.category}</span></td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        {new Date(item.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => startEditItem(item)}
                          >
                            編集
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {/* 箱の削除（物品が0件のときのみ有効） */}
      <div className="danger-zone">
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDeleteBox}
          disabled={items.length > 0}
          title={items.length > 0 ? '物品が0件のときのみ削除できます' : ''}
        >
          この箱を削除する
        </button>
        {items.length > 0 && (
          <p className="danger-zone-note">
            ※ 物品をすべて削除してから、箱を削除できます
          </p>
        )}
      </div>
    </div>
  )
}
