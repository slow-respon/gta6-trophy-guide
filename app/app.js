// Leonida Trophy Guide — tracker: checklist with saved progress, filters,
// a spoiler setting, export/import, and a three-stage roadmap to the Platinum.
// All trophy data comes from data/trophies.json, loaded from this app's own files.
const PROGRESS_KEY = 'leonida-trophy-progress-v1';
const SPOILER_KEY = 'leonida-trophy-spoiler-v1';
const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const statusEl = document.getElementById('status');
const spoilerEl = document.getElementById('spoiler');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(loadProgress());
let spoilerOn = loadSpoiler();
spoilerEl.checked = spoilerOn;

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function loadSpoiler() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function kindLabel(kind) {
  return { story: 'Story', missable: 'Missable', collectible: 'Collectible', activity: 'Activity', platinum: 'Platinum' }[kind] ?? kind;
}

function renderRoadmap() {
  const stagesEl = document.getElementById('roadmap-stages');
  stagesEl.replaceChildren();
  for (const stage of doc.roadmap ?? []) {
    const li = document.createElement('li');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.stage}`;
    const h3 = document.createElement('h3');
    h3.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.detail;
    li.append(num, h3, p);
    stagesEl.append(li);
  }
}

function trophyMatches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  const isEarned = earned.has(t.name);
  if (statusEl.value === 'earned' && !isEarned) return false;
  if (statusEl.value === 'remaining' && isEarned) return false;
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = Math.round((done / total) * 100);
  document.getElementById('earned-count').textContent = String(done);
  document.getElementById('bar-fill').style.width = `${pct}%`;
  document.getElementById('progress-pct').textContent = `${pct}% to the Platinum`;
  const counts = {};
  for (const t of trophies) if (earned.has(t.name)) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  document.getElementById('grade-counts').textContent =
    ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => `${counts[g] ?? 0}/${totals[g] ?? 0} ${g}`)
      .join(' · ');
}

function buildTrophyCard(t) {
  const li = document.createElement('li');
  li.className = 'trophy';
  li.dataset.name = t.name;
  const isEarned = earned.has(t.name);
  if (isEarned) li.classList.add('earned');

  const row = document.createElement('div');
  row.className = 'trophy-row';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveProgress();
    renderProgress();
    renderList();
  });

  const body = document.createElement('div');
  body.className = 'trophy-body';
  const name = document.createElement('p');
  name.className = 'trophy-name';
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  const hiddenStory = spoilerOn && t.kind === 'story' && !isEarned;
  if (hiddenStory) {
    name.textContent = 'Hidden story trophy — earn it to reveal';
    name.classList.add('hidden-name');
    desc.textContent = 'Hidden until earned (spoiler setting is on).';
  } else {
    name.textContent = t.name;
    desc.textContent = t.description;
  }

  const tags = document.createElement('div');
  tags.className = 'tags';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = `badge ${t.grade}`;
  gradeBadge.textContent = t.grade;
  tags.append(gradeBadge);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = kindLabel(t.kind);
  tags.append(kindTag);
  if (t.count != null) {
    const countTag = document.createElement('span');
    countTag.className = 'tag count';
    countTag.textContent = `× ${t.count.toLocaleString('en-US')}`;
    tags.append(countTag);
  }
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = '⚠ Missable — only one in the game';
    tags.append(missTag);
  }
  if (isEarned) {
    const earnedTag = document.createElement('span');
    earnedTag.className = 'tag';
    earnedTag.textContent = '✓ Earned';
    tags.append(earnedTag);
  }

  body.append(name, desc, tags);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = 'Read the guide ▾';
  const guide = document.createElement('div');
  guide.className = 'guide';
  guide.hidden = true;
  toggle.addEventListener('click', () => {
    guide.hidden = !guide.hidden;
    toggle.textContent = guide.hidden ? 'Read the guide ▾' : 'Hide the guide ▴';
  });
  const guideText = document.createElement('p');
  guideText.textContent = t.guide;
  guide.append(guideText);
  if (t.missable && t.missable_note) {
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = `⚠ ${t.missable_note}`;
    guide.append(note);
  }
  if (Array.isArray(t.steps) && t.steps.length) {
    const stepsTitle = document.createElement('h4');
    stepsTitle.textContent = 'Steps';
    const steps = document.createElement('ol');
    for (const step of t.steps) {
      const stepEl = document.createElement('li');
      stepEl.textContent = step;
      steps.append(stepEl);
    }
    guide.append(stepsTitle, steps);
  }
  if (Array.isArray(t.sources) && t.sources.length) {
    const sourcesTitle = document.createElement('h4');
    sourcesTitle.textContent = 'Sources';
    const sources = document.createElement('ul');
    sources.className = 'sources';
    for (const s of t.sources) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = s.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = s.name;
      item.append(link);
      sources.append(item);
    }
    guide.append(sourcesTitle, sources);
  }
  body.append(toggle, guide);

  row.append(box, body);
  li.append(row);
  return li;
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  for (const t of shown) listEl.append(buildTrophyCard(t));
  emptyEl.hidden = shown.length !== 0;
  document.getElementById('filter-count').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies`;
}

