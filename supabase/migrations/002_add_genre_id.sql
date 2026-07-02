-- app_snapshots に genre_id カラムを追加
-- 同一アプリが複数カテゴリランキングに登場するため、UNIQUE制約も更新する

ALTER TABLE app_snapshots ADD COLUMN IF NOT EXISTS genre_id integer;
ALTER TABLE app_snapshots_archive ADD COLUMN IF NOT EXISTS genre_id integer;

-- 旧UNIQUE制約を削除して genre_id を含む制約に置き換え
ALTER TABLE app_snapshots DROP CONSTRAINT IF EXISTS app_snapshots_track_id_captured_at_key;
ALTER TABLE app_snapshots ADD CONSTRAINT app_snapshots_track_id_captured_at_genre_id_key
  UNIQUE (track_id, captured_at, genre_id);
