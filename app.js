'use strict';

/* ===========================
   STATE
=========================== */
let tasks = [];
let trash = [];
let editId = null;
let view = 'all';
let filter = 'all';
let mSubs = [];
let confirmCallback = null;
let catFilter = null;

/* ===========================
   UTILITIES
=========================== */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const tomorrow = () => { const d = today(); d.setDate(d.getDate() + 1); return d; };

const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const fmtDue = d => {
  if (!d) return '';
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  const diff = Math.round((dd - today()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff <= 7) return `In ${diff} days`;
  return fmt(d);
};

const isOd = t => {
  if (!t.dueDate || t.done) return false;
  const d = new Date(t.dueDate);
  d.setHours(0, 0, 0, 0);
  return d < today();
};

const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };

const pColors = { critical: '#FF4D6D', high: '#FF8C42', medium: '#6C63FF', low: '#00C896' };

const catColors = {
  Work: '#6C63FF', Personal: '#00C896', Study: '#378ADD',
  Health: '#1D9E75', Finance: '#FFB020', Project: '#D85A30', Other: '#888780'
};

const pIcon = { critical: 'ti-flame', high: 'ti-arrow-up', medium: 'ti-minus', low: 'ti-arrow-down' };
const pLabel = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
const pClass = { critical: 'p-critical', high: 'p-high', medium: 'p-medium', low: 'p-low' };

/* ===========================
   STORAGE
=========================== */
const STORAGE_KEY = 'taskflow_v2';

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, trash }));
  } catch (e) {}
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      tasks = d.tasks || [];
      trash = d.trash || [];
      return true;
    }
  } catch (e) {}
  return false;
}

/* ===========================
   SEED DATA
=========================== */
function seed() {
  const d = n => {
    const dd = new Date();
    dd.setDate(dd.getDate() + n);
    return dd.toISOString().slice(0, 10);
  };
  tasks = [
    {
      id: uid(), title: 'Design system architecture for Q3 platform',
      notes: 'Review existing documentation before starting. Include microservices diagram and deployment strategy.',
      priority: 'critical', category: 'Project', dueDate: d(-1), dueTime: '09:00',
      effort: 480, progress: 65, done: false, starred: true, repeat: 'none', tags: ['architecture', 'Q3'],
      subtasks: [
        { id: uid(), text: 'Review existing docs', done: true },
        { id: uid(), text: 'Draw microservices map', done: true },
        { id: uid(), text: 'Write spec document', done: false }
      ],
      created: d(-5), rescheduled: false
    },
    {
      id: uid(), title: 'Submit quarterly financial report',
      notes: 'Compile data from all departments and cross-reference with last quarter.',
      priority: 'high', category: 'Finance', dueDate: d(0), dueTime: '17:00',
      effort: 240, progress: 80, done: false, starred: false, repeat: 'none', tags: ['report', 'finance'],
      subtasks: [
        { id: uid(), text: 'Gather department data', done: true },
        { id: uid(), text: 'Run variance analysis', done: true },
        { id: uid(), text: 'Write executive summary', done: false },
        { id: uid(), text: 'Get CFO approval', done: false }
      ],
      created: d(-3), rescheduled: true
    },
    {
      id: uid(), title: 'Team standup meeting preparation',
      notes: 'Prepare slides and key talking points for the sprint review.',
      priority: 'medium', category: 'Work', dueDate: d(0), dueTime: '09:30',
      effort: 30, progress: 100, done: true, starred: false, repeat: 'daily', tags: [],
      subtasks: [],
      created: d(-1), rescheduled: false
    },
    {
      id: uid(), title: 'Complete online course — Module 4',
      notes: 'Focus on the advanced React patterns section. Take notes for team knowledge share.',
      priority: 'medium', category: 'Study', dueDate: d(2), dueTime: '',
      effort: 120, progress: 30, done: false, starred: false, repeat: 'none', tags: ['learning', 'react'],
      subtasks: [
        { id: uid(), text: 'Watch video lectures (3h)', done: true },
        { id: uid(), text: 'Complete exercises', done: false },
        { id: uid(), text: 'Take final quiz', done: false }
      ],
      created: d(-2), rescheduled: false
    },
    {
      id: uid(), title: 'Morning run — 5km target',
      notes: '',
      priority: 'low', category: 'Health', dueDate: d(1), dueTime: '06:00',
      effort: 45, progress: 0, done: false, starred: false, repeat: 'daily', tags: ['fitness'],
      subtasks: [],
      created: d(0), rescheduled: false
    },
    {
      id: uid(), title: 'Review pull requests for feature branch',
      notes: 'Check code quality, test coverage, and leave constructive comments.',
      priority: 'high', category: 'Work', dueDate: d(1), dueTime: '14:00',
      effort: 60, progress: 0, done: false, starred: true, repeat: 'none', tags: ['code-review'],
      subtasks: [
        { id: uid(), text: 'Review PR #142 — auth module', done: false },
        { id: uid(), text: 'Review PR #145 — dashboard UI', done: false },
        { id: uid(), text: 'Review PR #148 — API endpoints', done: false }
      ],
      created: d(0), rescheduled: false
    },
    {
      id: uid(), title: 'Pay electricity and internet bills',
      notes: '',
      priority: 'high', category: 'Finance', dueDate: d(3), dueTime: '',
      effort: 15, progress: 0, done: false, starred: false, repeat: 'monthly', tags: ['bills'],
      subtasks: [],
      created: d(0), rescheduled: false
    },
    {
      id: uid(), title: 'Grocery shopping',
      notes: 'Fruits, vegetables, cereals, and household supplies.',
      priority: 'low', category: 'Personal', dueDate: d(4), dueTime: '',
      effort: 60, progress: 0, done: false, starred: false, repeat: 'weekly', tags: [],
      subtasks: [
        { id: uid(), text: 'Fruits & vegetables', done: false },
        { id: uid(), text: 'Cereals & bread', done: false },
        { id: uid(), text: 'Household supplies', done: false }
      ],
      created: d(-1), rescheduled: false
    }
  ];
}

