const LOOKUP_URL = 'https://itunes.apple.com/lookup'
const BATCH_SIZE = 100
const RATE_LIMIT_MS = 1500

export type ItunesApp = {
  trackId: number
  bundleId?: string
  trackName: string
  trackCensoredName?: string
  trackViewUrl?: string
  description?: string
  releaseNotes?: string
  version?: string
  kind?: string
  wrapperType?: string
  artistId?: number
  artistName?: string
  sellerName?: string
  sellerUrl?: string
  artistViewUrl?: string
  price: number
  formattedPrice?: string
  currency?: string
  isVppDeviceBasedLicensingEnabled?: boolean
  userRatingCount?: number
  averageUserRating?: number
  userRatingCountForCurrentVersion?: number
  averageUserRatingForCurrentVersion?: number
  primaryGenreId?: number
  primaryGenreName?: string
  genres?: string[]
  genreIds?: string[]
  artworkUrl60?: string
  artworkUrl100?: string
  artworkUrl512?: string
  screenshotUrls?: string[]
  ipadScreenshotUrls?: string[]
  appletvScreenshotUrls?: string[]
  releaseDate?: string
  currentVersionReleaseDate?: string
  minimumOsVersion?: string
  fileSizeBytes?: string
  supportedDevices?: string[]
  features?: string[]
  languageCodesISO2A?: string[]
  isGameCenterEnabled?: boolean
  contentAdvisoryRating?: string
  trackContentRating?: string
  advisories?: string[]
}

type LookupResponse = {
  resultCount: number
  results: ItunesApp[]
}

export async function batchLookup(trackIds: number[]): Promise<ItunesApp[]> {
  const results: ItunesApp[] = []

  for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
    const chunk = trackIds.slice(i, i + BATCH_SIZE)
    const url = `${LOOKUP_URL}?id=${chunk.join(',')}&country=jp&entity=software`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`iTunes lookup failed: ${res.status}`)
    const data: LookupResponse = await res.json()
    results.push(...data.results)

    if (i + BATCH_SIZE < trackIds.length) {
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS))
    }
  }

  return results
}