function renderAll() {
  renderProgress();
  renderList();
}

document.getElementById('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exported_at: new Date().toISOString(), earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    const imported = names.filter((n) => typeof n === 'string' && known.has(n));
    const unknown = names.filter((n) => typeof n === 'string' && !known.has(n)).length;
    if (!window.confirm(`Import ${imported.length} earned trophies? This replaces your current progress.${unknown ? ` (${unknown} unknown names ignored.)` : ''}`)) return;
    earned = new Set(imported);
    saveProgress();
    renderAll();
  } catch {
    window.alert('That file is not a valid Leonida Trophy Guide progress export.');
  }
  event.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (!window.confirm('Reset all progress? This clears every ticked trophy.')) return;
  earned = new Set();
  saveProgress();
  renderAll();
});

spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  saveSpoiler();
  renderList();
});

for (const el of [searchEl, kindEl, gradeEl, statusEl]) el.addEventListener('input', renderList);

document.getElementById('missable-jump').addEventListener('click', () => {
  searchEl.value = 'Positive Mental Attitude';
  kindEl.value = 'missable';
  gradeEl.value = 'all';
  statusEl.value = 'all';
  renderList();
  const card = listEl.querySelector('[data-name="Positive Mental Attitude"]');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const toggle = card.querySelector('.guide-toggle');
    if (toggle) toggle.click();
  }
});

renderRoadmap();
renderAll();

// Deterministic shot mode for screenshots: ?shot=checklist|roadmap|detail|spoiler
// sets up a view and flags window.__shotReady once painted.
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  document.body.classList.add(`shot-${shot}`);
  if (shot === 'checklist') {
    for (const name of ['Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!', 'Top Of The World, Ma', 'In The Beginning…']) earned.add(name);
    saveProgress();
    renderAll();
    const firstCard = listEl.querySelector('.trophy');
    if (firstCard) firstCard.querySelector('.guide-toggle')?.click();
    window.scrollTo(0, 0);
  } else if (shot === 'roadmap') {
    document.getElementById('roadmap').scrollIntoView();
    window.scrollBy(0, -10);
  } else if (shot === 'detail') {
    searchEl.value = 'Positive Mental Attitude';
    kindEl.value = 'missable';
    renderList();
    const card = listEl.querySelector('[data-name="Positive Mental Attitude"]');
    if (card) {
      card.querySelector('.guide-toggle')?.click();
      card.scrollIntoView();
      window.scrollBy(0, -10);
    }
  } else if (shot === 'spoiler') {
    spoilerOn = true;
    spoilerEl.checked = true;
    saveSpoiler();
    kindEl.value = 'story';
    renderList();
    window.scrollTo(0, 0);
  }
}
requestAnimationFrame(() => {
  window.__shotReady = true;
});
