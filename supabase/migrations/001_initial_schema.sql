-- apps テーブル（各アプリの最新状態。バッチ実行のたびに upsert で上書き）
CREATE TABLE IF NOT EXISTS apps (
  track_id                                    bigint PRIMARY KEY,
  bundle_id                                   text,
  track_name                                  text NOT NULL,
  track_censored_name                         text,
  track_view_url                              text,
  description                                 text,
  release_notes                               text,
  version                                     text,
  kind                                        text,
  wrapper_type                                text,
  artist_id                                   bigint,
  artist_name                                 text,
  seller_name                                 text,
  seller_url                                  text,
  artist_view_url                             text,
  price                                       numeric,
  formatted_price                             text,
  currency                                    text,
  is_vpp_device_based_licensing_enabled       boolean,
  user_rating_count                           integer,
  average_user_rating                         numeric,
  user_rating_count_for_current_version       integer,
  average_user_rating_for_current_version     numeric,
  primary_genre_id                            integer,
  primary_genre_name                          text,
  genres                                      text[],
  genre_ids                                   text[],
  artwork_url_60                              text,
  artwork_url_100                             text,
  artwork_url_512                             text,
  screenshot_urls                             text[],
  ipad_screenshot_urls                        text[],
  appletv_screenshot_urls                     text[],
  release_date                                timestamptz,
  current_version_release_date                timestamptz,
  minimum_os_version                          text,
  file_size_bytes                             text,
  supported_devices                           text[],
  features                                    text[],
  language_codes_iso2a                        text[],
  is_game_center_enabled                      boolean,
  content_advisory_rating                     text,
  track_content_rating                        text,
  advisories                                  text[],
  updated_at                                  timestamptz DEFAULT now()
);

-- app_snapshots テーブル（直近14日分。差分計算のクエリ対象）
CREATE TABLE IF NOT EXISTS app_snapshots (
  id                                          bigserial PRIMARY KEY,
  track_id                                    bigint NOT NULL REFERENCES apps(track_id),
  captured_at                                 date NOT NULL DEFAULT CURRENT_DATE,
  user_rating_count                           integer,
  average_user_rating                         numeric,
  user_rating_count_for_current_version       integer,
  average_user_rating_for_current_version     numeric,
  price                                       numeric,
  formatted_price                             text,
  version                                     text,
  current_version_release_date                timestamptz,
  release_notes                               text,
  UNIQUE (track_id, captured_at)
);

CREATE INDEX IF NOT EXISTS idx_app_snapshots_track_id    ON app_snapshots (track_id);
CREATE INDEX IF NOT EXISTS idx_app_snapshots_captured_at ON app_snapshots (captured_at);

-- app_snapshots_archive テーブル（14日超の退避先。クエリ対象外）
CREATE TABLE IF NOT EXISTS app_snapshots_archive (
  id                                          bigint,
  track_id                                    bigint NOT NULL,
  captured_at                                 date NOT NULL,
  user_rating_count                           integer,
  average_user_rating                         numeric,
  user_rating_count_for_current_version       integer,
  average_user_rating_for_current_version     numeric,
  price                                       numeric,
  formatted_price                             text,
  version                                     text,
  current_version_release_date                timestamptz,
  release_notes                               text
);
