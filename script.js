(function(){
  const BOT_SVG = '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="14" height="10" rx="2.5" fill="#61686b"/><rect x="7" y="4" width="6" height="5" rx="1.5" fill="#838b8e"/><circle cx="7.5" cy="11.5" r="1.5" fill="#a1c5c1"/><circle cx="12.5" cy="11.5" r="1.5" fill="#a1c5c1"/><rect x="8" y="14" width="4" height="1.2" rx="0.6" fill="#a1c5c1"/><line x1="10" y1="4" x2="10" y2="2.5" stroke="#61686b" stroke-width="1.2"/><circle cx="10" cy="2" r="1" fill="#61686b"/><line x1="3" y1="11" x2="1" y2="11" stroke="#61686b" stroke-width="1.2"/><line x1="17" y1="11" x2="19" y2="11" stroke="#61686b" stroke-width="1.2"/></svg>';
  const USER_SVG = '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.2" fill="#ff7a00" opacity=".75"/><path d="M4.6 16.8c.9-3 3-4.7 5.4-4.7s4.5 1.7 5.4 4.7" stroke="#ff7a00" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const replies = [
    'That sounds manageable. I can turn that into a clearer daily sequence if you want.',
    'A sensible next step is to identify one weak topic and do a timed question on it today.',
    'You do not need to fix everything at once. Start with the highest-pressure topic first.',
    'Good. I would keep the plan realistic and protect one short break in each study block.'
  ];
  let ri = 0;

  function setAvatars(){
    document.querySelectorAll('[data-bot]').forEach(el=>el.innerHTML=BOT_SVG);
    document.querySelectorAll('[data-user]').forEach(el=>el.innerHTML=USER_SVG);
  }

  function movePill(){
    const track = document.getElementById('tt');
    const pill = document.getElementById('tp');
    const active = track?.querySelector('.t-btn.on');
    if(!track || !pill || !active) return;
    pill.style.left = active.offsetLeft + 'px';
    pill.style.width = active.offsetWidth + 'px';
  }

  function bindChat(prefix){
    const ta = document.getElementById(`${prefix}InputTa`);
    const sb = document.getElementById(`${prefix}SendBtn`);
    const ms = document.getElementById(`${prefix}Msgs`);
    const cb = document.getElementById(`${prefix}ChatBody`);
    const tyr = document.getElementById(`${prefix}Typing`);
    if(!ta || !sb || !ms || !cb) return;

    ta.addEventListener('input', ()=>{
      ta.style.height='auto';
      ta.style.height=Math.min(ta.scrollHeight,120)+'px';
      sb.classList.toggle('off', !ta.value.trim());
    });

    function doSend(){
      const text = ta.value.trim();
      if(!text) return;
      const row = document.createElement('div');
      row.className='msg-row user';
      row.innerHTML = `<div class="av u">${USER_SVG}</div><div class="bubble">${text.replace(/</g,'&lt;')}</div>`;
      if(tyr && tyr.parentNode===ms) ms.insertBefore(row, tyr); else ms.appendChild(row);
      ta.value=''; ta.style.height='auto'; sb.classList.add('off'); if(tyr) tyr.classList.add('on'); cb.scrollTop=cb.scrollHeight;
      setTimeout(()=>{
        if(tyr) tyr.classList.remove('on');
        const rb = document.createElement('div');
        rb.className='msg-row bot';
        rb.innerHTML = `<div class="av">${BOT_SVG}</div><div class="bubble">${replies[ri++ % replies.length]}</div>`;
        if(tyr && tyr.parentNode===ms) ms.insertBefore(rb, tyr); else ms.appendChild(rb);
        cb.scrollTop=cb.scrollHeight;
      }, 900 + Math.random()*400);
    }

    sb.addEventListener('click', ()=>{ if(!sb.classList.contains('off')) doSend(); });
    ta.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); doSend(); } });
    setTimeout(()=>{ cb.scrollTop = cb.scrollHeight; }, 120);
  }
