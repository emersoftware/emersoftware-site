CREATE TABLE IF NOT EXISTS guest_cards (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('note', 'drawing')),
  content TEXT NOT NULL,
  rate_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_guest_cards_visible_created
  ON guest_cards (is_visible, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guest_cards_rate_created
  ON guest_cards (rate_key, created_at DESC);