/* ===========================
   FILTERING & SORTING
=========================== */
function getFiltered() {
  const q = document.getElementById('srch').value.toLowerCase().trim();
  let list = tasks.filter(t => {
    if (q) {
      const inTitle = t.title.toLowerCase().includes(q);
      const inNotes = (t.notes || '').toLowerCase().includes(q);
      const inTags = (t.tags || []).some(tag => tag.toLowerCase().includes(q));
      const inCat = t.category.toLowerCase().includes(q);
      if (!inTitle && !inNotes && !inTags && !inCat) return false;
    }
    if (catFilter && t.category !== catFilter) return false;
    if (view === 'today') {
      if (!t.dueDate) return false;
      const dd = new Date(t.dueDate);
      dd.setHours(0, 0, 0, 0);
      return dd.getTime() === today().getTime();
    }
    if (view === 'upcoming') {
      if (!t.dueDate) return false;
      const dd = new Date(t.dueDate);
      dd.setHours(0, 0, 0, 0);
      return dd >= tomorrow() && !t.done;
    }
    if (view === 'overdue') return isOd(t);
    return true;
  });

  if (filter === 'done') list = list.filter(t => t.done);
  else if (filter === 'inprogress') list = list.filter(t => !t.done && t.progress > 0 && t.progress < 100);
  else if (filter === 'nodate') list = list.filter(t => !t.dueDate);
  else if (['critical', 'high', 'medium', 'low'].includes(filter)) list = list.filter(t => t.priority === filter);

  const s = document.getElementById('srt').value;
  list.sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    if (s === 'priority') return pOrder[a.priority] - pOrder[b.priority];
    if (s === 'due') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (s === 'progress') return b.progress - a.progress;
    if (s === 'title') return a.title.localeCompare(b.title);
    return new Date(b.created) - new Date(a.created);
  });
  return list;
}

/* ===========================
   RENDER
=========================== */
function render() {
  const el = document.getElementById('tlist');
  if (view === 'analytics') { renderAnalytics(); return; }
  if (view === 'calendar') { renderCalendar(); return; }
  if (view === 'trash') { renderTrash(); return; }

  const list = getFiltered();
  if (!list.length) {
    el.innerHTML = `<div class="empty-state">
      <i class="ti ti-circle-check"></i>
      <p>${filter === 'done' ? 'No completed tasks yet.' : view === 'overdue' ? 'No overdue tasks!' : 'No tasks here.'}</p>
      <p class="empty-hint">${view === 'all' && filter === 'all' ? 'Click "New task" to get started.' : ''}</p>
    </div>`;
    return;
  }

  el.innerHTML = list.map(t => taskCard(t)).join('');
  updateSidebar();
}

