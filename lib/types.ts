export type AppRecord = {
  // アプリ基本情報
  trackId: number
  bundleId: string
  trackName: string
  trackCensoredName: string
  trackViewUrl: string
  description: string
  releaseNotes: string
  version: string
  kind: string
  wrapperType: string

  // 開発者情報
  artistId: number
  artistName: string
  sellerName: string
  sellerUrl: string
  artistViewUrl: string

  // 価格・課金情報
  price: number
  formattedPrice: string
  currency: string
  isVppDeviceBasedLicensingEnabled: boolean

  // 評価・レビュー
  userRatingCount: number
  averageUserRating: number
  userRatingCountForCurrentVersion: number
  averageUserRatingForCurrentVersion: number

  // カテゴリ・ジャンル
  primaryGenreId: number
  primaryGenreName: string
  genres: string[]
  genreIds: string[]

  // 画像・スクリーンショット
  artworkUrl60: string
  artworkUrl100: string
  artworkUrl512: string
  screenshotUrls: string[]
  ipadScreenshotUrls: string[]
  appletvScreenshotUrls: string[]

  // リリース・更新日時
  releaseDate: string
  currentVersionReleaseDate: string

  // 技術・動作要件
  minimumOsVersion: string
  fileSizeBytes: string
  supportedDevices: string[]
  features: string[]
  languageCodesISO2A: string[]
  isGameCenterEnabled: boolean

  // 年齢制限・コンテンツ
  contentAdvisoryRating: string
  trackContentRating: string
  advisories: string[]

  // 独自計算フィールド（DBのスナップショット差分から算出）
  recentReviewIncrease: number
}

export type SortKey = keyof Pick<
  AppRecord,
  'userRatingCount' | 'recentReviewIncrease' | 'price' | 'averageUserRating'
>
export type SortDir = 'asc' | 'desc'
