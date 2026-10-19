const card = document.getElementById('card');

// Ảnh chính: ảnh tên "avatar…" trong photos; nếu không có thì dùng photo hoặc ảnh đầu tiên
const isAvatar = (src) => /(^|\/)avatar[^/]*$/i.test(src);
const mainPhoto = (p) => (p.photos || []).find(isAvatar) || p.photo || (p.photos || [])[0];
let memories = [];

// ===== Nạp nội dung thiệp theo ?id= từ data/people.json =====
async function loadPerson() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return splitWords();
  try {
    // no-cache: luôn hỏi lại server, tránh dùng dữ liệu cũ trỏ tới ảnh đã bị đổi tên/xoá
    const getJSON = (url) => fetch(url, { cache: 'no-cache' }).then((res) => res.json());
    const [people, wishes] = await Promise.all([
      getJSON('data/people.json'),
      getJSON('data/wishes.json').catch(() => []),
    ]);
    const p = people.find((x) => x.id === id);
    if (!p) return;
    // "secret": true giấu tên thật trên tab trình duyệt; tên chỉ hiện trong thiệp khi mở
    document.title = `Thiệp gửi ${p.secret ? p.nickname || 'Secret' : p.name}`;
    document.getElementById('cover-title').textContent = p.cover;
    document.getElementById('greeting').textContent = p.greeting;
    document.getElementById('sign').textContent = p.sign;
    // Lời chúc riêng trong "message"; nếu không có thì bốc ngẫu nhiên 1 câu từ data/wishes.json
    const message = p.message?.length ? p.message : wishes.length ? [pick(wishes)] : [];
    const body = document.getElementById('message-body');
    if (message.length) body.replaceChildren(...message.map((t) => {
      const el = document.createElement('p');
      el.textContent = t;
      return el;
    }));
    // "cardPhoto": ảnh riêng cho mặt trong thiệp; nếu không có thì dùng ảnh chính
    const avatar = mainPhoto(p);
    const main = p.cardPhoto || avatar;
    const photo = document.getElementById('photo');
    if (main) {
      photo.onerror = () => { photo.onerror = null; photo.src = 'images/photo.svg'; };
      photo.src = main;
    } else {
      // Không có ảnh: trang trái hiện dấu "?" bí mật
      photo.parentElement.classList.add('no-photo');
      photo.remove();
    }
    memories = (p.photos || []).filter((src) => src !== main && src !== avatar);
    buildMemories(); // tải sẵn ngầm để lúc mở thiệp ảnh bay ra ngay
    if (p.youtubeId) musicId = p.youtubeId;
    if (p.musicStart) musicStart = p.musicStart;
    // Bài người xem đã tự đổi cho thiệp này lần trước (nếu có) được ưu tiên
    musicKey = `music:${id}`;
    const saved = loadSavedSong();
    if (saved) [musicId, musicStart] = [saved.id, saved.start];
  } catch (err) {
    console.warn('Không tải được dữ liệu thiệp:', err);
  }
  splitWords();
}
loadPerson().finally(loadYouTube);

// ===== Lời chúc hiện ra lần lượt từng chữ khi mở thiệp =====
// Tách mỗi chữ thành <span class="word"> với --i là thứ tự xuất hiện; CSS dùng --i để tính độ trễ.
// Giữa các đoạn (lời mở đầu → từng đoạn chúc → chữ ký) nghỉ thêm một nhịp cho dễ đọc.
const BLOCK_PAUSE = 5;

function splitWords() {
  const blocks = document.querySelectorAll('.message h1, .message p');
  let i = 0;
  blocks.forEach((block) => {
    const words = block.textContent.trim().split(/\s+/);
    block.replaceChildren(...words.flatMap((w, k) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      span.style.setProperty('--i', i++);
      return k ? [' ', span] : [span];
    }));
    i += BLOCK_PAUSE;
  });
}

function toggle() {
  const open = card.classList.toggle('open');
  if (open) {
    startMusic();
    showMemories();
  } else {
    memoriesEl.classList.remove('show');
  }
  card.setAttribute('aria-expanded', String(open));
  card.setAttribute('aria-label', open ? 'Đóng thiệp' : 'Mở thiệp');
}

card.addEventListener('click', toggle);
card.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggle();
  }
});