function taskCard(t) {
  const pct = t.progress || 0;
  const barCol = pct === 100 ? '#00C896' : pct >= 60 ? '#6C63FF' : pct >= 30 ? '#FFB020' : '#FF4D6D';
  const sdone = (t.subtasks || []).filter(s => s.done).length;
  const stot = (t.subtasks || []).length;
  const dueTxt = fmtDue(t.dueDate);
  const timeTxt = t.dueTime ? ` · ${t.dueTime}` : '';
  const efTxt = t.effort ? ` · ~${t.effort >= 60 ? Math.round(t.effort / 60) + 'h' : t.effort + 'm'}` : '';
  const overdueClass = isOd(t) ? 'overdue' : '';
  const doneClass = t.done ? 'tdone' : '';

  const rescBadge = t.rescheduled
    ? `<span class="resch-badge"><i class="ti ti-calendar-event"></i>Rescheduled</span>` : '';

  const repeatBadge = t.repeat && t.repeat !== 'none'
    ? `<span class="repeat-badge"><i class="ti ti-repeat"></i>${t.repeat}</span>` : '';

  const tagBadges = (t.tags || []).map(tag =>
    `<span class="tagbadge">#${tag}</span>`
  ).join('');

  const subHtml = stot ? `<div class="subtask-list">
    ${(t.subtasks || []).map(s => `
      <div class="sub-item">
        <div class="sub-chk ${s.done ? 'on' : ''}" data-tid="${t.id}" data-sid="${s.id}"></div>
        <span style="${s.done ? 'text-decoration:line-through;opacity:0.45' : ''}">${escHtml(s.text)}</span>
      </div>`).join('')}
  </div>` : '';

  const notesHtml = t.notes ? `<div class="notes-box">${escHtml(t.notes)}</div>` : '';

  const statusLabel = pct === 100 ? '✓ Complete' : pct === 0 ? 'Not started' : 'In progress';
  const progressHint = stot ? `${sdone}/${stot} subtasks · ` : '';

  return `<div class="tcard ${overdueClass} ${doneClass}" data-id="${t.id}">
    <div class="thead">
      <div class="chk ${t.done ? 'on' : ''}" data-action="toggle" data-id="${t.id}">
        ${t.done ? '<i class="ti ti-check"></i>' : ''}
      </div>
      <div class="ttitle ${t.done ? 'struck' : ''}">${escHtml(t.title)}</div>
      <div class="tactions">
        <button class="ibtn fav ${t.starred ? 'on' : ''}" data-action="star" data-id="${t.id}" title="${t.starred ? 'Unstar' : 'Star'}">
          <i class="ti ${t.starred ? 'ti-star' : 'ti-star'}"></i>
        </button>
        <button class="ibtn" data-action="edit" data-id="${t.id}" title="Edit"><i class="ti ti-edit"></i></button>
        <button class="ibtn" data-action="resch" data-id="${t.id}" title="Reschedule"><i class="ti ti-calendar-event"></i></button>
        <button class="ibtn" data-action="dup" data-id="${t.id}" title="Duplicate"><i class="ti ti-copy"></i></button>
        <button class="ibtn del" data-action="del" data-id="${t.id}" title="Move to trash"><i class="ti ti-trash"></i></button>
      </div>
    </div>

    <div class="tmeta">
      <span class="pbadge ${pClass[t.priority]}">
        <i class="ti ${pIcon[t.priority]}"></i>${pLabel[t.priority]}
      </span>
      <span class="catbadge">${t.category}</span>
      ${rescBadge}${repeatBadge}${tagBadges}
      ${dueTxt ? `<span class="duelabel ${isOd(t) ? 'od' : ''}">
        <i class="ti ti-clock"></i>${dueTxt}${timeTxt}${efTxt}
      </span>` : ''}
    </div>

    <div class="prog-wrap">
      <div class="prog-labels">
        <span>${progressHint}${pct}%</span>
        <span class="prog-status" style="color:${barCol}">${statusLabel}</span>
      </div>
      <div class="prog-track">
        <div class="prog-fill" style="width:${pct}%;background:${barCol}"></div>
      </div>
    </div>

    ${subHtml}${notesHtml}
  </div>`;
}

