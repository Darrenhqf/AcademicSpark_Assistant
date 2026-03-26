(function(){
  const BOT_SVG = '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="7" width="14" height="10" rx="2.5" fill="#61686b"/><rect x="7" y="4" width="6" height="5" rx="1.5" fill="#838b8e"/><circle cx="7.5" cy="11.5" r="1.5" fill="#a1c5c1"/><circle cx="12.5" cy="11.5" r="1.5" fill="#a1c5c1"/><rect x="8" y="14" width="4" height="1.2" rx="0.6" fill="#a1c5c1"/><line x1="10" y1="4" x2="10" y2="2.5" stroke="#61686b" stroke-width="1.2"/><circle cx="10" cy="2" r="1" fill="#61686b"/><line x1="3" y1="11" x2="1" y2="11" stroke="#61686b" stroke-width="1.2"/><line x1="17" y1="11" x2="19" y2="11" stroke="#61686b" stroke-width="1.2"/></svg>';
  const USER_SVG = '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.2" fill="#ff7a00" opacity=".75"/><path d="M4.6 16.8c.9-3 3-4.7 5.4-4.7s4.5 1.7 5.4 4.7" stroke="#ff7a00" stroke-width="1.8" stroke-linecap="round"/></svg>';
///////set message avatar ////////////////////
  function setAvatars(){
    document.querySelectorAll('[data-bot]').forEach(el=>el.innerHTML=BOT_SVG);
    document.querySelectorAll('[data-user]').forEach(el=>el.innerHTML=USER_SVG);
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
const CODESIGN_VALUES = [
  { key: 'privacy', label: 'Privacy', system: 'Low' },
  { key: 'informed_consent', label: 'Informed Consent', system: 'Low' },
  { key: 'autonomy', label: 'Autonomy', system: 'Medium' },
  { key: 'courtesy', label: 'Courtesy', system: 'High' },
  { key: 'universal_usability', label: 'Universal Usability', system: 'High' }
];

let codesignMode = 'system';

let codesignUserValues = {
  privacy: 'Low',
  informed_consent: 'Low',
  autonomy: 'Medium',
  courtesy: 'High',
  universal_usability: 'High'
};
/////////// Co-design ////////////////////
  function buildCodesign(force = false) {
  const svg = document.getElementById('codesignSvg');
  if (!svg) return;
  if (svg.dataset.ready && !force) return;

 const data = CODESIGN_VALUES.map(item => ({
  key: item.key,
  label: item.label,
  level: codesignMode === 'system' ? item.system : codesignUserValues[item.key]
}));

  const levelIndex = {
    Low: 1,
    Medium: 2,
    High: 3
  };

  const colors = {
    Low: '#d9b09f',
    Medium: '#eccd93',
    High: '#b7d69d'
  };

const cx = 185;
const cy = 142;
const innerHole = 26;
const ringStep = 24;
const maxR = innerHole + ringStep * 3;
const labelR = maxR ;

  const startAngle = -Math.PI / 2;
  const full = Math.PI * 2;
  const gap = 0.12;
  const sector = full / data.length;

  function polarToCartesian(r, angle) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  }

  function ringSectorPath(r0, r1, a0, a1) {
    const p1 = polarToCartesian(r0, a0);
    const p2 = polarToCartesian(r1, a0);
    const p3 = polarToCartesian(r1, a1);
    const p4 = polarToCartesian(r0, a1);
    const largeArc = (a1 - a0) > Math.PI ? 1 : 0;

    return [
      `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
      `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
      `A ${r1} ${r1} 0 ${largeArc} 1 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
      `L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
      `A ${r0} ${r0} 0 ${largeArc} 0 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
      'Z'
    ].join(' ');
  }

  let html = '';

  for (let ring = 1; ring <= 3; ring++) {
    const r = innerHole + ringStep * ring;
    html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(189,196,198,0.35)" stroke-width="1" stroke-dasharray="3 3"/>`;
  }

  html += `<circle cx="${cx}" cy="${cy}" r="${innerHole}" fill="rgba(245,248,250,0.95)" stroke="rgba(189,196,198,0.5)" stroke-width="1.5"/>`;

  data.forEach((item, i) => {
    const centerAngle = startAngle + i * sector;
    const a0 = centerAngle - sector / 2 + gap / 2;
    const a1 = centerAngle + sector / 2 - gap / 2;
    const level = levelIndex[item.level];

for (let ring = 1; ring <= level; ring++) {
  const r0 = innerHole + ringStep * (ring - 1);
  const r1 = innerHole + ringStep * ring;
  const fill = ring === 1 ? colors.Low : ring === 2 ? colors.Medium : colors.High;

  html += `
    <path
      d="${ringSectorPath(r0, r1, a0, a1)}"
      fill="${fill}"
      fill-opacity="0.82"
      stroke="none"
    />
  `;
}

for (let ring = 1; ring <= 3; ring++) {
  const r0 = innerHole + ringStep * (ring - 1);
  const r1 = innerHole + ringStep * ring;
  const levelName = ring === 1 ? 'Low' : ring === 2 ? 'Medium' : 'High';

  html += `
    <path
      d="${ringSectorPath(r0, r1, a0, a1)}"
      fill="transparent"
      class="codesign-hit ${codesignMode === 'user' ? 'is-editable' : ''}"
      data-key="${item.key}"
      data-label="${item.label}"
      data-value="${levelName}"
      data-current="${item.level}"
    />
  `;
}

    const axisEnd = polarToCartesian(maxR + 2, centerAngle);
    html += `
      <line
        x1="${cx}" y1="${cy}"
        x2="${axisEnd.x.toFixed(2)}" y2="${axisEnd.y.toFixed(2)}"
        stroke="rgba(189,196,198,0.45)"
        stroke-width="1.2"
      />
    `;

    const labelPt = polarToCartesian(labelR, centerAngle);
    let anchor = 'middle';
    const cos = Math.cos(centerAngle);
    if (cos > 0.25) anchor = 'start';
    if (cos < -0.25) anchor = 'end';

    html += `
      <text
        x="${labelPt.x.toFixed(2)}"
        y="${labelPt.y.toFixed(2)}"
        text-anchor="${anchor}"
        class="codesign-axis-label"
      >${item.label}</text>
    `;
  });

  const lowLabelR = innerHole + ringStep * 1;
const medLabelR = innerHole + ringStep * 2;
const highLabelR = innerHole + ringStep * 3;

html += `
  <text x="${cx}" y="${cy - lowLabelR + 12}" text-anchor="middle" class="codesign-ring-label">Low</text>
  <text x="${cx}" y="${cy - medLabelR + 12}" text-anchor="middle" class="codesign-ring-label">Medium</text>
  <text x="${cx}" y="${cy - highLabelR + 12}" text-anchor="middle" class="codesign-ring-label">High</text>
`;

  svg.innerHTML = html;
  const tooltip = document.getElementById('codesignTooltip');

svg.querySelectorAll('.codesign-hit').forEach(el => {
  el.addEventListener('mouseenter', e => {
    if (!tooltip) return;
    tooltip.style.display = 'block';
    tooltip.innerHTML = `<strong>${el.dataset.label}</strong> — Level: <strong>${el.dataset.value}</strong>`;
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY - 12) + 'px';
  });

  el.addEventListener('mousemove', e => {
    if (!tooltip) return;
    tooltip.style.left = (e.clientX + 12) + 'px';
    tooltip.style.top = (e.clientY - 12) + 'px';
  });

  el.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.style.display = 'none';
  });

  if (codesignMode === 'user') {
    el.style.cursor = 'pointer';

    el.addEventListener('click', () => {
      const key = el.dataset.key;
      const value = el.dataset.value;
      codesignUserValues[key] = value;
      buildCodesign(true);
      updateCodesignFootnote();
    });
  }
});
  svg.dataset.ready = '1';
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
function updateCodesignFootnote() {
  const footnote = document.getElementById('codesignPanelFootnote');
  if (!footnote) return;

  if (codesignMode === 'user') {
    footnote.textContent = 'In user defined mode, click the relevant value ring in the chart to adjust it.';
  } else {
    footnote.textContent = 'Value ratings reflect the co-design chart setting used in this prototype.';
  }
}
function bindCodesignModeToggle() {
  const toggle = document.getElementById('codesignModeToggle');
  const submitBtn = document.getElementById('codesignSubmitBtn');
  if (!toggle) return;

  updateCodesignFootnote();

  if (submitBtn) {
    submitBtn.classList.toggle('hidden', codesignMode !== 'user');
  }

  toggle.querySelectorAll('.value-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      codesignMode = btn.dataset.mode;

      toggle.querySelectorAll('.value-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (submitBtn) {
        submitBtn.classList.toggle('hidden', codesignMode !== 'user');
      }

      updateCodesignFootnote();
      buildCodesign(true);
    });
  });
}

