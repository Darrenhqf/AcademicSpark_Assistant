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
///////set message avatar ////////////////////
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
////////// Bar mode state ////////////////////////////
const BAR_VALUES = [
  { key: 'privacy', label: 'Privacy', system: 'Low' },
  { key: 'courtesy', label: 'Courtesy', system: 'High' },
  { key: 'autonomy', label: 'Autonomy', system: 'Medium' },
  { key: 'universal_usability', label: 'Universal Usability', system: 'High' },
  { key: 'informed_consent', label: 'Informed Consent', system: 'Low' }
];

let barMode = 'system';

let barUserValues = {
  privacy: 'Low',
  courtesy: 'High',
  autonomy: 'Medium',
  universal_usability: 'High',
  informed_consent: 'Low'
};
////////// Bar Chart ////////////////////////////
function buildBarChart(force = false) {
  const root = document.getElementById('figmaBarChart');
  if (!root) return;
  if (root.dataset.ready && !force) return;

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

  const rows = BAR_VALUES.map(item => ({
    key: item.key,
    label: item.label,
    current: barMode === 'system' ? item.system : barUserValues[item.key]
  }));

  root.innerHTML = rows.map(r => `
    <div class="fbar-row" data-key="${r.key}">
      <div class="fbar-label">${r.label}</div>
      <div class="fbar-track ${barMode === 'user' ? 'is-editable' : ''}">
        <div class="fbar-seg" data-key="${r.key}" data-value="Low" style="width:33.33%;background:${colors.low}">
          <div class="fbar-tip">Low</div>
        </div>
        <div class="fbar-seg" data-key="${r.key}" data-value="Medium" style="width:33.33%;background:${colors.med}">
          <div class="fbar-tip">Medium</div>
        </div>
        <div class="fbar-seg" data-key="${r.key}" data-value="High" style="width:33.34%;background:${colors.high}">
          <div class="fbar-tip">High</div>
        </div>
        <div class="fbar-current" style="left:0;width:${currentWidthMap[r.current]}%"></div>
      </div>
      <div class="fbar-note">${r.current}</div>
    </div>
  `).join('');

  if (barMode === 'user') {
    root.querySelectorAll('.fbar-seg').forEach(seg => {
      seg.addEventListener('click', () => {
        const key = seg.dataset.key;
        const value = seg.dataset.value;
        barUserValues[key] = value;
        buildBarChart(true);
      });
    });
  }

  root.dataset.ready = '1';
}

////////// Bind bar mode toggle ////////////////////////////
function bindBarModeToggle() {
  const toggle = document.getElementById('barModeToggle');
  const legend = document.getElementById('barLegend');
  const submitBtn = document.getElementById('barSubmitBtn');
  if (!toggle) return;

  updateBarFootnote();

  if (submitBtn) {
    submitBtn.classList.toggle('hidden', barMode !== 'user');
  }

  toggle.querySelectorAll('.value-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      barMode = btn.dataset.mode;

      toggle.querySelectorAll('.value-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (legend) {
        legend.style.display = '';
      }

      if (submitBtn) {
        submitBtn.classList.toggle('hidden', barMode !== 'user');
      }

      updateBarFootnote();
      buildBarChart(true);
    });
  });
}

