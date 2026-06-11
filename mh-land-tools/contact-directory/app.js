/**
 * Contact Directory — app.js
 *
 * Data is loaded from data.js (inline JS arrays).
 * To update data, edit DISTRICTS_DATA and CONTACTS_DATA in data.js.
 */

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────
  let currentDistId = null;

  // ── DOM refs ──────────────────────────────────────────────
  const districtSelect  = document.getElementById('districtSelect');
  const searchInput     = document.getElementById('searchInput');
  const searchWrapper   = document.getElementById('searchWrapper');
  const contactList     = document.getElementById('contactList');
  const emptyState      = document.getElementById('emptyState');
  const resultsHeader   = document.getElementById('resultsHeader');
  const resultsCount    = document.getElementById('resultsCount');
  const districtTitle   = document.getElementById('districtTitle');

  // ── Helpers ───────────────────────────────────────────────
  function getInitials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  }

  function cleanPhone(raw) {
    if (!raw) return '';
    return raw.trim().replace(/^0+/, '');
  }

  function formatDisplay(raw) {
    if (!raw) return '';
    return raw.trim().replace(/\n/g, ', ');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Init: populate dropdown from inline data ──────────────
  function init() {
    if (typeof DISTRICTS_DATA === 'undefined' || typeof CONTACTS_DATA === 'undefined') {
      showError('Data not loaded. Make sure data.js is included before app.js.');
      return;
    }

    const sorted = [...DISTRICTS_DATA].sort((a, b) =>
      a.districtName.localeCompare(b.districtName)
    );

    sorted.forEach(dist => {
      const opt = document.createElement('option');
      opt.value = dist.distId;
      opt.textContent = dist.districtName + (dist.division ? ` (${dist.division})` : '');
      districtSelect.appendChild(opt);
    });
  }

  // ── District change ───────────────────────────────────────
  districtSelect.addEventListener('change', () => {
    const val = districtSelect.value;
    if (!val) {
      currentDistId = null;
      showEmpty();
      return;
    }
    currentDistId = parseInt(val, 10);
    searchInput.value = '';
    searchWrapper.classList.add('visible');
    renderContacts();
  });

  // ── Search / filter ───────────────────────────────────────
  searchInput.addEventListener('input', () => {
    if (currentDistId !== null) renderContacts();
  });

  // ── Render contacts ───────────────────────────────────────
  function renderContacts() {
    const districtData = CONTACTS_DATA.find(d => d.distId === currentDistId);
    const query = searchInput.value.toLowerCase().trim();

    if (!districtData || !districtData.contacts.length) {
      showEmpty('No contacts found for this district.');
      return;
    }

    let contacts = districtData.contacts;

    if (query) {
      contacts = contacts.filter(c =>
        (c.name        || '').toLowerCase().includes(query) ||
        (c.marathiName || '').toLowerCase().includes(query) ||
        (c.post        || '').toLowerCase().includes(query) ||
        (c.marathiPost || '').toLowerCase().includes(query)
      );
    }

    districtTitle.textContent = districtData.districtName;
    resultsCount.textContent  = contacts.length + (contacts.length === 1 ? ' officer' : ' officers');
    resultsHeader.classList.add('visible');
    contactList.innerHTML = '';
    emptyState.style.display = 'none';

    if (contacts.length === 0) {
      contactList.innerHTML = '<div class="no-results">No officers match your search.</div>';
      return;
    }

    contacts.forEach(contact => contactList.appendChild(buildCard(contact)));
  }

  // ── Build a contact card ──────────────────────────────────
  function buildCard(c) {
    const name     = (c.name || '').trim();
    const marName  = (c.marathiName || '').trim();
    const post     = (c.post || '').trim();
    const marPost  = (c.marathiPost || '').trim();
    const mobile   = (c.contactNo || '').trim();
    const landline = (c.landlineNo || '').trim();
    const email    = (c.email || '').trim();
    const address  = formatDisplay(c.address || '');
    const initials = getInitials(name || marName || '?');
    const callNum  = mobile || landline;

    const card = document.createElement('div');
    card.className = 'contact-card';

    // Card top
    const top = document.createElement('div');
    top.className = 'card-top';

    const avatar = document.createElement('div');
    avatar.className = 'officer-avatar';
    avatar.textContent = initials;

    const info = document.createElement('div');
    info.className = 'officer-info';
    info.innerHTML = `
      <div class="officer-name">${escapeHtml(name || marName)}</div>
      ${marName && marName !== name ? `<div class="officer-name-marathi">${escapeHtml(marName)}</div>` : ''}
      <span class="post-badge">${escapeHtml(post || marPost)}</span>
      ${marPost && marPost !== post ? `<div style="font-size:.78rem;color:var(--clr-muted);margin-top:3px">${escapeHtml(marPost)}</div>` : ''}
    `;

    top.appendChild(avatar);
    top.appendChild(info);

    // Card body
    const body = document.createElement('div');
    body.className = 'card-body';

    if (mobile)   body.appendChild(buildRow('📱','mobile','Mobile',  `<a class="info-value" href="tel:${cleanPhone(mobile)}">${escapeHtml(mobile)}</a>`));
    if (landline) body.appendChild(buildRow('📞','phone', 'Landline',`<a class="info-value" href="tel:${cleanPhone(landline)}">${escapeHtml(landline)}</a>`));
    if (email)    body.appendChild(buildRow('✉️','email', 'Email',   `<a class="info-value" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`));
    if (address)  body.appendChild(buildRow('📍','addr',  'Address', `<span class="info-value">${escapeHtml(address)}</span>`));

    // Actions
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    if (callNum) {
      const btn = document.createElement('a');
      btn.className = 'btn-action btn-call';
      btn.href = `tel:${cleanPhone(callNum)}`;
      btn.innerHTML = '📞 Call';
      actions.appendChild(btn);
    }
    if (email) {
      const btn = document.createElement('a');
      btn.className = 'btn-action btn-email';
      btn.href = `mailto:${email}`;
      btn.innerHTML = '✉️ Email';
      actions.appendChild(btn);
    }

    card.appendChild(top);
    card.appendChild(body);
    if (actions.children.length) card.appendChild(actions);
    return card;
  }

  function buildRow(icon, cls, label, valueHtml) {
    const row = document.createElement('div');
    row.className = 'info-row';
    row.innerHTML = `
      <div class="info-icon ${cls}">${icon}</div>
      <div class="info-content">
        <div class="info-label">${label}</div>
        ${valueHtml}
      </div>`;
    return row;
  }

  function showEmpty(msg) {
    contactList.innerHTML = '';
    emptyState.style.display = 'block';
    resultsHeader.classList.remove('visible');
    searchWrapper.classList.remove('visible');
    emptyState.querySelector('p').textContent =
      msg || 'Select a district above to view officer contact details.';
  }

  function showError(msg) {
    contactList.innerHTML = '';
    emptyState.style.display = 'block';
    emptyState.querySelector('.empty-icon').textContent = '⚠️';
    emptyState.querySelector('p').textContent = 'Error: ' + msg;
  }

  // ── Start ─────────────────────────────────────────────────
  init();
})();
