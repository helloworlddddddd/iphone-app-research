import AppTable from '@/components/AppTable'
import mockApps from '@/data/mock_apps.json'
import type { AppRecord } from '@/lib/types'

export default function Page() {
  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">アプリ市場リサーチ</h1>
        <p className="text-gray-500 mt-1">
          カテゴリ：仕事効率化 &nbsp;·&nbsp; 有料アプリのみ &nbsp;·&nbsp; {mockApps.length} 件
        </p>
      </div>
      <AppTable apps={mockApps as AppRecord[]} />
    </main>
  )
}
