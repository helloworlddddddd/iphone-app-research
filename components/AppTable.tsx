'use client'

import { useState } from 'react'
import type { AppRecord, SortKey, SortDir } from '@/lib/types'

type Props = { apps: AppRecord[] }

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'userRatingCount', label: '総レビュー数' },
  { key: 'recentReviewIncrease', label: '直近14日増加' },
  { key: 'price', label: '価格' },
  { key: 'averageUserRating', label: '評価' },
]

export default function AppTable({ apps }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('userRatingCount')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...apps].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey]
    return sortDir === 'desc' ? -diff : diff
  })

  const arrow = (key: SortKey) => {
    if (sortKey !== key) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-500 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-12">ランク</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">アプリ名</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">開発者</th>
            {SORT_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
                onClick={() => handleSort(key)}
              >
                {label}
                {arrow(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((app, i) => (
            <tr key={app.trackId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-400 text-sm font-medium">{i + 1}</td>
              <td className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <img
                    src={app.artworkUrl100}
                    alt=""
                    className="w-10 h-10 rounded-xl flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{app.trackName}</div>
                    <div className="text-xs text-gray-400 mt-0.5 max-w-xs line-clamp-2">{app.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">{app.sellerName}</td>
              <td className="px-4 py-3 text-right font-medium">{app.userRatingCount.toLocaleString()}</td>
              <td className="px-4 py-3 text-right">
                <span className="text-green-600 font-medium">+{app.recentReviewIncrease.toLocaleString()}</span>
              </td>
              <td className="px-4 py-3 text-right">{app.formattedPrice}</td>
              <td className="px-4 py-3 text-right">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{app.averageUserRating.toFixed(1)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
