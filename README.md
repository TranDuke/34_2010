# Thiệp

Trang web tĩnh gồm 2 màn:
- `index.html` — danh sách những người có thiệp dạng ảnh, 3 ảnh hàng trên – 4 ảnh hàng dưới (lấy từ `data/people.json`). Bấm vào một người để mở thiệp của họ.
- `card.html?id=<id>` — tấm thiệp đóng, bấm (hoặc Enter/Space) để mở. Bên trong: ảnh bên trái, lời chúc bên phải.

## Tuỳ chỉnh
- **Người nhận & lời chúc**: sửa `data/people.json`. Mỗi người gồm `id` (dùng trên URL), `name`, `photo`, `youtubeId` (nhạc nền riêng), `cover` (chữ trên bìa), `greeting`, `message` (mảng các đoạn, không bắt buộc), `sign`.
- **Lời chúc ngẫu nhiên**: người không có `message` sẽ nhận 1 câu ngẫu nhiên trong `data/wishes.json` (100 câu chúc 20/10) mỗi lần mở trang. Thêm/sửa câu chúc trực tiếp trong file đó.
- **Ảnh**: đặt ảnh vào `images/` (vd. `images/lan.jpg`) rồi sửa `photo` của người đó trong `data/people.json`.
- **Nhiều ảnh**: dùng `photos` (mảng đường dẫn) thay cho `photo`. Ảnh có tên bắt đầu bằng `avatar` là ảnh chính (trên danh sách và trong thiệp); các ảnh còn lại được tải khi mở thiệp và bay ra nền xung quanh. Ảnh PNG đã tách nền trông đẹp nhất. Xem mẫu ở người đầu tiên (`images/vu-minh-anh/`).
- **Nhạc nền**: đặt `youtubeId` của từng người là ID video YouTube (phần sau `watch?v=`). Người không có `youtubeId` sẽ dùng bài mặc định `MUSIC_VIDEO_ID` trong `card.js`. Muốn bỏ qua đoạn đầu bài thì thêm `musicStart` (số giây, vd. `"musicStart": 10`); bài lặp lại cũng bắt đầu từ giây này. Người xem có thể rê chuột vào nút nhạc để dán link YouTube khác và nghe ngay (chỉ cho lần xem đó, không lưu lại). Video phải cho phép nhúng.
- **Màu sắc**: các biến trong `:root` ở `style.css`.
- **Sau khi sửa CSS/JS**: tăng số `?v=` trong `index.html` và `card.html` (vd. `?v=2` → `?v=3`) để trình duyệt của người xem tải bản mới thay vì dùng bản cũ trong cache. Số `?v=` của `list.js` cũng được gắn vào link sang thiệp (`card.html?id=…&v=…`) nên `card.html` cũng được tải mới.
- **Màu thiệp**: mỗi lần mở, màn thiệp chọn ngẫu nhiên 1 trong 6 màu (hồng, đỏ, xanh lam, vàng, cam, tím) — bảng màu ở `[data-theme]` trong `style.css` và `PALETTES` trong `decor.js`. Trang danh sách giữ màu hồng.

## Deploy lên GitHub Pages
1. Push repo lên GitHub.
2. Vào **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
3. Push lên nhánh `main` (hoặc chạy tay workflow *Deploy greeting card to GitHub Pages* ở tab Actions).
4. Trang sẽ có ở `https://<username>.github.io/<repo>/`.

Xem thử local: `python3 -m http.server 8000 -d thiep` rồi mở http://localhost:8000 (danh sách và nhạc YouTube không chạy khi mở file trực tiếp `file://`).
