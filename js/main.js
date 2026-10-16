const cv = document.getElementById('c'), ctx = cv.getContext('2d');

// Each palette: a background colour and three trail colours.
const PALS = [
  {bg:'#0f1a3a', c:['#f4b942','#ff7a90','#cfeaff']},
  {bg:'#2a0f14', c:['#ffb86b','#ff5d5d','#ffe9c7']},
  {bg:'#0b2530', c:['#7fe0d4','#b69cff','#eaf7ff']}
];

let pi = 0, W, H, DPR, parts = [], vort = [], seed = Math.random()*1000, t = 0;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ptr = {x:0, y:0, vx:0, vy:0, on:false};

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  cv.width = W*DPR; cv.height = H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
  fillBg(1);
  const n = Math.min(3200, Math.floor(W*H/450));          // particle count scales with screen
  parts = Array.from({length:n}, () => spawn({}));
}
function spawn(p) {
  p.x = Math.random()*W; p.y = Math.random()*H;
  p.k = Math.random()*3 | 0;                              // which palette colour
  p.life = 200 + Math.random()*400;
  return p;
}
function fillBg(a) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a; ctx.fillStyle = PALS[pi].bg; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

// Smooth flow direction at (x, y): a blend of drifting sine waves.
function angle(x, y) {
  const s = .0026;
  return (Math.sin(x*s + t*.3 + seed) + Math.cos(y*s*1.4 - t*.22)
        + Math.sin((x+y)*s*.7 + t*.15 + seed*2)*1.2) * 1.6;
}

function step() {
  t += .012;
  fillBg(.035);                                           // translucent fade leaves trails
  ctx.globalCompositeOperation = 'lighter';              // additive glow
  ctx.lineWidth = 1.1; ctx.globalAlpha = .55;
  const cols = PALS[pi].c;

  for (const v of vort) v.s *= .994;                      // vortices slowly decay
  vort = vort.filter(v => Math.abs(v.s) > .05);
  ptr.vx *= .9; ptr.vy *= .9;

  for (const p of parts) {
    const a = angle(p.x, p.y);
    let vx = Math.cos(a)*1.5, vy = Math.sin(a)*1.5;

    for (const v of vort) {                               // swirl around each vortex
      const dx = p.x - v.x, dy = p.y - v.y, d = Math.hypot(dx, dy) + 1;
      const f = v.s * Math.exp(-d/240) / (d*.02 + 1);
      vx += -dy/d*f; vy += dx/d*f;
    }
    if (ptr.on) {                                         // stir with the pointer
      const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx*dx + dy*dy;
      if (d2 < 28000) { const f = 1 - d2/28000; vx += ptr.vx*f*.35; vy += ptr.vy*f*.35; }
    }

    const ox = p.x, oy = p.y;
    p.x += vx; p.y += vy;
    ctx.strokeStyle = cols[p.k];
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y); ctx.stroke();
    if (--p.life < 0 || p.x < -10 || p.x > W+10 || p.y < -10 || p.y > H+10) spawn(p);
  }
  ctx.globalAlpha = 1;
}

cv.addEventListener('pointermove', e => {
  if (ptr.on) { ptr.vx = (e.clientX - ptr.x)*1.2; ptr.vy = (e.clientY - ptr.y)*1.2; }
  ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true;
});
cv.addEventListener('pointerleave', () => ptr.on = false);
cv.addEventListener('pointerdown', e => {
  vort.push({x:e.clientX, y:e.clientY, s:(Math.random() < .5 ? -1 : 1)*(7 + Math.random()*4)});
  if (reduce) for (let i = 0; i < 120; i++) step();
});

const settle = () => { if (reduce) for (let i = 0; i < 400; i++) step(); };
document.getElementById('seed').onclick = () => { seed = Math.random()*1000; vort = []; fillBg(1); parts.forEach(spawn); settle(); };
document.getElementById('pal').onclick = () => {
  pi = (pi+1) % PALS.length;
  document.documentElement.style.setProperty('--bg', PALS[pi].bg);
  fillBg(1); settle();
};
document.getElementById('save').onclick = () => {
  const a = document.createElement('a');
  a.download = 'eddy.png'; a.href = cv.toDataURL('image/png'); a.click();
};
addEventListener('resize', resize);

resize();
if (reduce) { for (let i = 0; i < 500; i++) step(); }
else (function loop() { step(); requestAnimationFrame(loop); })();
