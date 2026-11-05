const dist = (v) => {
  const r = v.getBoundingClientRect();
  return Math.abs(r.top + r.height / 2 - innerHeight / 2);
};

const current = () => [...document.querySelectorAll('video')]
  .filter((v) => { const r = v.getBoundingClientRect(); return r.height && r.bottom > 0 && r.top < innerHeight; })
  .sort((a, b) => dist(a) - dist(b))[0];

const act = (change) => {
  const v = current();
  if (!v) return;
  const d = v.dataset;
  change(d);

  const deg = +d.rot || 0;
  const r = v.offsetWidth / v.offsetHeight;
  const s = deg % 180 ? (d.fill ? Math.max(r, 1 / r) : Math.min(r, 1 / r)) : 1;
  v.style.transition = 'transform .25s';
  v.style.transform = `scaleX(${d.flip ? -1 : 1}) rotate(${deg}deg) scale(${s})`;
};

const left = (d) => { d.rot = (+d.rot || 0) - 90; };
const right = (d) => { d.rot = (+d.rot || 0) + 90; };
const flip = (d) => { d.flip = d.flip ? '' : '1'; };
const fill = (d) => { d.fill = d.fill ? '' : '1'; };
const reset = (d) => { d.rot = 0; d.flip = ''; d.fill = ''; };

const css = document.createElement('style');
css.textContent = `
  #reel-rotator-btn { position: fixed; bottom: 90px; right: 20px; z-index: 2147483647;
    width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; padding: 0;
    border: 1px solid rgba(255,255,255,.14); background: rgba(38,38,38,.85); color: #fff;
    backdrop-filter: blur(8px); box-shadow: 0 4px 14px rgba(0,0,0,.35); cursor: pointer;
    transition: background .15s, transform .1s; }
  #reel-rotator-btn:hover { background: rgba(70,70,70,.95); }
  #reel-rotator-btn:active { transform: scale(.9); }
  #reel-rotator-btn svg { transition: transform .25s; }
`;
document.head.append(css);

const btn = document.createElement('button');
btn.id = 'reel-rotator-btn';
btn.title = 'Click: turn left (R)\nRight-click: turn right (Shift+R)\nDouble-click: reset (0)\nF: mirror   Z: zoom sideways video';

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const attrs = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
for (const k in attrs) svg.setAttribute(k, attrs[k]);
for (const d of ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5']) {
  const p = document.createElementNS(svg.namespaceURI, 'path');
  p.setAttribute('d', d);
  svg.append(p);
}
btn.append(svg);

let spin = 0;
const turn = (change, deg) => { act(change); spin = deg === null ? 0 : spin + deg; svg.style.transform = `rotate(${spin}deg)`; };
btn.onclick = () => turn(left, -90);
btn.oncontextmenu = (e) => { e.preventDefault(); turn(right, 90); };
btn.ondblclick = () => turn(reset, null);
document.body.append(btn);

addEventListener('keydown', (e) => {
  const t = e.target;
  if (e.ctrlKey || e.metaKey || e.altKey || t.isContentEditable || /INPUT|TEXTAREA/.test(t.tagName)) return;
  const k = e.key.toLowerCase();
  if (k === 'r') act(e.shiftKey ? right : left);
  else if (k === 'f') act(flip);
  else if (k === 'z') act(fill);
  else if (k === '0') act(reset);
});