function updateBarFootnote() {
  const footnote = document.getElementById('barPanelFootnote');
  if (!footnote) return;

  if (barMode === 'user') {
    footnote.textContent = 'In user defined mode, click a bar segment to adjust the value.';
  } else {
    footnote.textContent = 'Value ratings were evaluated using an LLM-as-a-Judge approach, with GPT-4 as the evaluating model.';
  }
}
///////For Radar chart footnote////////////////////////
function updateRadarFootnote() {
  const footnote = document.getElementById('radarPanelFootnote');
  if (!footnote) return;

  if (radarMode === 'user') {
    footnote.textContent = 'In user defined mode, drag a radar point to adjust the value.';
  } else {
    footnote.textContent = 'Value ratings were evaluated using an LLM-as-a-Judge approach, with GPT-4 as the evaluating model.';
  }
}
///// For blind Radar toggle//////////////////////////
function bindRadarModeToggle() {
  const toggle = document.getElementById('radarModeToggle');
  const submitBtn = document.getElementById('radarSubmitBtn');
  if (!toggle) return;

  updateRadarFootnote();

  if (submitBtn) {
    submitBtn.classList.toggle('hidden', radarMode !== 'user');
  }

  toggle.querySelectorAll('.value-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      radarMode = btn.dataset.mode;

      toggle.querySelectorAll('.value-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (submitBtn) {
        submitBtn.classList.toggle('hidden', radarMode !== 'user');
      }

      updateRadarFootnote();
      buildRadarSvg(true);
    });
  });
}
/////// get radar user defiend value //////////////
function getRadarUserPayload() {
  return {
    participant_base_id: getParticipantBaseId(),
    condition: 'radar',
    mode: 'user_defined',
    privacy: levelToNumber(radarUserValues.privacy),
    informed_consent: levelToNumber(radarUserValues.informed_consent),
    courtesy: levelToNumber(radarUserValues.courtesy),
    autonomy: levelToNumber(radarUserValues.autonomy),
    universal_usability: levelToNumber(radarUserValues.universal_usability)
  };
}
//////////// Radar mode state ////////////////////////////
const RADAR_VALUES = [
  { key: 'privacy', label: 'Privacy', system: 'Low' },
  { key: 'courtesy', label: 'Courtesy', system: 'High' },
  { key: 'autonomy', label: 'Autonomy', system: 'Medium' },
  { key: 'universal_usability', label: 'Universal Usability', system: 'High' },
  { key: 'informed_consent', label: 'Informed Consent', system: 'Low' }
];

let radarMode = 'system';

let radarUserValues = {
  privacy: 'Low',
  courtesy: 'High',
  autonomy: 'Medium',
  universal_usability: 'High',
  informed_consent: 'Low'
};

