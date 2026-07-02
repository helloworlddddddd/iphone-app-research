'use client'

import { useState } from 'react'
import type { AppRecord, SortKey, SortDir } from '@/lib/types'

type Props = { apps: AppRecord[] }

const SORT_COLUMNS: { key: SortKey; label: string; defaultDir: SortDir }[] = [
  { key: 'userRatingCount', label: '総レビュー数', defaultDir: 'desc' },
  { key: 'recentReviewIncrease', label: '直近14日増加', defaultDir: 'desc' },
  { key: 'price', label: '価格', defaultDir: 'desc' },
  { key: 'averageUserRating', label: '評価', defaultDir: 'desc' },
]

function toNum(v: string | number | null | undefined): number {
  if (v == null) return Infinity
  if (typeof v === 'string') return new Date(v).getTime() || Infinity
  return v
}

function downloadJson(apps: AppRecord[], sortKey: SortKey, sortDir: SortDir) {
  const sorted = [...apps].sort((a, b) => {
    const diff = toNum(a[sortKey]) - toNum(b[sortKey])
    return sortDir === 'desc' ? -diff : diff
  })
  const data = sorted.map((app) => ({
    rankingPosition: app.rankingPosition,
    trackName: app.trackName,
    sellerName: app.sellerName,
    description: app.description,
    price: app.price,
    formattedPrice: app.formattedPrice,
    userRatingCount: app.userRatingCount,
    averageUserRating: app.averageUserRating,
    userRatingCountForCurrentVersion: app.userRatingCountForCurrentVersion,
    averageUserRatingForCurrentVersion: app.averageUserRatingForCurrentVersion,
    recentReviewIncrease: app.recentReviewIncrease,
    releaseDate: app.releaseDate,
    currentVersionReleaseDate: app.currentVersionReleaseDate,
  }))
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `app-research-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AppTable({ apps }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('rankingPosition')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey, defaultDir: SortDir = 'desc') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir(defaultDir)
    }
  }

  const sorted = [...apps].sort((a, b) => {
    const diff = toNum(a[sortKey]) - toNum(b[sortKey])
    return sortDir === 'desc' ? -diff : diff
  })

  const arrow = (key: SortKey) => {
    if (sortKey !== key) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-500 ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => downloadJson(apps, sortKey, sortDir)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          JSONダウンロード
        </button>
      </div>
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th
              className="px-4 py-3 text-left font-medium text-gray-600 w-12 cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
              onClick={() => handleSort('rankingPosition', 'asc')}
            >
              ランク{arrow('rankingPosition')}
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">アプリ名</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">開発者</th>
            <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">現Verレビュー数</th>
            {SORT_COLUMNS.map(({ key, label, defaultDir }) => (
              <th
                key={key}
                className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
                onClick={() => handleSort(key, defaultDir)}
              >
                {label}
                {arrow(key)}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">現Ver評価</th>
            <th
              className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
              onClick={() => handleSort('releaseDate', 'desc')}
            >
              初回リリース{arrow('releaseDate')}
            </th>
            <th
              className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
              onClick={() => handleSort('currentVersionReleaseDate', 'desc')}
            >
              現Ver更新日{arrow('currentVersionReleaseDate')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((app) => (
            <tr key={app.trackId} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-4 py-3 text-gray-400 text-sm font-medium">{app.rankingPosition ?? '-'}</td>
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
              <td className="px-4 py-3 text-right text-gray-500">{app.userRatingCountForCurrentVersion?.toLocaleString() ?? '-'}</td>
              <td className="px-4 py-3 text-right">
                <span className="text-green-600 font-medium">+{app.recentReviewIncrease.toLocaleString()}</span>
              </td>
              <td className="px-4 py-3 text-right">{app.formattedPrice}</td>
              <td className="px-4 py-3 text-right">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{app.averageUserRating.toFixed(1)}</span>
              </td>
              <td className="px-4 py-3 text-right text-gray-500">
                {app.averageUserRatingForCurrentVersion != null ? (
                  <><span className="text-yellow-500">★</span><span className="ml-1">{app.averageUserRatingForCurrentVersion.toFixed(1)}</span></>
                ) : '-'}
              </td>
              <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">{app.releaseDate ? app.releaseDate.slice(0, 10) : '-'}</td>
              <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">{app.currentVersionReleaseDate ? app.currentVersionReleaseDate.slice(0, 10) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )
}
