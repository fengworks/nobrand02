(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let vw = innerWidth, vh = innerHeight;

  /* ---------- Split headings into words (mask reveal) ---------- */
  function splitWords(el, cls) {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            if (cls === 'fw') {
              const s = document.createElement('span'); s.className = 'fw'; s.textContent = p; frag.appendChild(s);
            } else {
              const m = document.createElement('span'); m.className = 'wm';
              const w = document.createElement('span'); w.className = 'wi'; w.style.setProperty('--wi', i++); w.textContent = p;
              m.appendChild(w); frag.appendChild(m);
            }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
  }
  $$('[data-split]').forEach(el => splitWords(el, 'wi'));
  const whyH = $('#whyH'); splitWords(whyH, 'fw');
  const fillWords = $$('.fw', whyH);

  /* ---------- Starburst + marquee build ---------- */
  const bg = $('#burstG');
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2, r1 = 13, r2 = 49;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', 50 + Math.cos(a) * r1); l.setAttribute('y1', 50 + Math.sin(a) * r1);
    l.setAttribute('x2', 50 + Math.cos(a) * r2); l.setAttribute('y2', 50 + Math.sin(a) * r2);
    bg.appendChild(l);
  }
  const star = '<svg viewBox="0 0 100 100"><g stroke="currentColor" stroke-width="10">' +
    Array.from({length: 12}, (_, k) => { const a = k / 12 * Math.PI * 2; return `<line x1="${50 + Math.cos(a) * 10}" y1="${50 + Math.sin(a) * 10}" x2="${50 + Math.cos(a) * 50}" y2="${50 + Math.sin(a) * 50}"/>`; }).join('') + '</g></svg>';
  const mqWords = ['Packaging', 'Website', 'Social Media', 'Marketing', 'Collaterals', 'And More'];
  const mq = $('#mq');
  const mqHalf = mqWords.map(w => `<span class="mq-item">${w}${star}</span>`).join('');
  mq.innerHTML = mqHalf + mqHalf;

  /* ---------- Layout flags ---------- */
  const hpin = $('#hpin'), track = $('#track'), ppin = $('#ppin'), whyPin = $('#whyPin');
  const cards = $$('.card');
  let flags = {};
  function layout() {
    vw = innerWidth; vh = innerHeight;
    const desk = vw >= 1024 && vh >= 600;
    flags = { curtain: desk, pin: desk && !reduce, hpin: desk, ppin: desk && vh >= 640, stack: vw >= 1024 && vh >= 640 };
    root.classList.toggle('curtain-on', flags.curtain);
    root.classList.toggle('pin-on', flags.pin);
    root.classList.toggle('hpin-on', flags.hpin);
    root.classList.toggle('ppin-on', flags.ppin);
    root.classList.toggle('stack-on', flags.stack);
    if (flags.hpin) {
      const last = track.lastElementChild;
      const w = last.offsetLeft + last.offsetWidth;
      track.dataset.dist = Math.max(0, w - vw);
      hpin.style.height = (Math.max(0, w - vw) + vh) + 'px';
    } else { hpin.style.height = ''; track.style.transform = ''; }
    cards.forEach(c => { c.style.transform = ''; c._top = parseFloat(getComputedStyle(c).top) || 0; });
    if (!flags.curtain) { heroIn.style.transform = ''; heroIn.style.opacity = ''; posterIn.style.transform = ''; posterDim.style.opacity = 0; }
    if (!flags.ppin) $$('.stage').forEach(s => s.classList.add('on'));
    root.classList.toggle('no-pin-anim', reduce);
    curStage = -1; mqHalfW = mq.scrollWidth / 2 || 1;
    maxY = document.documentElement.scrollHeight - vh;
  }

  /* ---------- Smooth wheel scrolling (Lenis-style, native scroll underneath) ---------- */
  const smooth = !reduce && finePointer;
  let cur = scrollY, tgt = scrollY, animating = false, lastSet = -1, maxY = 0;
  if (smooth) {
    addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 34; else if (e.deltaMode === 2) d *= vh;
      if (!animating) { cur = tgt = scrollY; }
      tgt = clamp(tgt + d, 0, maxY);
      animating = true;
    }, { passive: false });
  }
  function scrollToY(y) {
    y = clamp(y, 0, maxY);
    if (smooth) { if (!animating) cur = scrollY; tgt = y; animating = true; }
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault();
    const y = id === '#top' ? 0 : t.getBoundingClientRect().top + scrollY;
    scrollToY(y);
  }));

  /* ---------- Reveal on view ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
  $$('[data-r], [data-split]:not(#heroH), #price').forEach(el => io.observe(el));
  const caseIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) en.target.classList.add('seen'); }), { threshold: .35 });
  $$('.case').forEach(c => caseIO.observe(c));

  /* ---------- Hero ---------- */
  const heroIn = $('#heroIn');
  const heroImgs = $$('#heroMedia img');
  let hi = 0;
  setInterval(() => {
    heroImgs[hi].classList.remove('on');
    hi = (hi + 1) % heroImgs.length;
    heroImgs[hi].classList.add('on');
    $('#heroCap').textContent = heroImgs[hi].dataset.cap;
    $('#heroIdx').textContent = String(hi + 1).padStart(2, '0');
  }, 3800);

  /* ---------- Element refs ---------- */
  const why = $('#why'), g2 = $('#g2'), posterIn = $('#posterIn'), posterDim = $('#posterDim'), what = $('#what');
  const pl1 = $('#pl1'), pl2 = $('#pl2'), pl3 = $('#pl3'), posterImg = $('#posterImg'), burst = $('#burst');
  const steps = $$('[data-step]');
  const sheets = $$('.sheet');
  const stagesEl = $$('.stage'), segs = $$('#seg i'), wkN = $('#wkN');
  const cases = $$('.case'), caseImgs = cases.map(c => $('.case-main img', c)), caseN = $('#caseN'), caseBar = $('#caseBar');
  const cardImgs = cards.map(c => $('.card-img img', c)), cardDims = cards.map(c => $('.card-dim', c));
  const pars = $$('[data-par]');
  const themed = [...$$('main [data-theme]'), $('#foot')];
  const startSec = $('#start');
  const nav = $('#nav'), chap = $('#chap'), chapN = $('#chapN'), chapT = $('#chapT'), chapBar = $('#chapBar');
  let curStage = -1, lastNav = '', lastChap = '', prevY = scrollY, vel = 0, mqX = 0, mqDir = 1, navHidden = false, mqHalfW = 1, lastWk = '', lastCase = '';

  function themeAt(y) {
    let hit = null;
    for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) hit = s; }
    return hit;
  }

  /* ---------- Add-ons hover image ---------- */
  const aoFloat = $('#aoFloat'), aoImg = $('#aoImg');
  let mx = vw / 2, my = vh / 2, fx = mx, fy = my;
  if (finePointer) {
    $$('.ao-row').forEach(r => {
      const pre = new Image(); pre.onerror = () => { if (r.dataset.fb && r.dataset.img !== r.dataset.fb) { r.dataset.img = r.dataset.fb; pre.src = r.dataset.fb; } }; pre.src = r.dataset.img;
      r.addEventListener('mouseenter', () => { aoImg.src = r.dataset.img; aoFloat.classList.add('on'); });
      r.addEventListener('mouseleave', () => aoFloat.classList.remove('on'));
    });
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  }

  /* ---------- Main frame loop ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - last) / 1000; last = now;

    if (animating) {
      if (lastSet >= 0 && Math.abs(scrollY - lastSet) > 3) { animating = false; }
      else {
        cur = lerp(cur, tgt, 1 - Math.exp(-dt * 9.5));
        if (Math.abs(tgt - cur) < 0.5) { cur = tgt; animating = false; }
        window.scrollTo(0, cur);
        lastSet = scrollY;
      }
    }
    if (!animating) lastSet = -1;

    const y = scrollY;
    vel = lerp(vel, y - prevY, 0.25); prevY = y;

    // Sheets: rounded top corners flatten as they reach the top
    for (const s of sheets) {
      const t = s.getBoundingClientRect().top;
      if (t > vh * 1.2 || t < -vh) continue;
      s.style.setProperty('--rad', (clamp(t / (vh * 0.45)) * 40).toFixed(1) + 'px');
    }

    // 01 → 02: hero is pushed back as the orange sheet rises
    if (flags.curtain) {
      const p = clamp(1 - why.getBoundingClientRect().top / vh);
      if (p < 1.001) {
        heroIn.style.transform = `translate3d(0,${(-p * 5).toFixed(2)}vh,0) scale(${(1 - p * 0.085).toFixed(4)})`;
        heroIn.style.opacity = (1 - p * 0.75).toFixed(3);
        heroIn.style.borderRadius = (p * 28).toFixed(1) + 'px';
      }
    }

    // 02: word-by-word fill + steps
    {
      let p, fillP;
      if (flags.pin) {
        const r = whyPin.getBoundingClientRect();
        p = clamp(-r.top / (r.height - vh));
        fillP = clamp(p / 0.5);
      } else {
        const r = whyH.getBoundingClientRect();
        fillP = clamp((vh * 0.9 - r.top) / (vh * 0.55));
        p = 1;
      }
      if (reduce) fillP = 1;
      const n = fillWords.length;
      for (let i = 0; i < n; i++) {
        const t = clamp(fillP * (n + 3) - i - 1);
        fillWords[i].style.opacity = (0.16 + 0.84 * t).toFixed(3);
      }
      if (flags.pin) {
        steps.forEach((s, i) => {
          const t = clamp((p - (0.5 + i * 0.13)) / 0.11);
          s.style.opacity = t.toFixed(3);
          s.style.transform = `translate3d(0,${((1 - t) * 34).toFixed(1)}px,0)`;
        });
      } else steps.forEach(s => { s.style.opacity = ''; s.style.transform = ''; });
    }

    // Poster: lines drift in opposite directions, image floats, burst spins; then pushed back by 03
    {
      const gt = g2.getBoundingClientRect().top;
      const pp = clamp((vh - gt) / (vh * 2));
      if (gt < vh * 1.1 && gt > -vh * 1.5) {
        pl1.style.transform = `translate3d(${lerp(-7, 7, pp).toFixed(2)}vw,0,0)`;
        pl2.style.transform = `translate3d(${lerp(9, -9, pp).toFixed(2)}vw,0,0)`;
        pl3.style.transform = `translate3d(${lerp(-5, 5, pp).toFixed(2)}vw,0,0)`;
        posterImg.style.transform = `translate(-50%,-50%) translate3d(0,${lerp(14, -12, pp).toFixed(2)}vh,0) rotate(${lerp(-5, 4, pp).toFixed(2)}deg) scale(${lerp(.86, 1.04, pp).toFixed(3)})`;
        burst.style.transform = `rotate(${(y * 0.09).toFixed(1)}deg)`;
        if (flags.curtain) {
          const pc = clamp(1 - what.getBoundingClientRect().top / vh);
          posterIn.style.transform = `scale(${(1 - pc * 0.07).toFixed(4)})`;
          posterDim.style.opacity = (pc * 0.35).toFixed(3);
        }
      }
    }

    // 03: stacking cards — each card recedes as the next one lands on it
    if (flags.stack) {
      for (let i = 0; i < cards.length; i++) {
        const r = cards[i].getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const ip = clamp((vh - r.top) / (vh + r.height));
        cardImgs[i].style.transform = `scale(1.08) translate3d(0,${lerp(4, -4, ip).toFixed(2)}%,0)`;
        const nx = cards[i + 1];
        if (!nx) continue;
        const nt = nx.getBoundingClientRect().top;
        const p = clamp(1 - (nt - nx._top) / (vh * 0.75));
        cards[i].style.transform = `scale(${(1 - p * 0.05).toFixed(4)})`;
        cardDims[i].style.opacity = (p * 0.28).toFixed(3);
      }
    }

    // 04: horizontal scroll through cases
    if (flags.hpin) {
      const r = hpin.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const dist = +track.dataset.dist || 0;
        const p = clamp(-r.top / (r.height - vh));
        track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
        caseBar.style.transform = `scaleX(${p.toFixed(4)})`;
        let best = 0, bd = 1e9;
        cases.forEach((c, i) => {
          const cr = c.getBoundingClientRect();
          const k = (cr.left + cr.width / 2 - vw / 2) / vw;
          caseImgs[i].style.transform = `translate3d(${(-k * 6).toFixed(2)}%,0,0)`;
          const d = Math.abs(cr.left - vw * 0.08);
          if (d < bd) { bd = d; best = i; }
        });
        const cn = String(best + 1).padStart(2, '0') + ' / 04';
        if (cn !== lastCase) { caseN.textContent = cn; lastCase = cn; }
      }
    }

    // 05: 7-week process
    if (flags.ppin) {
      const r = ppin.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const p = clamp(-r.top / (r.height - vh));
        const si = Math.min(3, Math.floor(p * 4.0001));
        if (si !== curStage) { stagesEl.forEach((s, i) => s.classList.toggle('on', i === si)); curStage = si; }
        segs.forEach((s, i) => s.style.setProperty('--f', clamp(p * 4 - i).toFixed(3)));
        const wk = String(Math.min(7, 1 + Math.floor(p * 7))).padStart(2, '0');
        if (wk !== lastWk) { wkN.textContent = wk; lastWk = wk; }
      }
    }

    // 06: marquee — speeds up with scroll velocity, follows scroll direction
    {
      if (vel > 0.4) mqDir = 1; else if (vel < -0.4) mqDir = -1;
      const half = mqHalfW;
      mqX -= (0.55 + Math.min(40, Math.abs(vel)) * 0.45) * mqDir * dt * 60 * (reduce ? 0 : 1);
      if (mqX <= -half) mqX += half; if (mqX > 0) mqX -= half;
      mq.style.transform = `translate3d(${mqX.toFixed(1)}px,0,0)`;
    }
    if (finePointer) {
      fx = lerp(fx, mx, 1 - Math.exp(-dt * 12)); fy = lerp(fy, my, 1 - Math.exp(-dt * 12));
      aoFloat.style.transform = `translate3d(${(fx + 24).toFixed(1)}px,${(fy - 120).toFixed(1)}px,0)`;
    }

    // Parallax
    if (!reduce) for (const el of pars) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const c = (r.top + r.height / 2 - vh / 2);
      el.style.transform = `translate3d(0,${(c * -parseFloat(el.dataset.par)).toFixed(1)}px,0)`;
    }

    // Nav theme + auto-hide (the CTA always stays)
    const h = themeAt(36);
    const nt = h ? h.dataset.theme : 'dark';
    if (nt !== lastNav) { document.body.dataset.nav = nt; lastNav = nt; }
    if (y > vh * 0.6 && vel > 1.2 && !navHidden) { nav.classList.add('hide'); navHidden = true; }
    else if ((vel < -1.2 || y < vh * 0.6) && navHidden) { nav.classList.remove('hide'); navHidden = false; }

    // Chapter indicator
    const c = themeAt(vh * 0.5);
    if (c) {
      const [n, t] = c.dataset.chap.split('|');
      if (n !== lastChap) { chapN.textContent = n; chapT.textContent = t; lastChap = n; }
      const b = themeAt(vh - 28);
      const bt = b ? b.dataset.theme : 'dark';
      chap.style.setProperty('--chap', bt === 'dark' ? '#fff' : '#0E0E0E');
      chap.classList.toggle('show', y > vh * 0.75 && startSec.getBoundingClientRect().bottom > vh - 60);
    }
    chapBar.style.transform = `scaleX(${clamp(y / (maxY || 1)).toFixed(4)})`;

    requestAnimationFrame(frame);
  }

  /* ---------- FAQ ---------- */
  $$('.qa').forEach(qa => {
    const b = $('.q', qa);
    b.addEventListener('click', () => {
      const open = !qa.classList.contains('open');
      qa.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
      setTimeout(() => { maxY = document.documentElement.scrollHeight - vh; }, 750);
    });
  });

  /* ---------- Lead form (connect to your email automation here) ---------- */
  const form = $('#leadForm'), err = $('#err');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Please enter a valid email · 請輸入有效的電子郵件'; $('#email').focus(); return; }
    if (!$('#agree').checked) { err.textContent = 'Please agree to the data use terms · 請勾選個人資料使用同意'; return; }
    err.textContent = '';
    // TODO: POST { email } to the email / PDF automation (e.g. Mailchimp, HubSpot, Make) before showing success.
    $('#formCard').classList.add('done');
  });
  // TODO: replace with the consultation booking link
  $('#bookBtn').addEventListener('click', e => e.preventDefault());

  /* ---------- Boot ---------- */
  layout();
  addEventListener('resize', () => { layout(); });
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  new ResizeObserver(() => { maxY = document.documentElement.scrollHeight - vh; }).observe(document.body);
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
    $('#heroH').classList.add('in');
  });
  $('#heroH').style.setProperty('--sd', '200ms');
  requestAnimationFrame(frame);
})();