function nextLevel(level) {
  if (level === 'Low') return 'Medium';
  if (level === 'Medium') return 'High';
  return 'Low';
}
function snapRadarLevelFromRatio(ratio) {
  const levels = [
    { name: 'Low', value: 0.3333 },
    { name: 'Medium', value: 0.6666 },
    { name: 'High', value: 1 }
  ];

  let closest = levels[0];
  let minDiff = Math.abs(ratio - levels[0].value);

  for (let i = 1; i < levels.length; i++) {
    const diff = Math.abs(ratio - levels[i].value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = levels[i];
    }
  }

  return closest.name;
}
////////// Radar Chart ////////////////////////////
  function buildRadarSvg(force = false) {
  const svg = document.getElementById('radarSvg');
  const tooltip = document.getElementById('radarTooltip');
  if (!svg) return;
  if (svg.dataset.ready && !force) return;

  const radarData = RADAR_VALUES.map(item => ({
  key: item.key,
  label: item.label,
  current: radarMode === 'system' ? item.system : radarUserValues[item.key]
}));

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
    html += `<circle cx="${x}" cy="${y}" r="14" fill="transparent" class="radar-hit ${radarMode === 'user' ? 'is-editable' : ''}" data-key="${d.key}" data-label="${d.label}" data-cur="${d.current}"/>`;
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

    if (d.label === 'Courtesy') {
      dx = 26;
      dy = 6;
      anchor = 'end';
    }
    if (d.label === 'Informed Consent') {
      dx = 19;
      dy = 10;
      anchor = 'end';
    }
    if (d.label === 'Universal Usability') {
      dx = 10;
      dy = -18;
      anchor = 'end';
    }
    if (d.label === 'Autonomy') {
      dx = -12;
      dy = -18;
      anchor = 'start';
    }

    if (d.label === 'Privacy') {
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

let draggingRadarKey = null;

const radarTooltipOffsetX = 2;
const radarTooltipOffsetY = -100;

svg.querySelectorAll('.radar-hit').forEach((el, index) => {
  el.addEventListener('mouseenter', e => {
    if (!tooltip || draggingRadarKey) return
    tooltip.style.display = 'block';
    tooltip.innerHTML = `<strong>${el.dataset.label}</strong> — Current: <strong>${el.dataset.cur}</strong>`;
    tooltip.style.left = (e.clientX + radarTooltipOffsetX) + 'px';
    tooltip.style.top = (e.clientY + radarTooltipOffsetY) + 'px';
  });

  el.addEventListener('mousemove', e => {
    if (!tooltip || draggingRadarKey) return;
    tooltip.style.left = (e.clientX + radarTooltipOffsetX) + 'px';
    tooltip.style.top = (e.clientY + radarTooltipOffsetY) + 'px';
  });

  el.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.style.display = 'none';
  });

  if (radarMode === 'user') {
    el.style.cursor = 'grab';

    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      draggingRadarKey = el.dataset.key;
      document.body.style.userSelect = 'none';

      const onMove = (moveEvent) => {
        const svgRect = svg.getBoundingClientRect();

        const scaleX = svg.viewBox.baseVal.width / svgRect.width;
        const scaleY = svg.viewBox.baseVal.height / svgRect.height;

        const mx = (moveEvent.clientX - svgRect.left) * scaleX;
        const my = (moveEvent.clientY - svgRect.top) * scaleY;

        const vx = mx - cx;
        const vy = my - cy;

        const angle = angles[index];
        const axisX = Math.cos(angle);
        const axisY = Math.sin(angle);

        let proj = vx * axisX + vy * axisY;
        proj = Math.max(R * 0.3333, Math.min(R, proj));

        const ratio = proj / R;
        const snappedLevel = snapRadarLevelFromRatio(ratio);

        radarUserValues[draggingRadarKey] = snappedLevel;

      if (tooltip) {
        tooltip.style.display = 'block';
        tooltip.innerHTML = `<strong>${el.dataset.label}</strong> — Current: <strong>${snappedLevel}</strong>`;
      tooltip.style.left = (moveEvent.clientX + 14) + 'px';
      tooltip.style.top = (moveEvent.clientY - 10) + 'px';
    }
buildRadarSvg(true);
      };

      const onUp = () => {
  draggingRadarKey = null;
  document.body.style.userSelect = '';
  if (tooltip) tooltip.style.display = 'none';

  document.removeEventListener('mousemove', onMove);
  document.removeEventListener('mouseup', onUp);

  buildRadarSvg(true);
  updateRadarFootnote();
};

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }
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
///////// User defined value and collected the data ///////////
function getParticipantBaseId() {
  return localStorage.getItem('participantBaseId') || '';
}

function setParticipantBaseId(baseId) {
  if (baseId) {
    localStorage.setItem('participantBaseId', baseId);
  }
}

function levelToNumber(level) {
  if (level === 'Low') return 1;
  if (level === 'Medium') return 2;
  if (level === 'High') return 3;
  return null;
}

function getBarUserPayload() {
  return {
    participant_base_id: getParticipantBaseId(),
    condition: 'bar',
    mode: 'user_defined',
    privacy: levelToNumber(barUserValues.privacy),
    informed_consent: levelToNumber(barUserValues.informed_consent),
    courtesy: levelToNumber(barUserValues.courtesy),
    autonomy: levelToNumber(barUserValues.autonomy),
    universal_usability: levelToNumber(barUserValues.universal_usability)
  };
}

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx8cpgJWhH7wo_em-oY_XY26QcEfXp_lISyyJQJYLbS3mmlonGACNIbptD81sIE0a2JZg/exec';

window.submitValues = async function submitValues() {
  if (barMode !== 'user') {
    alert('Please switch to User defined mode before submitting.');
    return;
  }

  const payload = getBarUserPayload();

  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      if (result.participant_base_id) {
        setParticipantBaseId(result.participant_base_id);
      }

      const btn = document.getElementById('barSubmitBtn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Submitted';
      }

      alert('Submitted successfully: ' + result.participant_id + '. Please do not submit again.');
      console.log(result);
    } else {
      alert('Submit failed: ' + result.error);
      console.log(result);
    }
  } catch (err) {
    alert('Network error: ' + err.message);
    console.error(err);
  }
};

