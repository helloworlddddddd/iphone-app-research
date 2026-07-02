import { config } from 'dotenv'
config({ path: '.env.local' })
import { fetchRankingIds } from '../lib/rss'
import { batchLookup, type ItunesApp } from '../lib/itunes'
import { createServiceClient } from '../lib/supabase'
import { GENRES } from '../lib/genres'

const ARCHIVE_DAYS = 14

function toDbRow(app: ItunesApp) {
  return {
    track_id:                                   app.trackId,
    bundle_id:                                  app.bundleId ?? null,
    track_name:                                 app.trackName,
    track_censored_name:                        app.trackCensoredName ?? null,
    track_view_url:                             app.trackViewUrl ?? null,
    description:                                app.description ?? null,
    release_notes:                              app.releaseNotes ?? null,
    version:                                    app.version ?? null,
    kind:                                       app.kind ?? null,
    wrapper_type:                               app.wrapperType ?? null,
    artist_id:                                  app.artistId ?? null,
    artist_name:                                app.artistName ?? null,
    seller_name:                                app.sellerName ?? null,
    seller_url:                                 app.sellerUrl ?? null,
    artist_view_url:                            app.artistViewUrl ?? null,
    price:                                      app.price,
    formatted_price:                            app.formattedPrice ?? null,
    currency:                                   app.currency ?? null,
    is_vpp_device_based_licensing_enabled:      app.isVppDeviceBasedLicensingEnabled ?? null,
    user_rating_count:                          app.userRatingCount ?? null,
    average_user_rating:                        app.averageUserRating ?? null,
    user_rating_count_for_current_version:      app.userRatingCountForCurrentVersion ?? null,
    average_user_rating_for_current_version:    app.averageUserRatingForCurrentVersion ?? null,
    primary_genre_id:                           app.primaryGenreId ?? null,
    primary_genre_name:                         app.primaryGenreName ?? null,
    genres:                                     app.genres ?? null,
    genre_ids:                                  app.genreIds ?? null,
    artwork_url_60:                             app.artworkUrl60 ?? null,
    artwork_url_100:                            app.artworkUrl100 ?? null,
    artwork_url_512:                            app.artworkUrl512 ?? null,
    screenshot_urls:                            app.screenshotUrls ?? null,
    ipad_screenshot_urls:                       app.ipadScreenshotUrls ?? null,
    appletv_screenshot_urls:                    app.appletvScreenshotUrls ?? null,
    release_date:                               app.releaseDate ?? null,
    current_version_release_date:               app.currentVersionReleaseDate ?? null,
    minimum_os_version:                         app.minimumOsVersion ?? null,
    file_size_bytes:                            app.fileSizeBytes ?? null,
    supported_devices:                          app.supportedDevices ?? null,
    features:                                   app.features ?? null,
    language_codes_iso2a:                       app.languageCodesISO2A ?? null,
    is_game_center_enabled:                     app.isGameCenterEnabled ?? null,
    content_advisory_rating:                    app.contentAdvisoryRating ?? null,
    track_content_rating:                       app.trackContentRating ?? null,
    advisories:                                 app.advisories ?? null,
    updated_at:                                 new Date().toISOString(),
  }
}

function toSnapshotRow(app: ItunesApp, capturedAt: string, genreId: number, rankingPosition: number) {
  return {
    track_id:                                   app.trackId,
    captured_at:                                capturedAt,
    genre_id:                                   genreId,
    ranking_position:                           rankingPosition,
    user_rating_count:                          app.userRatingCount ?? null,
    average_user_rating:                        app.averageUserRating ?? null,
    user_rating_count_for_current_version:      app.userRatingCountForCurrentVersion ?? null,
    average_user_rating_for_current_version:    app.averageUserRatingForCurrentVersion ?? null,
    price:                                      app.price,
    formatted_price:                            app.formattedPrice ?? null,
    version:                                    app.version ?? null,
    current_version_release_date:               app.currentVersionReleaseDate ?? null,
    release_notes:                              app.releaseNotes ?? null,
  }
}

async function archiveOldSnapshots(supabase: ReturnType<typeof createServiceClient>) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - ARCHIVE_DAYS)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const { data: old, error: fetchErr } = await supabase
    .from('app_snapshots')
    .select('*')
    .lt('captured_at', cutoffStr)

  if (fetchErr) throw fetchErr
  if (!old || old.length === 0) return

  const { error: insertErr } = await supabase.from('app_snapshots_archive').insert(old)
  if (insertErr) throw insertErr

  const { error: deleteErr } = await supabase
    .from('app_snapshots')
    .delete()
    .lt('captured_at', cutoffStr)
  if (deleteErr) throw deleteErr

  console.log(`アーカイブ済み: ${old.length} 件 (${cutoffStr} より前)`)
}

async function processGenre(
  supabase: ReturnType<typeof createServiceClient>,
  genre: { id: number; name: string },
  today: string
) {
  console.log(`\n[${genre.name} (${genre.id})]`)

  const trackIds = await fetchRankingIds(genre.id)
  console.log(`  RSS: ${trackIds.length} 件`)

  // RSSの返却順がランキング順位
  const rankMap = new Map(trackIds.map((id, i) => [id, i + 1]))

  const apps = await batchLookup(trackIds)
  const paidApps = apps.filter((a) => a.price > 0)
  console.log(`  iTunes: ${apps.length} 件 / 有料: ${paidApps.length} 件`)

  if (paidApps.length === 0) return

  const { error: upsertErr } = await supabase
    .from('apps')
    .upsert(paidApps.map(toDbRow), { onConflict: 'track_id' })
  if (upsertErr) throw upsertErr

  const { error: snapErr } = await supabase
    .from('app_snapshots')
    .upsert(paidApps.map((a) => toSnapshotRow(a, today, genre.id, rankMap.get(a.trackId) ?? 0)), {
      onConflict: 'track_id,captured_at,genre_id',
    })
  if (snapErr) throw snapErr

  console.log(`  保存完了: ${paidApps.length} 件`)
}

async function main() {
  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  console.log(`バッチ開始: ${today}`)
  console.log(`対象カテゴリ: ${GENRES.length} 件`)

  for (const genre of GENRES) {
    await processGenre(supabase, genre, today)
  }

  console.log('\nアーカイブ処理...')
  await archiveOldSnapshots(supabase)

  console.log('\nバッチ完了')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
