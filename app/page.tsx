import AppTable from '@/components/AppTable'
import { createBrowserClient } from '@/lib/supabase'
import type { AppRecord } from '@/lib/types'

export const revalidate = 3600 // 1時間ごとにISR再生成

async function fetchApps(): Promise<AppRecord[]> {
  const supabase = createBrowserClient()

  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('app_snapshots')
    .select(`
      track_id,
      user_rating_count,
      average_user_rating,
      user_rating_count_for_current_version,
      average_user_rating_for_current_version,
      price,
      formatted_price,
      version,
      current_version_release_date,
      release_notes,
      captured_at,
      apps (
        track_id, bundle_id, track_name, track_censored_name, track_view_url,
        description, release_date, artist_id, artist_name, seller_name, seller_url,
        artist_view_url, currency, is_vpp_device_based_licensing_enabled,
        primary_genre_id, primary_genre_name, genres, genre_ids,
        artwork_url_60, artwork_url_100, artwork_url_512,
        screenshot_urls, ipad_screenshot_urls, appletv_screenshot_urls,
        minimum_os_version, file_size_bytes, supported_devices, features,
        language_codes_iso2a, is_game_center_enabled,
        content_advisory_rating, track_content_rating, advisories, kind, wrapper_type
      )
    `)
    .eq('captured_at', today)
    .order('user_rating_count', { ascending: false })

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return []

  // 14日前の総レビュー数を取得して増加数を計算
  const trackIds = data.map((r) => r.track_id)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const from = fourteenDaysAgo.toISOString().slice(0, 10)

  const { data: old } = await supabase
    .from('app_snapshots')
    .select('track_id, user_rating_count, captured_at')
    .in('track_id', trackIds)
    .gte('captured_at', from)
    .lt('captured_at', today)
    .order('captured_at', { ascending: true })

  const oldestMap = new Map<number, number>()
  for (const row of old ?? []) {
    if (!oldestMap.has(row.track_id)) {
      oldestMap.set(row.track_id, row.user_rating_count)
    }
  }

  return data.map((row) => {
    const app = Array.isArray(row.apps) ? row.apps[0] : row.apps
    const oldest = oldestMap.get(row.track_id) ?? row.user_rating_count
    const recentReviewIncrease = row.user_rating_count - oldest

    return {
      trackId: app.track_id,
      bundleId: app.bundle_id,
      trackName: app.track_name,
      trackCensoredName: app.track_censored_name,
      trackViewUrl: app.track_view_url,
      description: app.description,
      releaseNotes: row.release_notes,
      version: row.version,
      kind: app.kind,
      wrapperType: app.wrapper_type,
      artistId: app.artist_id,
      artistName: app.artist_name,
      sellerName: app.seller_name,
      sellerUrl: app.seller_url,
      artistViewUrl: app.artist_view_url,
      price: row.price,
      formattedPrice: row.formatted_price,
      currency: app.currency,
      isVppDeviceBasedLicensingEnabled: app.is_vpp_device_based_licensing_enabled,
      userRatingCount: row.user_rating_count,
      averageUserRating: row.average_user_rating,
      userRatingCountForCurrentVersion: row.user_rating_count_for_current_version,
      averageUserRatingForCurrentVersion: row.average_user_rating_for_current_version,
      primaryGenreId: app.primary_genre_id,
      primaryGenreName: app.primary_genre_name,
      genres: app.genres,
      genreIds: app.genre_ids,
      artworkUrl60: app.artwork_url_60,
      artworkUrl100: app.artwork_url_100,
      artworkUrl512: app.artwork_url_512,
      screenshotUrls: app.screenshot_urls,
      ipadScreenshotUrls: app.ipad_screenshot_urls,
      appletvScreenshotUrls: app.appletv_screenshot_urls,
      releaseDate: app.release_date,
      currentVersionReleaseDate: row.current_version_release_date,
      minimumOsVersion: app.minimum_os_version,
      fileSizeBytes: app.file_size_bytes,
      supportedDevices: app.supported_devices,
      features: app.features,
      languageCodesISO2A: app.language_codes_iso2a,
      isGameCenterEnabled: app.is_game_center_enabled,
      contentAdvisoryRating: app.content_advisory_rating,
      trackContentRating: app.track_content_rating,
      advisories: app.advisories,
      recentReviewIncrease,
    } satisfies AppRecord
  })
}

export default async function Page() {
  const apps = await fetchApps()

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">アプリ市場リサーチ</h1>
        <p className="text-gray-500 mt-1">
          カテゴリ：仕事効率化 &nbsp;·&nbsp; 有料アプリのみ &nbsp;·&nbsp; {apps.length} 件
        </p>
      </div>
      <AppTable apps={apps} />
    </main>
  )
}