/* ===========================
   ANALYTICS
=========================== */
function renderAnalytics() {
  const el = document.getElementById('tlist');
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const rate = total ? Math.round(done / total * 100) : 0;
  const od = tasks.filter(isOd).length;
  const avgP = total ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / total) : 0;
  const inProg = tasks.filter(t => !t.done && t.progress > 0 && t.progress < 100).length;
  const starred = tasks.filter(t => t.starred).length;

  const byCat = {};
  tasks.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + 1; });
  const byPri = { critical: 0, high: 0, medium: 0, low: 0 };
  tasks.forEach(t => byPri[t.priority]++);

  el.innerHTML = `
  <div class="agrid">
    <div class="acard"><i class="ti ti-list-check acard-icon" style="color:#6C63FF"></i><div class="big">${total}</div><div class="lbl">Total tasks</div></div>
    <div class="acard"><i class="ti ti-circle-check acard-icon" style="color:#00C896"></i><div class="big" style="color:#00C896">${done}</div><div class="lbl">Completed</div></div>
    <div class="acard"><i class="ti ti-chart-pie acard-icon" style="color:#6C63FF"></i><div class="big" style="color:#6C63FF">${rate}%</div><div class="lbl">Completion rate</div></div>
    <div class="acard"><i class="ti ti-alert-triangle acard-icon" style="color:#FF4D6D"></i><div class="big" style="color:#FF4D6D">${od}</div><div class="lbl">Overdue</div></div>
    <div class="acard"><i class="ti ti-clock acard-icon" style="color:#FFB020"></i><div class="big" style="color:#FFB020">${inProg}</div><div class="lbl">In progress</div></div>
    <div class="acard"><i class="ti ti-star acard-icon" style="color:#FFB020"></i><div class="big">${starred}</div><div class="lbl">Starred</div></div>
  </div>

  <div class="two-col">
    <div class="panel">
      <div class="panel-title">Priority breakdown</div>
      ${Object.entries(byPri).map(([p, n]) => `
        <div class="bar-row">
          <div class="bar-label-row">
            <span style="text-transform:capitalize;font-weight:500;color:${pColors[p]}">${p}</span>
            <span class="mono" style="font-size:12px">${n}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${total ? Math.round(n / total * 100) : 0}%;background:${pColors[p]}"></div>
          </div>
        </div>`).join('')}
    </div>

    <div class="panel">
      <div class="panel-title">By category</div>
      ${Object.entries(byCat).map(([c, n]) => `
        <div class="bar-row">
          <div class="bar-label-row">
            <span style="font-weight:500">${c}</span>
            <span class="mono" style="font-size:12px">${n}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${total ? Math.round(n / total * 100) : 0}%;background:${catColors[c] || '#888780'}"></div>
          </div>
        </div>`).join('')}
    </div>
  </div>

  <div class="panel mt-12">
    <div class="panel-title">Overall progress across all tasks</div>
    <div style="display:flex;align-items:center;gap:14px">
      <div style="flex:1;height:10px;background:var(--surface2);border-radius:6px;overflow:hidden">
        <div style="height:100%;width:${avgP}%;background:linear-gradient(90deg,#6C63FF,#00C896);border-radius:6px;transition:width 0.6s ease"></div>
      </div>
      <span class="mono" style="font-size:18px;font-weight:700;color:var(--text)">${avgP}%</span>
    </div>
    <p style="font-size:12px;color:var(--text-tertiary);margin-top:8px">Average progress across ${total} task${total !== 1 ? 's' : ''}</p>
  </div>

  <div class="panel mt-12">
    <div class="panel-title">Effort distribution</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${[
        { label: '≤30 min', count: tasks.filter(t => t.effort <= 30).length, color: '#00C896' },
        { label: '1–2 hours', count: tasks.filter(t => t.effort > 30 && t.effort <= 120).length, color: '#6C63FF' },
        { label: 'Half day', count: tasks.filter(t => t.effort > 120 && t.effort <= 240).length, color: '#FFB020' },
        { label: 'Full day+', count: tasks.filter(t => t.effort > 240).length, color: '#FF4D6D' }
      ].map(e => `
        <div style="flex:1;min-width:90px;background:var(--surface2);border-radius:10px;padding:12px;text-align:center">
          <div class="mono" style="font-size:22px;font-weight:700;color:${e.color}">${e.count}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${e.label}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ===========================
   CALENDAR
