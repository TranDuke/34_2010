// ===== Trang trí nền: hoa, cành lá & bướm =====
const decor = document.getElementById('decor');
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Màu hoa & bướm theo theme của trang (data-theme trên <html>); trang danh sách không có theme nên dùng hồng.
// tint: 8 sắc từ nhạt → đậm; accent: cặp màu cánh bướm điểm xuyết; body: thân bướm
const PALETTES = {
  pink:   { tint: ['#fce4ec', '#f8bbd0', '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#c2185b', '#ad1457'], accent: ['#ce93d8', '#8e24aa'], body: '#6a1b3d' },
  red:    { tint: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#d32f2f', '#c62828'], accent: ['#ffd54f', '#f9a825'], body: '#5f1414' },
  blue:   { tint: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1976d2', '#1565c0'], accent: ['#ce93d8', '#8e24aa'], body: '#0d3c6e' },
  yellow: { tint: ['#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#fdd835', '#f9a825', '#f57f17'], accent: ['#ffb74d', '#ef6c00'], body: '#5c4300' },
  orange: { tint: ['#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#f57c00', '#e65100'], accent: ['#fff176', '#f9a825'], body: '#6b2a0c' },
  purple: { tint: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#7b1fa2', '#6a1b9a'], accent: ['#f48fb1', '#c2185b'], body: '#3f1660' },
};
const THEME = PALETTES[document.documentElement.dataset.theme] || PALETTES.pink;
const [T50, T100, T200, T300, T400, T500, T700, T800] = THEME.tint;

const PINKS = [T100, T200, T300, T400, T50];
const LEAF = ['#66bb6a', '#43a047', '#81c784', '#2e7d32'];
const WINGS = [[T300, T800], [T100, T400], THEME.accent, ['#ffffff', T200]];

// Một chiếc lá nằm ngang, gốc ở (0,0)
const leaf = (x, y, angle, len, color) => `
  <g transform="translate(${x} ${y}) rotate(${angle}) scale(${len / 44})">
    <path d="M0 0 C10 -11 30 -12 44 0 C30 12 10 11 0 0 Z" fill="${color}"/>
    <path d="M2 0 L40 0" stroke="#1b5e20" stroke-width="1.2" opacity=".35"/>
  </g>`;

// Hai lá lót phía sau bông hoa
const backLeaves = () => {
  const a = rand(0, 360);
  return leaf(0, 0, a, rand(44, 56), pick(LEAF)) + leaf(0, 0, a + rand(100, 160), rand(40, 52), pick(LEAF));
};

// Các loại hoa, vẽ trong viewBox -50 -50 100 100
const FLOWERS = {
  // Hoa 5 cánh tròn
  blossom() {
    const c = pick(PINKS.concat('#ffffff'));
    let p = '';
    for (let i = 0; i < 5; i++) p += `<ellipse cx="0" cy="-22" rx="14" ry="22" fill="${c}" transform="rotate(${i * 72})"/>`;
    return backLeaves() + p + `<circle r="11" fill="${pick(['#ffd54f', T700])}"/><circle r="5" fill="#fff8e1" opacity=".7"/>`;
  },
  // Hoa cúc: nhiều cánh mảnh
  daisy() {
    const c = pick(['#ffffff', T50, T100]);
    let p = '';
    for (let i = 0; i < 16; i++) p += `<ellipse cx="0" cy="-25" rx="5" ry="18" fill="${c}" stroke="${T100}" stroke-width=".8" transform="rotate(${i * 22.5})"/>`;
    return backLeaves() + p + `<circle r="12" fill="#ffca28"/><circle r="12" fill="none" stroke="#f9a825" stroke-width="2" stroke-dasharray="2 3"/>`;
  },
  // Hoa anh đào: cánh có khía
  sakura() {
    const c = pick([T50, T100, T200]);
    let p = '';
    for (let i = 0; i < 5; i++) {
      p += `<path d="M0 0 C-16 -10 -20 -32 -8 -44 L0 -37 L8 -44 C20 -32 16 -10 0 0 Z" fill="${c}" stroke="${T300}" stroke-width=".8" transform="rotate(${i * 72})"/>`;
    }
    let st = '';
    for (let i = 0; i < 8; i++) st += `<line x1="0" y1="0" x2="0" y2="-14" stroke="${T700}" stroke-width="1.2" transform="rotate(${i * 45})"/><circle cx="0" cy="-15" r="1.8" fill="${T800}" transform="rotate(${i * 45})"/>`;
    return backLeaves() + p + st + `<circle r="4" fill="${T400}"/>`;
  },
  // Hoa hồng nhìn từ trên xuống
  rose() {
    const c = pick([T300, T400, T200, T500]);
    let p = '';
    for (let i = 0; i < 6; i++) p += `<ellipse cx="0" cy="-22" rx="17" ry="20" fill="${c}" transform="rotate(${i * 60 + 30})"/>`;
    return backLeaves() + p +
      `<circle r="26" fill="${c}"/>
       <path d="M2 0 a3 3 0 1 1 -6 0 a7 7 0 1 1 13 0 a11 11 0 1 1 -21 0 a15 15 0 1 1 29 0 a19 19 0 1 1 -37 0"
             fill="none" stroke="${T800}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>`;
  },
  // Hoa tulip nhìn ngang, có thân và lá
  tulip() {
    const c = pick([T300, T400, T200, '#ffffff']);
    return `<path d="M0 -6 Q-2 22 0 50" stroke="#388e3c" stroke-width="4" fill="none"/>
      <path d="M0 46 C-22 30 -26 10 -20 0 C-12 14 -6 28 0 46 Z" fill="${pick(LEAF)}"/>
      <path d="M0 40 C18 26 22 8 18 -2 C10 12 4 24 0 40 Z" fill="${pick(LEAF)}"/>
      <path d="M-20 -36 L-20 -12 C-20 4 20 4 20 -12 L20 -36 L10 -24 L0 -40 L-10 -24 Z" fill="${c}" stroke="${T800}" stroke-width="1"/>
      <path d="M0 -40 C-8 -26 -8 -6 0 -2 C8 -6 8 -26 0 -40 Z" fill="#000" opacity=".08"/>`;
  },
};
const TYPES = Object.keys(FLOWERS);

function addFlower(x, y, size, type = pick(TYPES)) {
  const el = document.createElement('div');
  el.className = 'flower';
  el.style.left = `calc(${x}% - ${size / 2}px)`;
  el.style.top = `calc(${y}% - ${size / 2}px)`;
  el.style.width = el.style.height = `${size}px`;
  // Tulip đứng thẳng, các hoa khác xoay tuỳ ý
  el.style.setProperty('--rot', type === 'tulip' ? `${rand(-15, 15)}deg` : `${rand(0, 360)}deg`);
  el.style.setProperty('--sway-dur', `${rand(4, 8)}s`);
  el.style.setProperty('--sway-delay', `${-rand(0, 8)}s`);
  el.innerHTML = `<svg viewBox="-50 -50 100 100">${FLOWERS[type]()}</svg>`;
  decor.appendChild(el);
}

// Cành lá xanh mọc từ góc màn hình (vẽ từ góc dưới-trái hướng lên phải)
function branchSVG() {
  const bend = rand(-30, 30);
  let leaves = '';
  for (let t = 0.15; t < 0.95; t += 0.11) {
    // điểm trên đường cong bậc 2: (0,200) → điều khiển (60+bend, 80-bend) → (190,10)
    const u = 1 - t;
    const x = 2 * u * t * (60 + bend) + t * t * 190;
    const y = u * u * 200 + 2 * u * t * (80 - bend) + t * t * 10;
    const len = 48 * (1 - t * 0.5);
    leaves += leaf(x, y, -40 - rand(30, 60), len, pick(LEAF)) + leaf(x, y, -40 + rand(30, 60), len * 0.9, pick(LEAF));
  }
  leaves += leaf(190, 10, -45, 40, pick(LEAF));
  return `<svg viewBox="0 0 200 200">
    <path d="M0 200 Q${60 + bend} ${80 - bend} 190 10" stroke="#558b2f" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${leaves}</svg>`;
}

// Bướm nhìn từ mặt bên, đầu quay sang phải; cánh gắn ở lưng và vỗ lên xuống
function butterflySVG([wing, edge]) {
  const wings = (fill, extra = '') => `
    <path d="M34 40 C28 24 17 15 11 19 C8 29 20 38 34 41 Z" fill="${fill}" stroke="${edge}" stroke-width="1.3"/>
    <path d="M37 40 C38 22 51 5 63 7 C67 18 55 34 37 41 Z" fill="${fill}" stroke="${edge}" stroke-width="1.3"/>
    ${extra}`;
  const spots = `<circle cx="57" cy="13" r="2.6" fill="${edge}" opacity=".6"/>
    <circle cx="51" cy="22" r="1.8" fill="${edge}" opacity=".45"/>
    <circle cx="17" cy="23" r="2" fill="${edge}" opacity=".45"/>`;
  return `<svg viewBox="0 0 70 56">
    <g class="wing far" opacity=".5"><g transform="rotate(-12 35 41)">${wings(edge)}</g></g>
    <path d="M31 44.5 l-2 3.5 M36 44.5 l-.5 4 M41 44.5 l1.5 3.5" stroke="${THEME.body}" stroke-width=".45" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="42" rx="13" ry="3.4" fill="${THEME.body}"/>
    <circle cx="49" cy="41" r="3.6" fill="${THEME.body}"/>
    <path d="M51 38 Q55 28 61 27 M50 38 Q52 27 57 24" stroke="${THEME.body}" stroke-width="1" fill="none" stroke-linecap="round"/>
    <g class="wing near">${wings(wing, spots)}</g>
  </svg>`;
}

const corners = [[0, 0], [100, 0], [0, 100], [100, 100]];

// Cành lá vẽ trước để nằm dưới hoa
corners.forEach(([cx, cy]) => {
  for (let i = 0; i < 3; i++) {
    const el = document.createElement('div');
    el.className = 'branch';
    const size = rand(160, 280);
    el.style.width = el.style.height = `min(${size}px, ${size / 7}vw)`;
    el.style[cx ? 'right' : 'left'] = `${rand(-2, 4)}%`;
    el.style[cy ? 'bottom' : 'top'] = `${rand(-2, 4)}%`;
    el.style.transformOrigin = `${cx ? 'right' : 'left'} ${cy ? 'bottom' : 'top'}`;
    el.style.setProperty('--flip', `scale(${cx ? -1 : 1}, ${cy ? 1 : -1})`);
    el.style.setProperty('--rot', `${rand(-25, 25)}deg`);
    el.style.setProperty('--sway-dur', `${rand(5, 9)}s`);
    el.style.setProperty('--sway-delay', `${-rand(0, 9)}s`);
    el.innerHTML = branchSVG();
    decor.appendChild(el);
  }
});

// Cụm hoa ở 4 góc + vài bông rải rác
corners.forEach(([cx, cy]) => {
  for (let i = 0; i < 7; i++) {
    const dx = rand(0, 14) * (cx ? -1 : 1);
    const dy = rand(0, 18) * (cy ? -1 : 1);
    addFlower(cx + dx, cy + dy, rand(40, 120));
  }
});
for (let i = 0; i < 10; i++) {
  addFlower(rand(5, 95), pick([rand(3, 15), rand(85, 97)]), rand(26, 50));
}

// Bướm bay ngang màn hình
for (let i = 0; i < 7; i++) {
  const el = document.createElement('div');
  el.className = 'butterfly' + (i % 2 ? ' reverse' : '');
  const dur = rand(14, 26);
  el.style.setProperty('--top', `${rand(5, 85)}%`);
  el.style.setProperty('--fly-dur', `${dur}s`);
  el.style.setProperty('--fly-delay', `${-rand(0, dur)}s`);
  el.style.setProperty('--size', `${rand(40, 70)}px`);
  el.style.setProperty('--flap-delay', `${-rand(0, .32)}s`);
  el.style.setProperty('--rest-x', `${rand(5, 90)}vw`);
  el.innerHTML = `<div class="bob">${butterflySVG(pick(WINGS))}</div>`;
  decor.appendChild(el);
}

// Ong nhìn ngang, đầu quay sang phải; bay lượn vòng quanh các bụi hoa
let beeId = 0;
function beeSVG() {
  const id = `bee-body-${beeId++}`;
  const wing = (cx, rot) =>
    `<ellipse cx="${cx}" cy="11" rx="7" ry="11" fill="#e3f2fd" fill-opacity=".75" stroke="#90caf9" stroke-width=".8" transform="rotate(${rot} ${cx} 20)"/>`;
  return `<svg viewBox="0 0 60 46">
    <defs><clipPath id="${id}"><ellipse cx="28" cy="30" rx="17" ry="11"/></clipPath></defs>
    <g class="bee-wing far" opacity=".7">${wing(24, -25)}</g>
    <path d="M12 29 L4 31 L12 33 Z" fill="#3e2723"/>
    <path d="M22 40 l-1.5 3.5 M28 41 l0 4 M34 40 l1.5 3.5" stroke="#3e2723" stroke-width=".5" fill="none" stroke-linecap="round"/>
    <ellipse cx="28" cy="30" rx="17" ry="11" fill="#ffca28"/>
    <g clip-path="url(#${id})" fill="#3e2723">
      <rect x="17" y="15" width="5" height="30"/><rect x="27" y="15" width="5" height="30"/><rect x="37" y="15" width="4" height="30"/>
    </g>
    <ellipse cx="28" cy="30" rx="17" ry="11" fill="none" stroke="#3e2723" stroke-width="1"/>
    <circle cx="47" cy="28" r="7" fill="#3e2723"/>
    <circle cx="49.5" cy="26" r="1.8" fill="#fff"/>
    <path d="M49 22 Q51 15 55 13 M47 21 Q47 14 50 11" stroke="#3e2723" stroke-width=".8" fill="none" stroke-linecap="round"/>
    <g class="bee-wing near">${wing(30, 15)}</g>
  </svg>`;
}

for (let i = 0; i < 5; i++) {
  const el = document.createElement('div');
  // Ưu tiên lượn gần các góc có hoa; ong ở góc phải bay sang trái trước nên quay đầu sang trái
  const [cx, cy] = pick(corners);
  el.className = 'bee' + (cx ? ' left' : '');
  const dur = rand(7, 12);
  el.style.left = `${cx ? rand(70, 88) : rand(4, 22)}%`;
  el.style.top = `${cy ? rand(60, 82) : rand(8, 30)}%`;
  el.style.setProperty('--size', `${rand(32, 46)}px`);
  el.style.setProperty('--dx', `${rand(80, 160) * (cx ? -1 : 1)}px`);
  el.style.setProperty('--dy', `${rand(-60, 60)}px`);
  el.style.setProperty('--dur', `${dur}s`);
  el.style.setProperty('--delay', `${-rand(0, dur)}s`);
  el.innerHTML = `<div class="buzz">${beeSVG()}</div>`;
  decor.appendChild(el);
}

