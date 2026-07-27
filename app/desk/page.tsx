'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/client'

type Category = {
  id: string
  name: string
  sort_order: number
  created_at: string
  item_count: number
}

type CategoryItem = {
  id: string
  teaching_number: number
  sort_order: number
  note: string | null
  created_at: string
  teachings: { title: string; date: string } | null
}

function DeskContent() {
  const searchParams = useSearchParams()
  const teachingParam = searchParams.get('teaching')
  const titleParam = searchParams.get('title')
  const teachingNumber = teachingParam ? parseInt(teachingParam, 10) : null
  const teachingTitle = titleParam || null

  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [items, setItems] = useState<CategoryItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setSignedIn(!!user)
      setReady(true)
      if (user) await loadCategories()
      else setLoading(false)
    }
    init()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Could not load shelves')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err: any) {
      setError(err.message || 'Could not load shelves')
    } finally {
      setLoading(false)
    }
  }

  const loadItems = async (id: string) => {
    setItemsLoading(true)
    try {
      const res = await fetch(`/api/categories/${id}`)
      if (!res.ok) throw new Error('Could not open shelf')
      const data = await res.json()
      setItems(data.items || [])
    } catch (err: any) {
      setError(err.message || 'Could not open shelf')
      setItems([])
    } finally {
      setItemsLoading(false)
    }
  }

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name || creating) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create')
      setNewName('')
      setCategories((prev) => [...prev, data.category])
    } catch (err: any) {
      setError(err.message || 'Could not create')
    } finally {
      setCreating(false)
    }
  }

  const handleOpen = async (id: string) => {
    if (openId === id) {
      setOpenId(null)
      setItems([])
      return
    }
    setOpenId(id)
    setRenameId(null)
    await loadItems(id)
  }

  const handleAdd = async (categoryId: string) => {
    if (!teachingNumber || !Number.isFinite(teachingNumber)) return
    setAddingId(categoryId)
    setError('')
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          teaching_number: teachingNumber,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not add')
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, item_count: c.item_count + 1 } : c
        )
      )
      if (openId === categoryId) await loadItems(categoryId)
    } catch (err: any) {
      setError(err.message || 'Could not add')
    } finally {
      setAddingId(null)
    }
  }

  const handleRemove = async (categoryId: string, teachingNum: number) => {
    setError('')
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          teaching_number: teachingNum,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not remove')
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, item_count: Math.max(0, c.item_count - 1) }
            : c
        )
      )
      setItems((prev) => prev.filter((i) => i.teaching_number !== teachingNum))
    } catch (err: any) {
      setError(err.message || 'Could not remove')
    }
  }

  const handleDeleteShelf = async (id: string) => {
    if (
      !window.confirm(
        'Remove this shelf? Teachings remain in your Special Collections list.'
      )
    )
      return
    setError('')
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not delete')
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (openId === id) {
        setOpenId(null)
        setItems([])
      }
    } catch (err: any) {
      setError(err.message || 'Could not delete')
    }
  }

  const handleRename = async (id: string) => {
    const name = renameValue.trim()
    if (!name) return
    setError('')
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not rename')
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: data.category.name } : c))
      )
      setRenameId(null)
      setRenameValue('')
    } catch (err: any) {
      setError(err.message || 'Could not rename')
    }
  }

  if (!ready) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-16 text-center text-[#6B5E54]">
        Opening the desk…
      </div>
    )
  }

  if (!signedIn) {
    return (
      <div className="max-w-lg mx-auto px-6 pt-16 text-center">
        <h1 className="text-2xl font-medium text-[#2C2522] mb-3">Your desk</h1>
        <p className="text-[#6B5E54] leading-relaxed mb-6">
          The desk is for those who have entered with a verified email. Open
          Special Collections on any page, or use Further up and further in, to
          receive a key.
        </p>
        <Link
          href="/"
          className="text-sm text-[#5C4A3A] hover:text-[#2C2522] underline underline-offset-2"
        >
          Return to the Main Room
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-10 pb-24">
      <h1 className="text-3xl font-medium text-[#2C2522] mb-2">Your desk</h1>
      <p className="text-[#6B5E54] text-[15px] leading-relaxed mb-8 max-w-xl">
        Private shelves you build as you read. A Teaching may rest on many
        shelves. This is your work surface — not the door.
      </p>

      {teachingNumber && Number.isFinite(teachingNumber) && (
        <div className="mb-8 rounded-sm border border-[#C9BEB0] bg-white/60 px-4 py-3">
          <div className="text-[12px] text-[#6B5E54] mb-0.5">
            From the Reading room
          </div>
          <div className="text-[#2C2522] font-medium">
            {teachingTitle || `Teaching ${teachingNumber}`}
          </div>
          <div className="text-[12px] text-[#6B5E54] mt-1">
            Use <span className="text-[#2C2522]">Add</span> on a shelf below to
            place it there.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value)
            setError('')
          }}
          placeholder="Name a new shelf — e.g. Evil Spirits"
          maxLength={80}
          className="flex-1 px-3 py-2 rounded-sm border border-[#C9BEB0] bg-white text-[#2C2522] text-sm focus:outline-none focus:border-[#8A7B65]"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newName.trim() || creating}
          className="px-4 py-2 rounded-sm bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create shelf'}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-[#6B5E54] text-sm">Loading shelves…</p>
      ) : categories.length === 0 ? (
        <p className="text-[#6B5E54] text-sm leading-relaxed">
          No shelves yet. Create one for a thread of thought — After Death, the
          Creator, or any name that fits how you read.
        </p>
      ) : (
        <ul className="space-y-3">
          {categories.map((c) => {
            const isOpen = openId === c.id
            return (
              <li
                key={c.id}
                className="border border-[#C9BEB0] rounded-sm bg-white/70 overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                  {renameId === c.id ? (
                    <>
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 min-w-[10rem] px-2 py-1 border border-[#C9BEB0] rounded-sm text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(c.id)}
                        className="text-sm text-[#2C2522]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRenameId(null)
                          setRenameValue('')
                        }}
                        className="text-sm text-[#6B5E54]"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpen(c.id)}
                        className="flex-1 text-left min-w-[8rem]"
                      >
                        <span className="font-medium text-[#2C2522]">
                          {c.name}
                        </span>
                        <span className="text-[#6B5E54] text-sm ml-2">
                          ({c.item_count})
                        </span>
                      </button>
                      {teachingNumber && Number.isFinite(teachingNumber) && (
                        <button
                          type="button"
                          onClick={() => handleAdd(c.id)}
                          disabled={addingId === c.id}
                          className="text-sm text-[#5C4A3A] hover:text-[#2C2522] disabled:opacity-50"
                        >
                          {addingId === c.id ? '…' : 'Add'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setRenameId(c.id)
                          setRenameValue(c.name)
                        }}
                        className="text-sm text-[#6B5E54] hover:text-[#2C2522]"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteShelf(c.id)}
                        className="text-sm text-[#6B5E54] hover:text-red-800"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
                {isOpen && (
                  <div className="border-t border-[#E5DFD3] px-4 py-3 bg-[#F7F4EF]/80">
                    {itemsLoading ? (
                      <p className="text-sm text-[#6B5E54]">Loading…</p>
                    ) : items.length === 0 ? (
                      <p className="text-sm text-[#6B5E54]">Empty shelf.</p>
                    ) : (
                      <ul className="space-y-2">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Link
                              href={`/teachings/${item.teaching_number}`}
                              className="flex-1 text-[#2C2522] hover:underline"
                            >
                              <span className="font-medium">
                                {item.teachings?.title ||
                                  `Teaching ${item.teaching_number}`}
                              </span>
                              {item.teachings?.date && (
                                <span className="text-[#6B5E54] ml-2 text-[12px]">
                                  {item.teachings.date}
                                </span>
                              )}
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemove(c.id, item.teaching_number)
                              }
                              className="text-[12px] text-[#6B5E54] hover:text-red-800 shrink-0"
                            >
                              remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function DeskPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="home" />
      <Suspense
        fallback={
          <div className="max-w-3xl mx-auto px-6 pt-16 text-center text-[#6B5E54]">
            Opening the desk…
          </div>
        }
      >
        <DeskContent />
      </Suspense>
    </main>
  )
}