ALTER TABLE guest_cards ADD COLUMN message TEXT NOT NULL DEFAULT '';
ALTER TABLE guest_cards ADD COLUMN drawing TEXT NOT NULL DEFAULT '{"strokes":[]}';
ALTER TABLE guest_cards ADD COLUMN signature TEXT NOT NULL DEFAULT '';
ALTER TABLE guest_cards ADD COLUMN public_url TEXT;
ALTER TABLE guest_cards ADD COLUMN private_email TEXT;

UPDATE guest_cards
SET
  message = CASE WHEN kind = 'note' THEN content ELSE '' END,
  drawing = CASE WHEN kind = 'drawing' THEN content ELSE '{"strokes":[]}' END,
  signature = CASE WHEN signature = '' THEN 'visitor' ELSE signature END;