=========================== */
function renderCalendar() {
  const el = document.getElementById('tlist');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const tDays = {};
  tasks.forEach(t => {
    if (t.dueDate) {
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const k = d.getDate();
        tDays[k] = tDays[k] || [];
        tDays[k].push(t);
      }
    }
  });

  let cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push('<div></div>');
  for (let d = 1; d <= last.getDate(); d++) {
    const isT = d === now.getDate();
    const ht = tDays[d] && tDays[d].length;
    const isPast = d < now.getDate();
    const titles = ht ? tDays[d].map(t => t.title).join('\n') : '';
    cells.push(`<div class="cday ${isT ? 'tod' : ht ? 'htask' : isPast ? 'past' : ''}" title="${titles}">${d}${ht && !isT ? `<div style="width:5px;height:5px;background:${isOd(tDays[d][0]) ? '#FF4D6D' : '#6C63FF'};border-radius:50%;margin:2px auto 0"></div>` : ''}</div>`);
  }

  const upcoming = tasks
    .filter(t => {
      if (!t.dueDate || t.done) return false;
      const dd = new Date(t.dueDate);
      dd.setHours(0, 0, 0, 0);
      return dd >= today();
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 8);

  el.innerHTML = `
  <div class="panel" style="margin-bottom:12px">
    <div class="cal-header">${months[month]} ${year}</div>
    <div class="cal-grid">
      ${days.map(d => `<div class="cday hdr">${d}</div>`).join('')}
      ${cells.join('')}
    </div>
  </div>

  <div class="panel">
    <div class="panel-title">Upcoming deadlines</div>
    ${upcoming.length ? upcoming.map(t => `
      <div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--border)">
        <div style="width:10px;height:10px;border-radius:50%;background:${pColors[t.priority]};flex-shrink:0"></div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500;color:var(--text)">${escHtml(t.title)}</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">${t.category}</div>
        </div>
        <div class="mono" style="font-size:11px;color:${isOd(t) ? 'var(--danger)' : 'var(--text-secondary)'}">${fmt(t.dueDate)}</div>
      </div>`).join('') : `<p style="font-size:13px;color:var(--text-tertiary)">No upcoming deadlines this month.</p>`}
  </div>`;
}

