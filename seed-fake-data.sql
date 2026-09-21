-- Find ID: fake demo data
-- NOT executed yet — Supabase project ixpbhgcoosoifezaszkx is paused.
-- Run once the project is restored (dashboard > Restore project) and
-- supabase/schema.sql has been applied. Paste into the SQL editor, or:
--   supabase db query --linked --file seed-fake-data.sql
--
-- page_id below matches the FB_PAGE_ID already in .env.example
-- (956008030922040) so the generated Meta inbox deep links line up once
-- that value is set in .env.local. PSIDs and message content are fake.

insert into conversations (psid, page_id, name, snippet, last_at, updated_at)
values
  ('7821904456123001', '956008030922040', 'Nguyễn Thị Hồng',
   'Dạ shop ơi cho em hỏi mẫu áo này còn size M không ạ?',
   '2026-09-21T09:12:00+07:00', now()),
  ('7821904456123002', '956008030922040', 'Trần Văn Minh',
   'Em đặt hàng hôm qua rồi, bao giờ giao vậy shop?',
   '2026-09-21T08:47:00+07:00', now()),
  ('7821904456123003', '956008030922040', 'Lê Thị Thu Hà',
   'Cho mình xin bảng giá sỉ với ạ, mình lấy số lượng lớn.',
   '2026-09-20T19:30:00+07:00', now()),
  ('7821904456123004', '956008030922040', 'Phạm Quốc Huy',
   'Sản phẩm bị lỗi đường may, mình muốn đổi trả.',
   '2026-09-20T15:05:00+07:00', now()),
  ('7821904456123005', '956008030922040', 'Đỗ Thị Mai Linh',
   'Dạ cảm ơn shop, hàng nhận được đẹp lắm ạ.',
   '2026-09-19T21:18:00+07:00', now()),
  ('7821904456123006', '956008030922040', 'Vũ Đình Khoa',
   'Shop cho hỏi có ship COD ra Hà Nội không ạ?',
   '2026-09-19T11:42:00+07:00', now()),
  ('7821904456123007', '956008030922040', 'Bùi Thị Ngọc Ánh',
   'Mình muốn hủy đơn hàng vừa đặt sáng nay được không shop?',
   '2026-09-18T14:26:00+07:00', now()),
  ('7821904456123008', '956008030922040', 'Hoàng Anh Tuấn',
   'Cho em xin mã giảm giá cho đơn tiếp theo với ạ.',
   '2026-09-17T10:03:00+07:00', now())
on conflict (psid) do nothing;
