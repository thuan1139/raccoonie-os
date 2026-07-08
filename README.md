# Raccoonie OS v1.0

Business Operating System cho brand Raccoonie (MVP).
Stack: React + Vite + Tailwind + Recharts + Lucide. Dữ liệu chạy mock data sẵn;
có thể cắm Supabase để lưu thật.

## Chạy local
```bash
npm install
npm run dev        # mở http://localhost:5173
```

## Build production
```bash
npm run build      # xuất ra thư mục dist/
npm run preview    # xem thử bản build
```

## Deploy (GitHub + Netlify)
1. `git init && git add . && git commit -m "init"` rồi push lên GitHub.
2. Netlify > **Add new site** > **Import from GitHub** > chọn repo.
3. Build command `npm run build`, publish directory `dist` (netlify.toml đã set sẵn).
4. Deploy. File `netlify.toml` đã có redirect SPA để không lỗi 404 khi refresh.

## Kết nối Supabase (tùy chọn)
1. Tạo project ở supabase.com.
2. SQL Editor > dán nội dung `supabase/schema.sql` > Run.
3. Project Settings > API: copy **Project URL** và **anon public key**.
4. Tạo file `.env` (copy từ `.env.example`) và điền 2 giá trị đó.
5. Trên Netlify: Site configuration > Environment variables > thêm
   `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` > Redeploy.
6. Dùng `src/lib/supabaseClient.js` để đọc/ghi (xem ví dụ trong file).

Chưa cấu hình Supabase thì app tự chạy bằng mock data (không lỗi).