// ===== Ảnh kỷ niệm bay ra nền khi mở thiệp =====
// Ảnh được tải ngầm ngay khi vào trang (ẩn đi), mở thiệp mới hiện. Mỗi ảnh bay từ sau thiệp ra chỗ của nó rồi lơ lửng nhẹ.
// Màn rộng: xếp 2 bên trái/phải thiệp. Màn dọc (điện thoại): xếp ở dải trên/dưới thiệp.
// Ảnh nằm đè lên mép thiệp một chút (không bắt sự kiện chuột nên vẫn bấm được thiệp).
const memoriesEl = document.getElementById('memories');
const MEMORY_START = 900;   // ms — đợi bìa lật gần xong
const MEMORY_STAGGER = 280; // ms — giữa 2 ảnh liên tiếp
const narrowScreen = matchMedia('(max-width: 600px)');

// Neo ảnh vào mép thiệp (đã mở): ảnh nằm ngoài thiệp, chỉ đè lên mép một chút
const MEMORY_OVERLAP = 8; // px

function placeMemories() {
  const items = [...memoriesEl.children];
  const lines = Math.ceil(items.length / 2);
  // Khung thiệp khi mở: căn giữa trong .scene (không tính transform của animation)
  const r = document.querySelector('.scene').getBoundingClientRect();
  const w = card.offsetWidth;
  const h = card.offsetHeight;
  const left = r.left + (r.width - w) / 2;
  const top = r.top + (r.height - h) / 2;
  items.forEach((el, i) => {
    const along = (Math.floor(i / 2) + 0.5) / lines;
    const end = i % 2; // 0: trái/trên, 1: phải/dưới
    let x, y, tx, ty;
    if (narrowScreen.matches) {
      // Dải trên/dưới thiệp
      x = left + along * w;
      y = end ? top + h - MEMORY_OVERLAP : top + MEMORY_OVERLAP;
      [tx, ty] = [-50, end ? 0 : -100];
    } else {
      // Hai bên trái/phải thiệp
      x = end ? left + w - MEMORY_OVERLAP : left + MEMORY_OVERLAP;
      y = top + along * h;
      [tx, ty] = [end ? 0 : -100, -50];
    }
    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--y', `${y}px`);
    el.style.setProperty('--tx', `${tx}%`);
    el.style.setProperty('--ty', `${ty}%`);
    el.style.setProperty('--h', narrowScreen.matches ? '17vh' : `${Math.min(32, 66 / lines)}vh`);
    // Điểm xuất phát: giữa màn hình (sau tấm thiệp)
    el.style.setProperty('--from-x', `${innerWidth / 2 - x}px`);
    el.style.setProperty('--from-y', `${innerHeight / 2 - y}px`);
  });
}
addEventListener('resize', placeMemories);

function buildMemories() {
  memoriesEl.replaceChildren(...memories.map((src) => {
    const el = document.createElement('div');
    el.className = 'memory';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.style.setProperty('--rot', `${rand(-10, 10)}deg`);
    img.style.setProperty('--float-dur', `${rand(3, 5)}s`);
    el.append(img);
    return el;
  }));
  placeMemories();
}

function showMemories() {
  if (!memories.length) return;
  if (!memoriesEl.childElementCount) buildMemories();
  // Xáo thứ tự ảnh mỗi lần mở (Fisher–Yates) để mỗi ảnh rơi vào chỗ khác nhau
  const items = [...memoriesEl.children];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  memoriesEl.append(...items);
  placeMemories(); // tính lại vì lúc tải sẵn, thiệp có thể còn đang chạy animation hiện ra
  memoriesEl.classList.add('show');
  // Chạy lại animation mỗi lần mở; ảnh nào tải chậm thì bay ra ngay khi tải xong
  const start = performance.now() + MEMORY_START;
  memoriesEl.querySelectorAll('img').forEach((img, i) => {
    img.classList.remove('in');
    img.decode().then(() => {
      if (!card.classList.contains('open')) return;
      img.style.setProperty('--d', `${Math.max(0, start + i * MEMORY_STAGGER - performance.now())}ms`);
      void img.offsetWidth; // buộc trình duyệt bắt đầu lại animation
      img.classList.add('in');
    }, () => img.parentElement.remove());
  });
}

// ===== Nhạc nền từ YouTube =====
// Mỗi người có bài riêng qua "youtubeId" trong data/people.json; đây là bài mặc định
// (ID video là phần sau "watch?v=" trong link YouTube)
const MUSIC_VIDEO_ID = 'MwoNwRzx0Ak';
let musicId = MUSIC_VIDEO_ID;
// Giây bắt đầu phát, đặt qua "musicStart" trong data/people.json (mặc định phát từ đầu)
let musicStart = 0;

