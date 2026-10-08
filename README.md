# Thiệp

Trang web tĩnh: tấm thiệp đóng, bấm (hoặc Enter/Space) để mở. Bên trong: ảnh bên trái, lời chúc bên phải.

## Tuỳ chỉnh
- **Ảnh**: thay `images/photo.svg` bằng ảnh của bạn (vd. `images/photo.jpg`) rồi sửa `src` trong `index.html`.
- **Lời chúc / tiêu đề bìa**: sửa trực tiếp trong `index.html`.
- **Nhạc nền**: đổi `MUSIC_VIDEO_ID` trong `script.js` thành ID video YouTube (phần sau `watch?v=`). Video phải cho phép nhúng.
- **Màu sắc**: các biến trong `:root` ở `style.css`.

## Deploy lên GitHub Pages
1. Push repo lên GitHub.
2. Vào **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
3. Push lên nhánh `main` (hoặc chạy tay workflow *Deploy greeting card to GitHub Pages* ở tab Actions).
4. Trang sẽ có ở `https://<username>.github.io/<repo>/`.

Xem thử local: `python3 -m http.server 8000 -d thiep` rồi mở http://localhost:8000 (nhạc YouTube không chạy khi mở file trực tiếp `file://`).
