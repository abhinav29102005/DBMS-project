-- ═══════════════════════════════════════════════════════════════
-- V016: QR Code Extensions
-- ═══════════════════════════════════════════════════════════════

-- Add qr_code_id to hostel beds
ALTER TABLE hostel.beds 
ADD COLUMN qr_code_id UUID DEFAULT gen_random_uuid() UNIQUE;

-- Add qr_code_id to hostel rooms
ALTER TABLE hostel.rooms 
ADD COLUMN qr_code_id UUID DEFAULT gen_random_uuid() UNIQUE;

-- Add qr_code_id to library book copies
ALTER TABLE library.book_copies
ADD COLUMN qr_code_id UUID DEFAULT gen_random_uuid() UNIQUE;

-- We could also index these for fast lookups by QR scan
CREATE INDEX idx_hostel_beds_qr ON hostel.beds(qr_code_id);
CREATE INDEX idx_hostel_rooms_qr ON hostel.rooms(qr_code_id);
CREATE INDEX idx_library_copies_qr ON library.book_copies(qr_code_id);
