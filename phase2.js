/* Phase 2 — conversational production intake
   Demo-only: no real Movie Park systems are connected. */

(function () {
  var STORAGE_KEY = 'movieParkDemoV2';
  var ADMIN_TOKEN_KEY = 'movieParkAdminToken';

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        a: S.a, msgs: S.msgs, brief: S.brief, inq: S.inq
      }));
    } catch (e) {}
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d.a) S.a = d.a;
      if (d.msgs) S.msgs = d.msgs;
      var legacy = Array.isArray(S.msgs) && S.msgs.some(function (m) { return /What is the brand or company name\?|Where would the production take place\?|What deliverables are you looking for\?/.test(m.t || ''); });
      if (legacy) { S.a = {}; S.msgs = []; S.brief = null; }
      if (d.brief) S.brief = d.brief;
      if (d.inq) S.inq = d.inq;
    } catch (e) {}
  }

  function goAssistant() { go('/assistant'); }
  function goBrief() { go('/brief'); }
  function goAdmin() { go('/admin'); }
  window.goAssistant = goAssistant;
  window.goBrief = goBrief;
  window.goAdmin = goAdmin;

  function token() {
    try { return localStorage.getItem(ADMIN_TOKEN_KEY) || ''; } catch (e) { return ''; }
  }

  window.adminLogout = function () {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    goAdmin();
  };

  window.adminLogin = async function () {
    var u = document.getElementById('adminUser');
    var p = document.getElementById('adminPass');
    var error = document.getElementById('adminError');
    if (!u || !p) return;
    var r = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u.value, password: p.value })
    });
    var d = await r.json();
    if (!r.ok) { if (error) error.textContent = d.error || 'Login failed'; return; }
    localStorage.setItem(ADMIN_TOKEN_KEY, d.token);
    window.admin();
  };

  function fieldCount() {
    return ['brand','projectType','location','deliverables','deadline','budget','references','requirements']
      .filter(function (k) { return S.a[k] && String(S.a[k]).trim(); }).length;
  }

  function score(b) {
    var n = 0;
    if (b.client) n += 10;
    if (b.project) n += 15;
    if (b.location) n += 10;
    if (b.deliverables) n += 15;
    if (b.deadline) n += 15;
    if (b.budget && b.budget !== 'Not decided yet') n += 20;
    if (b.references) n += 5;
    if (b.requirements) n += 10;
    return { score: n, status: n >= 75 ? 'QUALIFIED' : n >= 55 ? 'REVIEW REQUIRED' : 'NEEDS DETAILS' };
  }

  function suggestionChips() {
    var missing = [];
    var suggestions = [
      ['projectType', ['Commercial Film','Product Video','Social Campaign','Fashion Film','CGI / VFX']],
      ['deliverables', ['Hero Film','Social Cuts','Product Photography','CGI','Behind the Scenes']],
      ['budget', ['Under $25K','$25K–$50K','$50K–$100K','$100K+','Not decided yet']]
    ];
    suggestions.forEach(function (group) {
      if (!S.a[group[0]]) missing.push(group);
    });
    if (!missing.length) return '';
    var group = missing[0];
    return '<div class="quick"><span style="width:100%;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#777">Suggestions · optional</span>' +
      group[1].map(function (x) {
        return '<button class="chip" onclick="answer(\'' + String(x).replace(/\\/g,'\\\\').replace(/'/g,"\\'") + '\')">' + esc(x) + '</button>';
      }).join('') + '</div>';
  }

  function renderMessages() {
    return S.msgs.map(function (m) {
      return '<div class="msg ' + m.w + '"><small>' +
        (m.w === 'ai' ? 'AI Assistant' : 'You') +
        '</small>' + esc(m.t) + '</div>';
    }).join('');
  }

  window.assistant = function () {
    if (!S.msgs.length) {
      S.msgs = [{ w: 'ai', t: 'Hi. I’m the AI Production Assistant. Tell me what you’re looking to produce, and I’ll help turn your idea into a structured production brief.' }];
    }

    var ready = fieldCount() >= 5
      ? '<button class="btn alt" onclick="goBriefFromConversation()">Review Project Brief →</button>'
      : '';

    el(
      '<div class="shell">' +
        '<div class="top"><div><div class="ey">AI Production Assistant</div><h2>Start a Project Brief</h2>' +
        '<div class="sub">Tell the assistant what you need naturally. Ask questions at any time — it will capture confirmed project details without forcing a questionnaire.</div></div>' +
        '<div class="tag">Concept Demo · Conversational Intake</div></div>' +
        '<div class="chat"><div><div class="messages">' + renderMessages() + '</div>' +
        ready + suggestionChips() +
        '<div class="composer"><input id="inp" placeholder="Ask a question or describe your project…" onkeydown="if(event.key===\'Enter\')answer(this.value)">' +
        '<button class="btn" onclick="answer(document.getElementById(\'inp\').value)">Send</button></div></div>' +
        '<aside class="side"><h3>Project Brief</h3><div class="progress">' +
        '<div class="p ' + (S.a.brand ? 'done' : '') + '"><span></span>Client / Brand</div>' +
        '<div class="p ' + (S.a.projectType ? 'done' : '') + '"><span></span>Project Type</div>' +
        '<div class="p ' + (S.a.location ? 'done' : '') + '"><span></span>Location</div>' +
        '<div class="p ' + (S.a.deliverables ? 'done' : '') + '"><span></span>Deliverables</div>' +
        '<div class="p ' + (S.a.deadline ? 'done' : '') + '"><span></span>Timeline</div>' +
        '<div class="p ' + (S.a.budget ? 'done' : '') + '"><span></span>Budget</div>' +
        '<div class="p ' + (S.a.references ? 'done' : '') + '"><span></span>References</div>' +
        '<div class="p ' + (S.a.requirements ? 'done' : '') + '"><span></span>Requirements</div>' +
        '</div><div class="note">The assistant answers questions first and only records information that has been confirmed. No real Movie Park internal systems are connected.</div></aside></div></div>'
    );
  };

  window.goBriefFromConversation = function () {
    window.makeBrief();
  };

  window.answer = async function (value) {
    var v = (value || '').trim();
    if (!v) return;

    S.msgs.push({ w: 'user', t: v });
    assistant();

    try {
      var response = await fetch('/api/ai/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            message: v,
            conversation: S.msgs.map(function (x) { return x.w + ': ' + x.t; }),
            currentBrief: S.a,
            sourceUrl: (v.match(/https?:\\/\\/[^\\s]+/) || [])[0] || null
          }
        })
      });

      var data = await response.json();

      if (response.ok && data.handoff && data.handoff.brief) {
        var b = data.handoff.brief;
        var map = {
          client: 'brand',
          project: 'projectType',
          location: 'location',
          deliverables: 'deliverables',
          deadline: 'deadline',
          budget: 'budget',
          references: 'references',
          requirements: 'requirements'
        };
        Object.keys(map).forEach(function (key) {
          if (b[key] !== undefined && b[key] !== null && String(b[key]).trim()) {
            S.a[map[key]] = b[key];
          }
        });
      }

      var message = data.assistantMessage || data.assistant_message;
      if (!message && data.handoff && data.handoff.assistant_message) {
        message = data.handoff.assistant_message;
      }

      if (message) {
        S.msgs.push({ w: 'ai', t: message });
      } else if (response.ok) {
        S.msgs.push({ w: 'ai', t: 'Got it. I’ve captured that. You can keep asking questions or add anything else about the project.' });
      } else {
        S.msgs.push({ w: 'ai', t: 'I couldn’t reach the AI service right now, but your message is saved. You can continue the demo.' });
      }
    } catch (e) {
      console.warn('AI intake unavailable', e);
      S.msgs.push({ w: 'ai', t: 'The AI service is unavailable right now. Your conversation is still saved locally.' });
    }

    save();
    assistant();
  };

  window.makeBrief = function () {
    var b = {
      client: S.a.brand || 'Demo Client',
      project: S.a.projectType || 'Production Project',
      location: S.a.location || 'Location not specified',
      deliverables: S.a.deliverables || 'Deliverables to confirm',
      deadline: S.a.deadline || 'Timeline to confirm',
      budget: S.a.budget || 'Not decided yet',
      references: S.a.references || 'No references supplied',
      requirements: S.a.requirements || 'No additional requirements supplied'
    };
    var q = score(b);
    b.score = q.score;
    b.status = q.status;
    S.brief = b;
    save();
    goBrief();
  };

  window.brief = function () {
    var b = S.brief || {};
    el(
      '<div class="shell"><button class="back" onclick="goAssistant()">← Back to Conversation</button>' +
      '<div class="top"><div><div class="ey">Project Brief · Review</div><h2>' + esc(b.project || 'Project Brief') + '</h2>' +
      '<div class="sub">Review what was captured. Nothing is sent until you explicitly choose Send to Account Manager.</div></div>' +
      '<span class="status">' + esc(b.status || 'IN PROGRESS') + '</span></div>' +
      '<div class="briefGrid"><div class="card"><div class="fields">' +
      [['Client',b.client],['Location',b.location],['Deliverables',b.deliverables],['Timeline',b.deadline],['Budget',b.budget],['Creative Direction',b.references]]
        .map(function (x) { return '<div class="field"><div class="label">' + x[0] + '</div><div class="value">' + esc(x[1] || '—') + '</div></div>'; }).join('') +
      '</div><div style="margin-top:22px"><div class="label">Additional Requirements</div><p class="sub">' + esc(b.requirements || '—') + '</p></div>' +
      '<div class="actions"><button class="btn" onclick="submitBrief()">Send to Account Manager →</button><button class="btn alt" onclick="goAssistant()">Continue Conversation</button></div></div>' +
      '<aside class="card"><div class="ey">AI Analysis</div><div class="analysis">' +
      '<div class="row"><span>Qualification</span><b>' + esc((b.score !== undefined ? b.score + '/100' : 'Not scored')) + '</b></div>' +
      '<div class="row"><span>Status</span><b>' + esc(b.status || 'IN PROGRESS') + '</b></div></div>' +
      '<div class="note">You can continue asking questions before sending. The account manager receives the brief only after explicit submission.</div></aside></div></div>'
    );
  };

  window.submitBrief = async function () {
    if (!S.brief) return;
    try {
      var response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: S.brief })
      });
      var saved = await response.json();
      if (saved.inquiryId) S.brief.inquiryId = saved.inquiryId;
    } catch (e) {
      console.warn('Inquiry persistence unavailable', e);
    }
    S.inq.unshift({
      id: S.brief.inquiryId || Date.now(),
      client: S.brief.client,
      project: S.brief.project,
      location: S.brief.location,
      budget: S.brief.budget,
      status: S.brief.status === 'QUALIFIED' ? 'Qualified' : S.brief.status === 'REVIEW REQUIRED' ? 'Review Required' : 'New',
      date: 'Just now'
    });
    save();
    goAdmin();
  };

  window.admin = function () {
    if (!token()) {
      el('<div class="shell"><div class="ey">Protected workspace</div><h2>Account Manager Login</h2><p class="sub">Admin access is required to view production inquiries.</p>' +
        '<div class="card" style="max-width:520px"><div class="label">Username</div><input id="adminUser" placeholder="Admin username">' +
        '<div class="label" style="margin-top:16px">Password</div><input id="adminPass" type="password" placeholder="Admin password" onkeydown="if(event.key===\'Enter\')adminLogin()">' +
        '<div id="adminError" style="color:#d88;margin-top:12px;font-size:12px"></div><div class="actions"><button class="btn" onclick="adminLogin()">Sign In →</button></div></div></div>');
      return;
    }

    fetch('/api/admin/inquiries', { headers: { Authorization: 'Bearer ' + token() } })
      .then(function (r) { if (r.status === 401) { adminLogout(); return null; } return r.json(); })
      .then(function (data) {
        if (!data) return;
        var list = Array.isArray(data) ? data : (data.inquiries || data.items || []);
        var rows = list.map(function (x) {
          return '<tr class="click" onclick="adminDetail(' + JSON.stringify(String(x.id)) + ')"><td><b>' + esc(x.client || '—') + '</b></td><td>' +
            esc(x.project || '—') + '</td><td>' + esc(x.location || '—') + '</td><td>' + esc(x.budget || '—') +
            '</td><td><span class="badge">' + esc(x.status || 'New') + '</span></td><td>' + esc(x.createdAt || x.date || '') + '</td></tr>';
        }).join('');
        el('<div class="shell"><div class="ey">Protected account manager workspace</div><div class="top"><div><h2>Production Inquiries</h2><p class="sub">Backend-persisted inquiry queue.</p></div><button class="btn alt" onclick="adminLogout()">Log Out</button></div>' +
          '<div class="tableWrap"><table class="table"><thead><tr><th>Client</th><th>Project</th><th>Location</th><th>Budget</th><th>Status</th><th>Received</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>');
      });
  };

  window.adminDetail = function (id) {
    if (!token()) return goAdmin();
    fetch('/api/admin/inquiries/' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + token() } })
      .then(function (r) { if (r.status === 401) { adminLogout(); return null; } return r.json(); })
      .then(function (x) {
        if (!x || x.error) return goAdmin();
        var b = x.payload && (x.payload.brief || x.payload) || x;
        el('<div class="shell"><button class="back" onclick="goAdmin()">← Back to Inquiries</button><div class="ey">Inquiry #' + esc(x.id) +
          '</div><h2>' + esc(b.client || 'Inquiry') + '</h2><div class="card"><div class="detailGrid"><div>' +
          '<div class="label">Project</div><div class="value">' + esc(b.project || '—') + '</div><div class="label">Location</div><div class="value">' +
          esc(b.location || '—') + '</div><div class="label">Budget</div><div class="value">' + esc(b.budget || '—') + '</div></div>' +
          '<div><div class="ey">AI Summary</div><p class="sub">This inquiry has been converted into structured production data for account-manager review.</p></div></div></div></div>');
      });
  };

  load();
  window.render = function () {
    var p = location.hash.slice(1) || '/';
    if (p === '/assistant') window.assistant();
    else if (p === '/brief') window.brief();
    else if (p === '/admin') window.admin();
    else if (p.indexOf('/admin/inquiries/') === 0) window.adminDetail(p.split('/').pop());
    else if (p === '/portfolio' && typeof window.portfolio === 'function') window.portfolio();
    else if (typeof window.home === 'function') window.home();
  };
  window.render();
})();