function getCodesignUserPayload() {
  return {
    participant_base_id: getParticipantBaseId(),
    condition: 'codesign',
    mode: 'user_defined',
    privacy: levelToNumber(codesignUserValues.privacy),
    informed_consent: levelToNumber(codesignUserValues.informed_consent),
    courtesy: levelToNumber(codesignUserValues.courtesy),
    autonomy: levelToNumber(codesignUserValues.autonomy),
    universal_usability: levelToNumber(codesignUserValues.universal_usability)
  };
}
window.submitCodesignValues = async function submitCodesignValues() {
  if (codesignMode !== 'user') {
    alert('Please switch to User defined mode before submitting.');
    return;
  }

  const payload = getCodesignUserPayload();

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

      const btn = document.getElementById('codesignSubmitBtn');
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

 if (pageKey === 'bar') {
  slides = [
    {
      title: 'View the visualisation',
      text: '<strong> Click </strong> the button in the <strong> bottom-right corner</strong> to open the bar chart visualisation panel.',
      visual: `
    <div class="onboarding-screenshot-demo">
      <div class="onboarding-screenshot-note">Bottom-right visualisation button</div>
      <img
        src="../assets/bar-expand-btn.png"
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
  if (!slides.length) return;
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
window.addEventListener('load', () => {
  setAvatars();

  togglePanel('expandBtn', 'barPanel', () => {
    buildBarChart();
    bindBarModeToggle();
  });

  togglePanel('radarExpandBtn', 'radarPanel', () => {
    buildRadarSvg();
    bindRadarModeToggle();
  });

  togglePanel('codesignExpandBtn', 'codesignPanel', () => {
  buildCodesign();
  bindCodesignModeToggle();
});

  const barSubmitBtn = document.getElementById('barSubmitBtn');
  if (barSubmitBtn) {
    barSubmitBtn.addEventListener('click', submitValues);
  }

  const radarSubmitBtn = document.getElementById('radarSubmitBtn');
  if (radarSubmitBtn) {
    radarSubmitBtn.addEventListener('click', submitRadarValues);
  }
  const codesignSubmitBtn = document.getElementById('codesignSubmitBtn');
if (codesignSubmitBtn) {
  codesignSubmitBtn.addEventListener('click', submitCodesignValues);
}
  const pageKey = document.body.dataset.page;
  if (pageKey) {
    initOnboarding(pageKey);
  }
});
})();
