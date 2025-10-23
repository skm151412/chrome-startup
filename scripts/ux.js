/*
  UX Enhancements script
  - Theme toggle with persistence
  - Greeting + live clock update
  - Search suggestions with keyboard nav and ARIA
  - Particles/orbs background (desktop only) with toggle
  - Respects prefers-reduced-motion
*/
(function(){
  const doc = document;
  const root = doc.documentElement;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function qs(sel,ctx=doc){return ctx.querySelector(sel);} 
  function qsa(sel,ctx=doc){return Array.from(ctx.querySelectorAll(sel));}

  function setTheme(theme){
    root.classList.toggle('theme-light', theme === 'light');
    try{ localStorage.setItem('theme', theme);}catch(e){}
    const btn = qs('#theme-toggle');
    if(btn){ btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false'); }
  }
  function getTheme(){
    try{ return localStorage.getItem('theme'); }catch(e){ return null; }
  }

  function initThemeToggle(){
    const btn = qs('#theme-toggle');
    if(!btn) return;
    const saved = getTheme();
    if(saved){ setTheme(saved); }
    btn.addEventListener('click', ()=>{
      const isLight = root.classList.toggle('theme-light');
      try{ localStorage.setItem('theme', isLight ? 'light' : 'dark'); }catch(e){}
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    });
  }

  function updateClock(){
    const clockEl = qs('#live-clock');
    if(!clockEl) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    clockEl.textContent = `${hh}:${mm}`;
  }

  function initGreeting(){
    const el = qs('#editable-text');
    if(!el) return;
    function setGreeting(){
      const h = new Date().getHours();
      const period = (h < 12) ? 'Good Morning' : (h < 18) ? 'Good Afternoon' : 'Good Evening';
      // Only update text content, preserve element and classes
      el.textContent = `${period}, SK ❤️`;
    }
    setGreeting();
    setInterval(setGreeting, 5 * 60 * 1000);
  }

  // Search suggestions
  const SUGGESTIONS = [
    'Open GitHub',
    'Latest Web Dev Tutorials',
    'AI tools for productivity',
    'YouTube WebDev playlist',
    'Unsplash wallpapers',
    'ChatGPT prompts ideas',
    'Perplexity research tips'
  ];

  function initSearch(){
    const input = qs('#search');
    const panel = qs('#search-suggestions');
    if(!input || !panel) return;

    let activeIndex = -1;
    function render(list){
      panel.innerHTML = '';
      list.forEach((text, i)=>{
        const opt = doc.createElement('div');
        opt.setAttribute('role','option');
        opt.id = `opt-${i}`;
        opt.textContent = text;
        opt.addEventListener('mouseenter', ()=>setActive(i));
        opt.addEventListener('mousedown', (e)=>{ e.preventDefault(); selectOption(i) });
        panel.appendChild(opt);
      });
    }

    function setActive(i){
      const items = qsa('[role="option"]', panel);
      items.forEach((el,idx)=> el.classList.toggle('active', idx === i));
      activeIndex = i;
      if(items[i]) items[i].scrollIntoView({block:'nearest'});
    }

    function openPanel(){ panel.hidden = false; input.setAttribute('aria-expanded','true'); }
    function closePanel(){ panel.hidden = true; input.setAttribute('aria-expanded','false'); activeIndex = -1; }

    function filter(){
      const q = input.value.trim().toLowerCase();
      const list = q ? SUGGESTIONS.filter(s=> s.toLowerCase().includes(q)) : SUGGESTIONS;
      render(list);
      if(list.length){ openPanel(); } else { closePanel(); }
    }

    function selectOption(i){
      const items = qsa('[role="option"]', panel);
      const chosen = items[i];
      if(!chosen) return;
      input.value = chosen.textContent;
      closePanel();
      // trigger search
      try{ window.googleSearch(); } catch(e){}
    }

    input.addEventListener('input', filter);
    input.addEventListener('focus', filter);
    input.addEventListener('blur', ()=> setTimeout(closePanel, 100));

    input.addEventListener('keydown', (e)=>{
      const items = qsa('[role="option"]', panel);
      if(panel.hidden || !items.length) return;
      if(e.key === 'ArrowDown'){ e.preventDefault(); setActive((activeIndex+1) % items.length); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); setActive((activeIndex-1+items.length) % items.length); }
      else if(e.key === 'Enter'){ e.preventDefault(); if(activeIndex>=0) selectOption(activeIndex); else try{ window.googleSearch(); }catch(err){} }
      else if(e.key === 'Escape'){ closePanel(); }
    });

    // Initial render hidden
    render(SUGGESTIONS);
    closePanel();
  }

  // Particles/orbs background
  let orbsEnabled = true;
  let orbsCtx = null;
  let rafId = 0;

  function initParticles(){
    const canvas = qs('#bg-orbs');
    if(!canvas) return;
    if(window.innerWidth <= 700) return; // desktop only
    orbsCtx = canvas.getContext('2d');

    function resize(){
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      orbsCtx.setTransform(dpr,0,0,dpr,0,0);
    }
    window.addEventListener('resize', resize);
    resize();

    const count = 22;
    const orbs = Array.from({length: count}).map(()=>({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: 40+Math.random()*80,
      dx: (Math.random()*0.6-0.3),
      dy: (Math.random()*0.6-0.3),
      hue: 180 + Math.random()*140,
      alpha: 0.12 + Math.random()*0.12
    }));

    function tick(){
      if(!orbsEnabled || prefersReduced){ return; }
      orbsCtx.clearRect(0,0,window.innerWidth, window.innerHeight);
      for(const o of orbs){
        o.x += o.dx; o.y += o.dy;
        if(o.x < -200) o.x = window.innerWidth+200; if(o.x > window.innerWidth+200) o.x = -200;
        if(o.y < -200) o.y = window.innerHeight+200; if(o.y > window.innerHeight+200) o.y = -200;
        const grad = orbsCtx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        grad.addColorStop(0, `hsla(${o.hue}, 90%, 60%, ${o.alpha})`);
        grad.addColorStop(1, 'hsla(0,0%,0%,0)');
        orbsCtx.fillStyle = grad;
        orbsCtx.beginPath();
        orbsCtx.arc(o.x, o.y, o.r, 0, Math.PI*2);
        orbsCtx.fill();
      }
      rafId = requestAnimationFrame(tick);
    }

    if(!prefersReduced){ tick(); }
  }

  function initParticlesToggle(){
    const btn = qs('#particles-toggle');
    const canvas = qs('#bg-orbs');
    if(!btn || !canvas) return;
    btn.addEventListener('click', ()=>{
      orbsEnabled = !orbsEnabled;
      btn.setAttribute('aria-pressed', orbsEnabled ? 'true' : 'false');
      if(!orbsEnabled){ cancelAnimationFrame(rafId); const ctx = canvas.getContext('2d'); ctx && ctx.clearRect(0,0,canvas.width,canvas.height); }
      else { initParticles(); }
    });
  }

  // Init after DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    initThemeToggle();
    initGreeting();
    initSearch();
    initParticles();
    initParticlesToggle();
    updateClock();
    setInterval(updateClock, 30 * 1000);
  });
})();
