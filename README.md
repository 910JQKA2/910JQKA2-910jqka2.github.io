# Roser — Lightweight Link Opener (for GitHub Pages)

## Mô tả
Roser là web app đơn giản để mở link, giả lập trình duyệt nhỏ với: tabs, address bar, history, back/forward, bookmarks. Hỗ trợ mapping `1.1.1.1://` → `https://`.

> Lưu ý: nhiều website lớn chặn nhúng bằng iframe (X-Frame-Options). Nếu trang bị chặn, Roser sẽ đề nghị mở trang trong cửa sổ mới.

## Cách deploy
1. Tạo repo mới trên GitHub, push các file (`index.html`, `style.css`, `roser.js`, `README.md`).
2. Trong repository > Settings > Pages > Source: chọn `main` branch (root). Lưu.
3. Sau vài giây/min, trang sẽ xuất hiện tại `https://<username>.github.io/<repo>/`.

## Ghi chú kỹ thuật
- Nếu bạn muốn Roser hiển thị HTML thô của một trang (khi iframe bị chặn), Roser đã có nút "Hiển thị HTML thô" — nhưng lưu ý **CORS** có thể chặn `fetch` từ browser.
- Để hiển thị nội dung trang giống hệt (render server-side), bạn cần 1 proxy server (như mình đã mô tả trước đó).