/* ===========================
   TRASH
=========================== */
function renderTrash() {
  const el = document.getElementById('tlist');
  if (!trash.length) {
    el.innerHTML = `<div class="empty-state"><i class="ti ti-trash"></i><p>Trash is empty</p></div>`;
    return;
  }

  el.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <p style="font-size:13px;color:var(--text-secondary)">${trash.length} deleted task${trash.length !== 1 ? 's' : ''}</p>
    <button class="btn btn-danger btn-sm" id="emptyTrashBtn"><i class="ti ti-trash"></i>Empty trash</button>
  </div>
  ${trash.map(t => `
    <div class="trash-card">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="flex:1">
          <div style="font-size:14px;font-weight:500;color:var(--text)">${escHtml(t.title)}</div>
          <div class="trash-card-meta">${t.category} · ${t.priority} priority${t.dueDate ? ` · Due ${fmt(t.dueDate)}` : ''}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" data-action="restore" data-id="${t.id}"><i class="ti ti-rotate"></i>Restore</button>
          <button class="ibtn del" data-action="permdel" data-id="${t.id}" title="Delete permanently"><i class="ti ti-x"></i></button>
        </div>
      </div>
    </div>`).join('')}`;
}

/* ===========================
   SIDEBAR
=========================== */
function updateSidebar() {
  const todayT = tasks.filter(t => {
    if (!t.dueDate) return false;
    const dd = new Date(t.dueDate);
    dd.setHours(0, 0, 0, 0);
    return dd.getTime() === today().getTime();
  });
  const upT = tasks.filter(t => {
    if (!t.dueDate) return false;
    const dd = new Date(t.dueDate);
    dd.setHours(0, 0, 0, 0);
    return dd >= tomorrow();
  });
  const odT = tasks.filter(isOd);
  const done = tasks.filter(t => t.done).length;
  const rate = tasks.length ? Math.round(done / tasks.length * 100) : 0;

  document.getElementById('nb-all').textContent = tasks.length;
  document.getElementById('nb-today').textContent = todayT.length;
  document.getElementById('nb-up').textContent = upT.length;
  document.getElementById('nb-od').textContent = odT.length;
  document.getElementById('nb-tr').textContent = trash.length;
  document.getElementById('sm-done').textContent = done;
  document.getElementById('sm-pct').textContent = rate + '%';
  document.getElementById('sm-total').textContent = tasks.length;

  buildCatNav();
}

function buildCatNav() {
  const byCat = {};
  tasks.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + 1; });
  const nav = document.getElementById('cat-nav');
  nav.innerHTML = Object.entries(byCat).map(([c, n]) => `
    <div class="nav-item cat-item ${catFilter === c ? 'active' : ''}" data-cat="${c}">
      <span class="cat-dot" style="background:${catColors[c] || '#888'}"></span>
      <span>${c}</span>
      <span class="nbadge">${n}</span>
    </div>`).join('');
}

/* ===========================
   MODAL
=========================== */
function openAdd() {
  editId = null;
  mSubs = [];
  document.getElementById('modal-heading').querySelector('span').textContent = 'New task';
  document.getElementById('micon').className = 'ti ti-plus';
  document.getElementById('msbtnlbl').textContent = 'Save task';
  document.getElementById('resch-row').style.display = 'none';
  resetForm();
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('f-t').focus();
}

function openEdit(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  editId = id;
  mSubs = (t.subtasks || []).map(s => ({ ...s }));
  document.getElementById('modal-heading').querySelector('span').textContent = 'Edit task';
  document.getElementById('micon').className = 'ti ti-edit';
  document.getElementById('msbtnlbl').textContent = 'Update task';
  document.getElementById('resch-row').style.display = 'none';

  document.getElementById('f-t').value = t.title;
  document.getElementById('f-n').value = t.notes || '';
  document.getElementById('f-p').value = t.priority;
  document.getElementById('f-c').value = t.category;
  document.getElementById('f-d').value = t.dueDate || '';
  document.getElementById('f-tm').value = t.dueTime || '';
  document.getElementById('f-e').value = t.effort || 60;
  document.getElementById('f-repeat').value = t.repeat || 'none';
  document.getElementById('f-prog').value = t.progress || 0;
  document.getElementById('pv').textContent = t.progress || 0;
  document.getElementById('f-tags').value = (t.tags || []).join(', ');
  updateRangeFill();
  renderSubFields();
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('f-t').focus();
}

function openResch(id) {
  openEdit(id);
  document.getElementById('modal-heading').querySelector('span').textContent = 'Reschedule task';
  document.getElementById('micon').className = 'ti ti-calendar-event';
  document.getElementById('resch-row').style.display = 'block';
  document.getElementById('f-rr').value = '';
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  editId = null;
}

function resetForm() {
  ['f-t', 'f-n', 'f-d', 'f-tm', 'f-rr', 'f-tags'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('f-p').value = 'medium';
  document.getElementById('f-c').value = 'Work';
  document.getElementById('f-e').value = '60';
  document.getElementById('f-repeat').value = 'none';
  document.getElementById('f-prog').value = '0';
  document.getElementById('pv').textContent = '0';
  document.getElementById('f-sl').innerHTML = '';
  document.getElementById('f-si').value = '';
  updateRangeFill();
  mSubs = [];
}

function updateRangeFill() {
  const v = document.getElementById('f-prog').value;
  document.getElementById('pv').textContent = v;
}

function renderSubFields() {
  document.getElementById('f-sl').innerHTML = mSubs.map((s, i) => `
    <div class="sub-inp-row">
      <div class="sub-chk ${s.done ? 'on' : ''}" data-si="${i}"></div>
      <input type="text" value="${escHtml(s.text)}" data-si="${i}" placeholder="Subtask…">
      <button class="ibtn del btn-sm" data-removesi="${i}"><i class="ti ti-x"></i></button>
    </div>`).join('');
}

function addSub() {
  const inp = document.getElementById('f-si');
  const v = inp.value.trim();
  if (!v) return;
  mSubs.push({ id: uid(), text: v, done: false });
  inp.value = '';
  renderSubFields();
  inp.focus();
}

function saveTask() {
  const title = document.getElementById('f-t').value.trim();
  if (!title) {
    document.getElementById('f-t').classList.add('error');
    document.getElementById('f-t').focus();
    setTimeout(() => document.getElementById('f-t').classList.remove('error'), 1500);
    toast('Task title is required.', 'danger');
    return;
  }

  const tags = document.getElementById('f-tags').value
    .split(',').map(s => s.trim()).filter(Boolean);

  const data = {
    title,
    notes: document.getElementById('f-n').value.trim(),
    priority: document.getElementById('f-p').value,
    category: document.getElementById('f-c').value,
    dueDate: document.getElementById('f-d').value,
    dueTime: document.getElementById('f-tm').value,
    effort: parseInt(document.getElementById('f-e').value),
    repeat: document.getElementById('f-repeat').value,
    progress: parseInt(document.getElementById('f-prog').value),
    subtasks: mSubs.map(s => ({ ...s })),
    tags
  };

  if (editId) {
    const t = tasks.find(x => x.id === editId);
    const rr = document.getElementById('f-rr').value.trim();
    Object.assign(t, data);
    if (rr) { t.rescheduled = true; t.rescheduleNote = rr; }
    if (data.progress === 100) t.done = true;
    toast('Task updated.', 'success');
  } else {
    tasks.unshift({
      ...data,
      id: uid(),
      done: false,
      starred: false,
      created: new Date().toISOString().slice(0, 10),
      rescheduled: false
    });
    toast('Task added.', 'success');
  }

  save();
  closeModal();
  render();
  updateSidebar();
}

/* ===========================
   ACTIONS
=========================== */
function toggleDone(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  if (t.done) t.progress = 100;
  save();
  render();
  updateSidebar();
  toast(t.done ? 'Task completed!' : 'Marked incomplete.', t.done ? 'success' : 'default');
}

function toggleSub(tid, sid) {
  const t = tasks.find(x => x.id === tid);
  if (!t) return;
  const s = (t.subtasks || []).find(x => x.id === sid);
  if (!s) return;
  s.done = !s.done;
  const sd = t.subtasks.filter(x => x.done).length;
  const stot = t.subtasks.length;
  if (stot) t.progress = Math.round(sd / stot * 100);
  if (t.progress === 100) t.done = true;
  save();
  render();
}

function toggleStar(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.starred = !t.starred;
  save();
  render();
  toast(t.starred ? 'Task starred.' : 'Star removed.', 'default');
}

function delTask(id) {
  const idx = tasks.findIndex(x => x.id === id);
  if (idx < 0) return;
  trash.unshift({ ...tasks[idx], deletedAt: new Date().toISOString() });
  tasks.splice(idx, 1);
  save();
  render();
  updateSidebar();
  toast('Moved to trash.', 'warning');
}

function restoreTask(id) {
  const idx = trash.findIndex(x => x.id === id);
  if (idx < 0) return;
  const t = { ...trash[idx] };
  delete t.deletedAt;
  tasks.unshift(t);
  trash.splice(idx, 1);
  save();
  render();
  updateSidebar();
  toast('Task restored.', 'success');
}

function permDel(id) {
  showConfirm('Delete permanently?', 'This task will be removed forever and cannot be recovered.', () => {
    trash = trash.filter(x => x.id !== id);
    save();
    renderTrash();
    updateSidebar();
    toast('Permanently deleted.', 'danger');
  });
}

function emptyTrash() {
  showConfirm('Empty trash?', `This will permanently delete all ${trash.length} trashed tasks. This cannot be undone.`, () => {
    trash = [];
    save();
    renderTrash();
    updateSidebar();
    toast('Trash emptied.', 'danger');
  });
}

function dupTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  tasks.unshift({
    ...t,
    id: uid(),
    title: 'Copy of ' + t.title,
    done: false,
    progress: 0,
    starred: false,
    rescheduled: false,
    created: new Date().toISOString().slice(0, 10),
    subtasks: (t.subtasks || []).map(s => ({ ...s, id: uid(), done: false }))
  });
  save();
  render();
  updateSidebar();
  toast('Task duplicated.', 'default');
}

/* ===========================
   CONFIRM DIALOG
=========================== */
function showConfirm(title, msg, onOk) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  confirmCallback = onOk;
  document.getElementById('confirmDialog').style.display = 'flex';
}

function closeConfirm() {
  document.getElementById('confirmDialog').style.display = 'none';
  confirmCallback = null;
}

/* ===========================
   TOAST
=========================== */
function toast(msg, type = 'default') {
  const icons = { success: 'ti-circle-check', danger: 'ti-alert-circle', warning: 'ti-alert-triangle', default: 'ti-info-circle' };
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="ti ${icons[type] || 'ti-info-circle'}"></i>${msg}`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

/* ===========================
   ESC HTML
=========================== */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ===========================
   EVENT DELEGATION
=========================== */
document.addEventListener('DOMContentLoaded', () => {
  // Load or seed
  if (!load()) seed();
  save();

  // Initial render
  render();
  updateSidebar();

  // Nav items
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.addEventListener('click', () => {
      catFilter = null;
      view = el.dataset.view;
      document.querySelectorAll('.nav-item[data-view]').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      const titles = {
        all: 'All tasks', today: "Today's tasks", upcoming: 'Upcoming',
        overdue: 'Overdue tasks', analytics: 'Analytics', calendar: 'Calendar', trash: 'Trash'
      };
      document.getElementById('vtitle').textContent = titles[view] || view;
      document.getElementById('frow').style.display = ['analytics', 'calendar', 'trash'].includes(view) ? 'none' : 'flex';
      render();
    });
  });

  // Category nav (delegated)
  document.getElementById('cat-nav').addEventListener('click', e => {
    const item = e.target.closest('.cat-item');
    if (!item) return;
    const cat = item.dataset.cat;
    if (catFilter === cat) {
      catFilter = null;
      document.getElementById('vtitle').textContent = 'All tasks';
      view = 'all';
      document.querySelectorAll('.nav-item[data-view="all"]')[0].click();
    } else {
      catFilter = cat;
      view = 'all';
      document.getElementById('vtitle').textContent = cat;
      document.querySelectorAll('.nav-item[data-view]').forEach(n => n.classList.remove('active'));
      document.getElementById('frow').style.display = 'flex';
      render();
      buildCatNav();
    }
  });

  // Filter chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      render();
    });
  });

  // Sort & Search
  document.getElementById('srt').addEventListener('change', render);
  document.getElementById('srch').addEventListener('input', () => {
    const val = document.getElementById('srch').value;
    document.getElementById('searchClear').style.display = val ? 'flex' : 'none';
    render();
  });
  document.getElementById('searchClear').addEventListener('click', () => {
    document.getElementById('srch').value = '';
    document.getElementById('searchClear').style.display = 'none';
    render();
  });

  // New task button
  document.getElementById('newTaskBtn').addEventListener('click', openAdd);

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  // Save task
  document.getElementById('msave').addEventListener('click', saveTask);

  // Title enter key
  document.getElementById('f-t').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveTask();
  });

  // Add subtask
  document.getElementById('addSubBtn').addEventListener('click', addSub);
  document.getElementById('f-si').addEventListener('keydown', e => {
    if (e.key === 'Enter') { addSub(); e.preventDefault(); }
  });

  // Subtask list interactions (delegated)
  document.getElementById('f-sl').addEventListener('click', e => {
    const rm = e.target.closest('[data-removesi]');
    const chk = e.target.closest('[data-si]');
    if (rm) {
      mSubs.splice(parseInt(rm.dataset.removesi), 1);
      renderSubFields();
    } else if (chk && chk.classList.contains('sub-chk')) {
      mSubs[parseInt(chk.dataset.si)].done = !mSubs[parseInt(chk.dataset.si)].done;
      renderSubFields();
    }
  });
  document.getElementById('f-sl').addEventListener('input', e => {
    const inp = e.target.closest('input[data-si]');
    if (inp) mSubs[parseInt(inp.dataset.si)].text = inp.value;
  });

  // Range slider
  document.getElementById('f-prog').addEventListener('input', updateRangeFill);

  // Task list delegation
  document.getElementById('tlist').addEventListener('click', e => {
    const action = e.target.closest('[data-action]');
    if (!action) return;
    const id = action.dataset.id;
    const act = action.dataset.action;
    if (act === 'toggle') toggleDone(id);
    else if (act === 'edit') openEdit(id);
    else if (act === 'resch') openResch(id);
    else if (act === 'dup') dupTask(id);
    else if (act === 'del') delTask(id);
    else if (act === 'star') toggleStar(id);
    else if (act === 'restore') restoreTask(id);
    else if (act === 'permdel') permDel(id);

    // Subtask check
    const subChk = e.target.closest('.sub-chk[data-tid]');
    if (subChk) toggleSub(subChk.dataset.tid, subChk.dataset.sid);
  });

  // Subtask toggle (delegated to tlist, needs data attrs)
  document.getElementById('tlist').addEventListener('click', e => {
    const sc = e.target.closest('.sub-chk');
    if (sc && sc.dataset.tid) toggleSub(sc.dataset.tid, sc.dataset.sid);
  });

  // Trash buttons (delegated)
  document.getElementById('tlist').addEventListener('click', e => {
    const emptyBtn = e.target.closest('#emptyTrashBtn');
    if (emptyBtn) emptyTrash();
  });

  // Confirm dialog
  document.getElementById('confirm-ok').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirm();
  });
  document.getElementById('confirm-cancel').addEventListener('click', closeConfirm);
  document.getElementById('confirmDialog').addEventListener('click', e => {
    if (e.target === document.getElementById('confirmDialog')) closeConfirm();
  });

  // Sidebar collapse
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('collapsed');
    const icon = document.getElementById('sidebarToggle').querySelector('i');
    icon.className = sb.classList.contains('collapsed')
      ? 'ti ti-layout-sidebar-left-expand'
      : 'ti ti-layout-sidebar-left-collapse';
  });

  // Mobile menu
  document.getElementById('mobileMenu').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('srch').focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openAdd();
    }
    if (e.key === 'Escape') {
      closeModal();
      closeConfirm();
      document.getElementById('sidebar').classList.remove('open');
    }
  });
});
