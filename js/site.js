(function () {
  const S = window.SITE;

  const navItems = [
    ["index.html", "Home"],
    ["about.html", "About"],
    ["join.html", "Join Us"],
    ["events.html", "Events"],
    ["leaders.html", "Leaders"],
    ["scout-leadership.html", "Scout Leadership"],
    ["typical-year.html", "Typical Year"],
    ["eagles.html", "Eagle Scouts"],
    ["resources.html", "Resources"],
    ["photos.html", "Photos"],
    ["support.html", "Support"],
    ["contact.html", "Contact"]
  ];

  function header(active) {
    return `
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="Troop 134 home">
          <img src="images/logo/troop-134-logo-512.png" alt="Troop 134 official logo">
          <span><strong>Troop 134</strong><small>Folsom, California</small></span>
        </a>
        <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav id="site-nav" class="site-nav" aria-label="Main navigation">
          ${navItems.map(([href, label]) =>
            `<a href="${href}" class="${active === href ? "active" : ""}">${label}</a>`).join("")}
        </nav>
      </header>`;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div>
          <strong>Troop 134 • Folsom, California</strong>
          <p>Scouts BSA • Chartered by American Legion Post 383</p>
        </div>
        <div class="footer-links">
          <a href="join.html">Join Us</a>
          <a href="contact.html">Contact</a>
          <a href="resources.html">Resources</a>
          <a href="${S.facts.instagram}" target="_blank" rel="noopener">Instagram</a>
        </div>
      </footer>`;
  }

  function mount(active) {
    document.querySelector("#site-header").innerHTML = header(active);
    document.querySelector("#site-footer").innerHTML = footer();
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
  }

  function formatDate(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric"
    });
  }

  function formatRange(start, end) {
    if (!end || start === end) return formatDate(start);
    const a = new Date(start + "T12:00:00");
    const b = new Date(end + "T12:00:00");
    if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
      return `${a.toLocaleDateString(undefined,{month:"short",day:"numeric"})}–${b.toLocaleDateString(undefined,{day:"numeric",year:"numeric"})}`;
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  function upcomingEvents() {
    const today = new Date();
    today.setHours(0,0,0,0);
    return S.events
      .filter(e => new Date(e.end || e.start + "T12:00:00") >= today)
      .sort((a,b) => a.start.localeCompare(b.start));
  }

  function eventCard(e) {
    return `<article class="event-card">
      <div class="event-date">${formatRange(e.start, e.end)}</div>
      <div>
        <h3>${e.title}</h3>
        <p>${e.summary || ""}</p>
        <p class="muted">${e.location || ""}</p>
        ${e.signupUrl ? `<a class="button small" href="${e.signupUrl}" target="_blank" rel="noopener">Sign Up</a>` : ""}
      </div>
    </article>`;
  }

  function nextMeetings(count) {
    const out = [];
    const now = new Date();
    for (let i = 0; out.length < count && i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      if (d.getDay() === 2 && d >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        const iso = d.toISOString().slice(0,10);
        out.push({
          title: "Troop Meeting",
          start: iso,
          end: iso,
          location: S.meeting.place,
          summary: "Weekly troop meeting at 7:00 PM",
          signupUrl: ""
        });
      }
    }
    return out;
  }

  function renderHomeEvents() {
    const el = document.querySelector("#home-events");
    if (!el) return;
    let items = upcomingEvents().slice(0,3);
    if (items.length < 3) items = items.concat(nextMeetings(3 - items.length));
    el.innerHTML = items.slice(0,3).map(eventCard).join("");
  }

  function renderEvents() {
    const el = document.querySelector("#events-list");
    if (!el) return;
    const events = upcomingEvents();
    if (!events.length) {
      el.innerHTML = `<div class="empty-state"><h3>Troop meetings every Tuesday at 7:00 PM</h3><p>Check back for upcoming campouts, service projects, and special events.</p></div>`;
      return;
    }
    const groups = {};
    events.forEach(e => {
      const key = new Date(e.start + "T12:00:00").toLocaleDateString(undefined,{month:"long",year:"numeric"});
      (groups[key] ||= []).push(e);
    });
    el.innerHTML = Object.entries(groups).map(([month, items]) =>
      `<section class="month-group"><h2>${month}</h2>${items.map(eventCard).join("")}</section>`
    ).join("");
  }

  function renderLeaders() {
    const el = document.querySelector("#leaders-list");
    if (!el) return;
    el.innerHTML = S.leaders.map(l => `
      <article class="role-card">
        <h3>${l.role}</h3>
        <a href="mailto:${l.email}">${l.email}</a>
      </article>`).join("");
  }

  function renderEagles() {
    const el = document.querySelector("#eagles-list");
    if (!el) return;
    el.innerHTML = S.eagles.map(e => `
      <div class="eagle-row"><span>${e.name}</span><span>${e.year}</span></div>`).join("");
  }

  function renderAlbums() {
    const el = document.querySelector("#album-grid");
    if (!el) return;
    el.innerHTML = S.albums.map(a => `
      <article class="album-card">
        <img src="${a.cover}" alt="${a.title} album cover">
        <div class="album-body"><h3>${a.title}</h3><p>${a.date}</p><button class="button small" disabled>Gallery placeholder</button></div>
      </article>`).join("");
  }

  function renderLinks() {
    const linksEl = document.querySelector("#resource-links");
    if (linksEl) linksEl.innerHTML = S.links.map(l => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.title}</a></li>`).join("");
    const docsEl = document.querySelector("#documents");
    if (docsEl) docsEl.innerHTML = S.documents.map(d => `<li><a href="${d.url}" target="_blank" rel="noopener">${d.title}</a></li>`).join("");
    const membersEl = document.querySelector("#member-links");
    if (membersEl) membersEl.innerHTML = S.members.map(l => `<li><a href="${l.url}" target="_blank" rel="noopener">${l.title}</a></li>`).join("");
  }

  function renderStats() {
    const el = document.querySelector("#stats");
    if (!el) return;
    el.innerHTML = `
      <div><strong>${S.stats.yearsActive}</strong><span>years active</span></div>
      <div><strong>${S.stats.scouts}</strong><span>Scouts</span></div>
      <div><strong>${S.stats.campoutsThisYear}</strong><span>campouts this year</span></div>`;
  }

  function renderMeetingPlace() {
    document.querySelectorAll("[data-meeting-place]").forEach(el => el.textContent = S.meeting.place);
    document.querySelectorAll("[data-meeting-day]").forEach(el => el.textContent = S.meeting.day);
    document.querySelectorAll("[data-meeting-time]").forEach(el => el.textContent = S.meeting.time);
  }

  window.T134 = { mount, renderHomeEvents, renderEvents, renderLeaders, renderEagles, renderAlbums, renderLinks, renderStats, renderMeetingPlace };
})();