const musicBtn = document.getElementById('music-btn');
let player = null;
let playerReady = false;
let wantPlay = false;
let loadedId = null; // bài đang nạp trong trình phát (khác musicId khi vừa đổi bài lúc player chưa sẵn sàng)

// Bài người xem tự đổi được lưu trong localStorage của trình duyệt đó, riêng cho từng thiệp (?id=)
let musicKey = null;

function loadSavedSong() {
  try {
    const song = JSON.parse(localStorage.getItem(musicKey));
    return song && /^[\w-]{11}$/.test(song.id) ? { id: song.id, start: Number(song.start) || 0 } : null;
  } catch {
    return null;
  }
}

function saveSong(song) {
  if (!musicKey) return;
  try { localStorage.setItem(musicKey, JSON.stringify(song)); } catch { /* trình duyệt chặn lưu: bỏ qua */ }
}

// Chỉ nạp YouTube sau khi đã biết bài của người nhận thiệp
function loadYouTube() {
  const ytScript = document.createElement('script');
  ytScript.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(ytScript);
}

window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player('yt-player', {
    width: 200,
    height: 200,
    videoId: musicId,
    playerVars: { autoplay: 0, controls: 0, start: musicStart, playsinline: 1, origin: location.origin },
    events: {
      onReady: () => {
        playerReady = true;
        loadedId = musicId;
        player.setVolume(70);
        if (wantPlay) playMusic();
      },
      onStateChange: (e) => {
        // Tự lặp lại bài, quay về đúng giây bắt đầu (musicStart) thay vì 0:00
        if (e.data === YT.PlayerState.ENDED) {
          player.seekTo(musicStart, true);
          player.playVideo();
          return;
        }
        setMusicUI(e.data === YT.PlayerState.PLAYING);
      },
      onError: (e) => console.warn('Không phát được nhạc YouTube, mã lỗi:', e.data),
    },
  });
};

function setMusicUI(playing) {
  musicBtn.classList.toggle('playing', playing);
  musicBtn.setAttribute('aria-pressed', String(playing));
  musicBtn.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
}

function playMusic() {
  if (loadedId === musicId) {
    player.playVideo();
  } else {
    loadedId = musicId;
    player.loadVideoById({ videoId: musicId, startSeconds: musicStart });
  }
}

// Trình duyệt chỉ cho phát nhạc sau khi người xem tương tác, nên nhạc bắt đầu lúc mở thiệp
function startMusic() {
  wantPlay = true;
  if (playerReady) playMusic();
}

musicBtn.addEventListener('click', () => {
  const playing = musicBtn.classList.contains('playing');
  wantPlay = !playing;
  if (!playerReady) return;
  if (playing) player.pauseVideo();
  else playMusic();
});

// ===== Đổi bài bằng link YouTube (ô hiện khi rê chuột vào nút nhạc) =====
// Nhận link watch?v=, youtu.be/, shorts/, embed/, music.youtube.com hoặc chỉ ID 11 ký tự;
// "t=" / "start=" trong link (vd. 90, 1m30s) thành giây bắt đầu. Bài mới được nhớ cho thiệp này
// trên trình duyệt của người xem, lần sau mở lại sẽ phát bài đó.
const musicForm = document.getElementById('music-form');
const musicUrl = document.getElementById('music-url');
const musicMsg = document.getElementById('music-msg');
const YT_ID = /^[\w-]{11}$/;

function parseSeconds(t) {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  return m ? (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0) : 0;
}

function parseYouTube(text) {
  text = text.trim();
  if (YT_ID.test(text)) return { id: text, start: 0 };
  let url;
  try { url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); } catch { return null; }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id = null;
  if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') || (url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/) || [])[1];
  }
  if (!id || !YT_ID.test(id)) return null;
  return { id, start: parseSeconds(url.searchParams.get('t') || url.searchParams.get('start')) };
}

musicForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const song = parseYouTube(musicUrl.value);
  musicMsg.classList.toggle('error', !song);
  if (!song) {
    musicMsg.textContent = 'Link chưa đúng, hãy dán link video YouTube.';
    return;
  }
  musicId = song.id;
  musicStart = song.start;
  saveSong(song);
  wantPlay = true;
  if (playerReady) playMusic();
  musicMsg.textContent = 'Đang phát bài mới ♪';
  musicUrl.value = '';
});

// Esc: đóng ô nhập (bỏ focus để ô ẩn đi)
musicForm.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.activeElement.blur();
});
