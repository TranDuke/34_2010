// ===== Danh sách người nhận thiệp, lấy từ data/people.json =====
const list = document.getElementById('people-list');
// Số ?v= của chính list.js (đặt trong index.html); gắn vào link thiệp để khi tăng số này,
// trình duyệt tải card.html mới thay vì dùng bản cũ đã lưu cho từng ?id=
const VERSION = new URL(document.currentScript.src).searchParams.get('v');

// Ảnh chính: ảnh tên "avatar…" trong photos; nếu không có thì dùng photo hoặc ảnh đầu tiên
const isAvatar = (src) => /(^|\/)avatar[^/]*$/i.test(src);
const mainPhoto = (p) => (p.photos || []).find(isAvatar) || p.photo || (p.photos || [])[0];

function personItem(p, i) {
  const li = document.createElement('li');
  li.style.setProperty('--delay', `${i * 80}ms`);

  const a = document.createElement('a');
  a.className = 'person';
  a.href = `card.html?id=${encodeURIComponent(p.id)}${VERSION ? `&v=${VERSION}` : ''}`;

  // Người không có ảnh hoặc "secret": true: hiện ô bí mật "?" thay cho ảnh
  const src = p.secret ? null : mainPhoto(p);
  let img;
  if (src) {
    img = document.createElement('img');
    img.src = src;
    img.onerror = () => { img.onerror = null; img.src = 'images/photo.svg'; };
    img.alt = '';
    img.loading = 'lazy';
  } else {
    img = document.createElement('span');
    img.textContent = '?';
  }
  img.classList.add('person-photo');

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = p.nickname || p.name; // biệt danh (nếu có) thay cho tên
  if (p.nickname && p.nicknameColor) name.style.color = p.nicknameColor;

  a.append(img, name);
  li.append(a);
  return li;
}

// no-cache: luôn hỏi lại server, tránh dùng danh sách cũ trỏ tới ảnh đã bị đổi tên/xoá
fetch('data/people.json', { cache: 'no-cache' })
  .then((res) => {
    if (!res.ok) throw new Error(res.status);
    return res.json();
  })
  .then((people) => list.replaceChildren(...people.map(personItem)))
  .catch((err) => {
    console.warn('Không tải được danh sách:', err);
    list.innerHTML = '<li class="people-empty">Không tải được danh sách thiệp. Hãy mở trang qua web server (xem README).</li>';
  });

// ===== Hiệu ứng chuyển sang màn thiệp =====
// Ảnh được chọn bay ra giữa màn hình và phóng to, các ảnh khác mờ dần, rồi mới chuyển trang.
// Khớp với thời gian transition trong style.css: ảnh bay 1.1s, màn hồng phủ xong ở 1.4s
const LEAVE_MS = 1400;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

list.addEventListener('click', (e) => {
  const link = e.target.closest('.person');
  // Giữ nguyên hành vi mở tab mới (Ctrl/Cmd/Shift + click, chuột giữa)
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (reduceMotion.matches || document.body.classList.contains('leaving')) return;
  e.preventDefault();

  const r = link.querySelector('.person-photo').getBoundingClientRect();
  const scale = Math.min((innerHeight * 0.62) / r.height, (innerWidth * 0.8) / r.width);
  link.style.setProperty('--fly-x', `${innerWidth / 2 - (r.left + r.width / 2)}px`);
  link.style.setProperty('--fly-y', `${innerHeight / 2 - (r.top + r.height / 2)}px`);
  link.style.setProperty('--fly-scale', scale);
  link.classList.add('picked');
  document.body.classList.add('leaving');

  setTimeout(() => { location.href = link.href; }, LEAVE_MS);
});

// Khi bấm Back, trình duyệt có thể khôi phục trang từ bộ nhớ đệm (bfcache) ở trạng thái đang "rời đi"
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  document.body.classList.remove('leaving');
  list.querySelectorAll('.picked').forEach((el) => el.classList.remove('picked'));
});
