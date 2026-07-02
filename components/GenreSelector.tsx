'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { GENRES, DEFAULT_GENRE_ID } from '@/lib/genres'

export default function GenreSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('genre') ?? String(DEFAULT_GENRE_ID)

  return (
    <select
      value={current}
      onChange={(e) => router.push(`/?genre=${e.target.value}`)}
      className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {GENRES.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  )
}