window.submitRadarValues = async function submitRadarValues() {
  if (radarMode !== 'user') {
    alert('Please switch to User defined mode before submitting.');
    return;
  }

  const payload = getRadarUserPayload();

  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      if (result.participant_base_id) {
        setParticipantBaseId(result.participant_base_id);
      }

      const btn = document.getElementById('radarSubmitBtn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Submitted';
      }

      alert('Submitted successfully: ' + result.participant_id + '. Please do not submit again.');
      console.log(result);
    } else {
      alert('Submit failed: ' + result.error);
      console.log(result);
    }
  } catch (err) {
    alert('Network error: ' + err.message);
    console.error(err);
  }
};
////////// Onborading panel ////////////////////////////
function initOnboarding(pageKey) {
  const overlay = document.getElementById('onboardingOverlay');
  const step = document.getElementById('onboardingStep');
  const title = document.getElementById('onboardingTitle');
  const text = document.getElementById('onboardingText');
  const visual = document.getElementById('onboardingVisual');
  const backBtn = document.getElementById('onboardingBackBtn');
  const nextBtn = document.getElementById('onboardingNextBtn');
  const closeBtn = document.getElementById('onboardingCloseBtn');
  const guideBtn = document.getElementById('floatingGuideBtn');

  if (!overlay || !step || !title || !text || !visual || !backBtn || !nextBtn || !closeBtn || !guideBtn) return;

let slides = [];

if (pageKey === 'baseline') {
  slides = [
    {
    title: 'Explore the visualisation conditions',
    text: 'Use the toggle at the <strong>top</strong> of the page to <strong>switch</strong> between Baseline, Bar, Radar, and Co-design.',
    visual:  `
  <div class="onboarding-screenshot-demo">
    <div class="onboarding-screenshot-note">Use the top toggle to switch conditions</div>
    <img
      src="../assets/baseline-toggle.png"
      alt="Top toggle for switching between Baseline, Bar, Radar, and Co-design"
      class="onboarding-screenshot-img onboarding-toggle-screenshot"
    />
  </div>
`
  }
  ];
} else if (pageKey === 'bar') {
  slides = [
    {
      title: 'View the visualisation',
      text: '<strong> Click </strong> the button in the <strong> bottom-right corner</strong> to open the bar chart visualisation panel.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Bottom-right visualisation button</div>
      <img
        src="./assets/bar-expand-btn.png"
        alt="Bar chart expand button"
        class="onboarding-screenshot-img"
      />
    </div>
  `
    },
    {
      title: 'Edit the values',
      text: '<strong>Switch</strong> from System defined to <strong> User defined</strong> if you want to adjust the value levels based on your own judgement.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Switch to User defined to edit the values</div>
      <img
        src="../assets/bar-mode-toggle.png"
        alt="System defined and User defined toggle"
        class="onboarding-screenshot-img onboarding-toggle-screenshot"
      />
    </div>
  `
    },
    {
      title: 'Submit your response',
      text: 'If you disagree with the default levels, <strong> click </strong> the relevant value scale in the bar chart to change it to Low, Medium, or High, then <strong> click </strong> Submit to save your response.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Submit your updated values</div>
      <img
        src="../assets/bar-submit-button.png"
        alt="Submit button for bar chart values"
        class="onboarding-screenshot-img onboarding-submit-screenshot"
      />
    </div>
  `
    }
  ];
} else if (pageKey === 'radar') {
  slides = [
    {
      title: 'View the visualisation',
      text: '<strong>Click</strong> the button in the <strong>bottom-right corner</strong> to open the radar chart visualisation panel.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Bottom-right visualisation button</div>
      <img
        src="../assets/radar-expand-btn.png"
        alt="Radar chart expand button"
        class="onboarding-screenshot-img"
      />
    </div>
  `
    },
    {
      title: 'Edit the values',
      text: '<strong> Switch </strong> from System defined to <strong>User defined</strong> if you want to adjust the value levels based on your own judgement.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Switch to User defined to edit the values</div>
      <img
        src="../assets/bar-mode-toggle.png"
        alt="System defined and User defined toggle"
        class="onboarding-screenshot-img onboarding-toggle-screenshot"
      />
    </div>
  `
    },
    {
      title: 'Submit your response',
      text: 'If you disagree with the default levels, <strong> drag </strong> the relevant value scale in the radar chart to change it to Low, Medium, or High, then <strong>click</strong> Submit to save your response.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Submit your updated values</div>
      <img
        src="../assets/bar-submit-button.png"
        alt="Submit button for radar chart values"
        class="onboarding-screenshot-img onboarding-submit-screenshot"
      />
    </div>
  `
    }
  ];
} else if (pageKey === 'codesign') {
  slides = [
    {
      title: 'View the visualisation',
      text: '<strong>Click</strong>the button in the <strong> bottom-right corner</strong> to open the co-design visualisation panel.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Bottom-right visualisation button</div>
      <img
        src="../assets/co-expand-btn.png"
        alt="co-design chart expand button"
        class="onboarding-screenshot-img"
      />
    </div>
  `
    },
    {
      title: 'Edit the values',
      text: '<strong>Switch</strong> from System defined to <strong>User defined</strong> if you want to adjust the value levels based on your own judgement.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Switch to User defined to edit the values</div>
      <img
        src="../assets/bar-mode-toggle.png"
        alt="System defined and User defined toggle"
        class="onboarding-screenshot-img onboarding-toggle-screenshot"
      />
    </div>
  `
    },
    {
      title: 'Submit your response',
      text: 'If you disagree with the default levels, <strong> click </strong> the relevant value scale in the co-design chart to change it to Low, Medium, or High, then <strong>click</strong> Submit to save your response.',
      visual:  `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Submit your updated values</div>
      <img
        src="../assets/bar-submit-button.png"
        alt="Submit button for co-design chart values"
        class="onboarding-screenshot-img onboarding-submit-screenshot"
      />
    </div>
  `
    }
  ];
}

  let currentIndex = 0;

  function renderSlide() {
    const current = slides[currentIndex];
    step.textContent = `Step ${currentIndex + 1} of ${slides.length}`;
    title.textContent = current.title;
    text.innerHTML = current.text;
    visual.innerHTML = current.visual;

    backBtn.classList.toggle('hidden', currentIndex === 0);
    nextBtn.textContent = currentIndex === slides.length - 1 ? 'Got it' : 'Next';
  }

  function openOnboarding(resetToStart = true) {
    if (resetToStart) currentIndex = 0;
    renderSlide();
    overlay.classList.remove('hidden');
    guideBtn.classList.remove('hidden');
  }

  function closeOnboarding() {
    overlay.classList.add('hidden');
    guideBtn.classList.remove('hidden');
  }

  backBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderSlide();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      currentIndex += 1;
      renderSlide();
    } else {
      closeOnboarding();
    }
  });

  closeBtn.addEventListener('click', closeOnboarding);

  guideBtn.addEventListener('click', () => {
    openOnboarding(true);
  });

  openOnboarding(true);
}
////////////// Even listener for the chat button //////////////
window.addEventListener('resize', movePill);

window.addEventListener('load', () => {
  setAvatars();
  movePill();
  ['baseline', 'bar', 'radar', 'codesign'].forEach(bindChat);

  togglePanel('expandBtn', 'barPanel', () => {
    buildBarChart();
    bindBarModeToggle();
  });

  togglePanel('radarExpandBtn', 'radarPanel', () => {
    buildRadarSvg();
    bindRadarModeToggle();
  });

  togglePanel('codesignExpandBtn', 'codesignPanel', buildCodesign);

  const barSubmitBtn = document.getElementById('barSubmitBtn');
  if (barSubmitBtn) {
    barSubmitBtn.addEventListener('click', submitValues);
  }

  const radarSubmitBtn = document.getElementById('radarSubmitBtn');
  if (radarSubmitBtn) {
    radarSubmitBtn.addEventListener('click', submitRadarValues);
  }

  const pageKey = document.body.dataset.page;
  if (pageKey) {
    initOnboarding(pageKey);
  }
});
})();