////////// Toggle panel for user testing changes ////////////////////////////
  function togglePanel(buttonId, panelId, builder){
  const btn = document.getElementById(buttonId);
  const panel = document.getElementById(panelId);
  if(!btn || !panel) return;

  let built = false;

  btn.setAttribute('aria-expanded', 'false');

  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');

    btn.setAttribute('aria-expanded', open ? 'true' : 'false');

    panel.style.maxHeight = open ? panel.scrollHeight + 20 + 'px' : '0px';

    if (open && !built && typeof builder === 'function') {
      builder();
      built = true;
      panel.style.maxHeight = panel.scrollHeight + 20 + 'px';
    }

    window.dispatchEvent(new Event('resize'));
  });
}
////////// Bar Chart ////////////////////////////
function buildBarChart() {
  const root = document.getElementById('figmaBarChart');
  if (!root || root.dataset.ready) return;

  const rows = [
    { label: 'Trust', current: 'Medium' },
    { label: 'Transparency', current: 'High' },
    { label: 'Autonomy', current: 'Medium' },
    { label: 'Competence', current: 'High' },
    { label: 'Informed Consent', current: 'Medium' }
  ];

  const colors = {
    low: '#d9b09f',
    med: '#eccd93',
    high: '#b7d69d'
  };

  const currentWidthMap = {
    Low: 33.33,
    Medium: 66.66,
    High: 100
  };

  root.innerHTML = rows.map(r => `
    <div class="fbar-row">
      <div class="fbar-label">${r.label}</div>
      <div class="fbar-track">
        <div class="fbar-seg" style="width:33.33%;background:${colors.low}">
          <div class="fbar-tip">Low</div>
        </div>
        <div class="fbar-seg" style="width:33.33%;background:${colors.med}">
          <div class="fbar-tip">Medium</div>
        </div>
        <div class="fbar-seg" style="width:33.34%;background:${colors.high}">
          <div class="fbar-tip">High</div>
        </div>
        <div class="fbar-current" style="left:0;width:${currentWidthMap[r.current]}%"></div>
      </div>
      <div class="fbar-note">${r.current}</div>
    </div>
  `).join('');

  root.dataset.ready = '1';
}
////////// Radar Chart ////////////////////////////
  function buildRadarSvg() {
  const svg = document.getElementById('radarSvg');
  const tooltip = document.getElementById('radarTooltip');
  if (!svg || svg.dataset.ready) return;

  const radarData = [
    { label: 'Trust', current: 'Medium' },
    { label: 'Transparency', current: 'High' },
    { label: 'Autonomy', current: 'Medium' },
    { label: 'Competence', current: 'High' },
    { label: 'Consent', current: 'Medium' }
  ];

  const levelPct = {
    Low: 0.3333,
    Medium: 0.6666,
    High: 1
  };

  const cx = 125;
  const cy = 126;
  const R = 104;
  const N = radarData.length;

  const angles = radarData.map((_, i) => (2 * Math.PI * i / N) - Math.PI / 2);

  const pt = (r, i) =>
    `${(cx + r * Math.cos(angles[i])).toFixed(2)},${(cy + r * Math.sin(angles[i])).toFixed(2)}`;

  const ptObj = (r, i) => ({
    x: cx + r * Math.cos(angles[i]),
    y: cy + r * Math.sin(angles[i])
  });

  const pentagon = (r, fill, stroke, sw) =>
    `<polygon points="${radarData.map((_, i) => pt(r, i)).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

  let html = '';

  html += pentagon(R, 'rgba(183,214,157,0.18)', '#b7d69d', 1.2);
  html += pentagon(R * 0.6666, 'rgba(236,205,147,0.18)', '#eccd93', 1.2);
  html += pentagon(R * 0.3333, 'rgba(217,176,159,0.18)', '#d9b09f', 1.2);

  radarData.forEach((_, i) => {
    const p = ptObj(R, i);
    html += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}" stroke="rgba(189,196,198,0.55)" stroke-width="1"/>`;
  });

  [
    { r: R, text: 'High', color: '#5a9a56' },
    { r: R * 0.6666, text: 'Medium', color: '#a07c2a' },
    { r: R * 0.3333, text: 'Low', color: '#b05a3a' }
  ].forEach(rl => {
    html += `
      <text
        x="${(cx - rl.r * 0.15).toFixed(1)}"
        y="${(cy - rl.r + 10).toFixed(1)}"
        text-anchor="middle"
        font-size="8.5"
        font-family="Geist,Inter,sans-serif"
        font-weight="600"
        fill="${rl.color}"
      >${rl.text}</text>
    `;
  });

  html += `<polygon points="${
    radarData.map((d, i) => pt(levelPct[d.current] * R, i)).join(' ')
  }" fill="rgba(90,20,220,0.18)" stroke="rgba(90,20,220,0.72)" stroke-width="2"/>`;

  radarData.forEach((d, i) => {
    const p = ptObj(levelPct[d.current] * R, i);
    const x = p.x.toFixed(2);
    const y = p.y.toFixed(2);

    html += `<circle cx="${x}" cy="${y}" r="5" fill="rgba(90,20,220,0.80)" stroke="white" stroke-width="1.5"/>`;
    html += `<circle cx="${x}" cy="${y}" r="14" fill="transparent" class="radar-hit" data-label="${d.label}" data-cur="${d.current}"/>`;
  });

  radarData.forEach((d, i) => {
    const p = ptObj(R + 28, i);
    const a = angles[i];

    let anchor =
      Math.cos(a) > 0.25 ? 'start' :
      Math.cos(a) < -0.25 ? 'end' :
      'middle';

    let dx = 0;
    let dy = -10;

    if (d.label === 'Competence') {
      dx = 12;
      dy = -18;
      anchor = 'end';
    }
    if (d.label === 'Consent') {
      dx = 20;
      dy = 15;
      anchor = 'end';
    }
    if (d.label === 'Transparency') {
      dx = 50;
      dy = 15;
      anchor = 'end';
    }
    if (d.label === 'Autonomy') {
      dx = -12;
      dy = -18;
      anchor = 'start';
    }

    if (d.label === 'Trust') {
      dy = 20;
    }

    const tx = p.x + dx;
    const ty = p.y + dy;

    html += `
      <text
        x="${tx.toFixed(2)}"
        y="${ty.toFixed(2)}"
        text-anchor="${anchor}"
        font-size="10.5"
        font-family="Geist,Inter,sans-serif"
        font-weight="600"
        fill="#24252d"
      >${d.label}</text>
    `;
  });

  svg.innerHTML = html;

  svg.querySelectorAll('.radar-hit').forEach(el => {
    el.addEventListener('mouseenter', e => {
      if (!tooltip) return;
      tooltip.style.display = 'block';
      tooltip.innerHTML = `<strong>${el.dataset.label}</strong> — Current: <strong>${el.dataset.cur}</strong>`;
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top = (e.clientY - 10) + 'px';
    });

    el.addEventListener('mousemove', e => {
      if (!tooltip) return;
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top = (e.clientY - 10) + 'px';
    });

    el.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
    });
  });

  svg.dataset.ready = '1';
}
/////////// Co-design ////////////////////
  function buildCodesign() {
  const grid = document.getElementById('codesignGrid');
  if (!grid || grid.dataset.ready) return;

  grid.innerHTML = `
    <div class="codesign-placeholder">
      <div class="codesign-placeholder-inner">
        <div class="codesign-placeholder-title">Design in progress</div>
      </div>
    </div>
  `;

  grid.dataset.ready = '1';
}

  window.addEventListener('resize', movePill);
  window.addEventListener('load', ()=>{
    setAvatars();
    movePill();
    ['baseline','bar','radar','codesign'].forEach(bindChat);
    togglePanel('expandBtn','barPanel',buildBarChart);
    togglePanel('radarExpandBtn','radarPanel',buildRadarSvg);
    togglePanel('codesignExpandBtn','codesignPanel',buildCodesign);
  });
})();
