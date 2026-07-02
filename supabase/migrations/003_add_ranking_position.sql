-- RSSランキング順位を保存するカラムを追加
ALTER TABLE app_snapshots ADD COLUMN IF NOT EXISTS ranking_position integer;
ALTER TABLE app_snapshots_archive ADD COLUMN IF NOT EXISTS ranking_position integer;
