"use strict";

const PLACES = [
  ["Kuliyapitiya", 7.47, 80.04], ["Colombo", 6.9271, 79.8612], ["Kandy", 7.2906, 80.6337],
  ["Galle", 6.0535, 80.221], ["Jaffna", 9.6615, 80.0255], ["Kurunegala", 7.4863, 80.3623],
  ["Anuradhapura", 8.3114, 80.4037], ["Polonnaruwa", 7.9403, 81.0188], ["Matara", 5.9549, 80.555],
  ["Negombo", 7.2083, 79.8358], ["Gampaha", 7.0873, 80.0144], ["Kalutara", 6.5854, 79.9607],
  ["Chilaw", 7.5758, 79.7953], ["Puttalam", 8.0362, 79.8283], ["Ratnapura", 6.6828, 80.3992],
  ["Badulla", 6.9934, 81.055], ["Nuwara Eliya", 6.9497, 80.7891], ["Hambantota", 6.1241, 81.1185],
  ["Batticaloa", 7.731, 81.6747], ["Trincomalee", 8.5874, 81.2152],
];
const DEFAULT = { name: "Lakshitha", date: "1997-06-03", time: "02:52", place: "Kuliyapitiya",
                  lat: 7.47, lon: 80.04, tz: "auto", here: "Kuliyapitiya" };
const ABBR = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve",
               Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };
// South-Indian fixed-sign layout: sign index -> [row, col]
const SI_CELL = { 11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3], 3: [1, 3], 4: [2, 3], 5: [3, 3],
                  6: [3, 2], 7: [3, 1], 8: [3, 0], 9: [2, 0], 10: [1, 0] };
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio",
               "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const UI = {
  en: {
    tag: "Your day, month and year - read the traditional way, in plain words.",
    edit: "Edit birth details", save: "Save & read", reset: "Reset to default",
    fine: "Saved only in this browser. Sri Lanka's 1996-2006 clock changes are handled automatically.",
    f_name: "Name", f_date: "Birth date", f_time: "Birth time", f_place: "Birth place", f_lat: "Latitude",
    f_lon: "Longitude", f_tz: "Birth time zone", f_here: "Where you are today",
    t_today: "Today", t_day: "A date", t_month: "A month", t_year: "A year",
    footer: "Planet positions and times are calculated facts. What they mean is traditional astrology - a belief, not science, and never a guaranteed prediction. Your own choices matter more than any planet.",
    lagna: "Lagna", moon: "Moon sign", star: "Birth star",
    loading: "Reading the sky…", refresh: "Refresh", asof: "as of",
    dayscore: "day score", monthavg: "month", yearavg: "year",
    times: "Times today", best: "Best time", rahu: "Rahu Kalam", sun: "Sunrise / sunset",
    do: "Good things to do", avoid: "Better to avoid", areas: "Your life today",
    bigger: "The bigger picture", chapter: "Your life chapter", coming: "Coming up",
    more: "More details (technical)", less: "Hide details",
    tech: "Technical details are shown in English.",
    m_reading: "Month reading", y_reading: "Year reading", daybyday: "Day by day",
    tap: "Tap any day to see its full reading.", brightest: "Best days", gentle: "Go gently on",
    weeks: "Week by week", events: "Sky events", monthscards: "Month by month",
    journey: "The slow planets this year", dchanges: "Changes in your life chapter",
    areas_m: "Your life this month", areas_y: "Your life this year",
    sky: "The sky", natal: "Birth chart", shape: "How the day changes", weather: "Background",
    dasha: "Dasha periods", skynow: "Planet positions", none: "Nothing major in this window.",
    love: "love", work: "work", money: "money",
  },
  si: {
    tag: "ඔබේ දවස, මාසය හා වර්ෂය - සාම්ප්‍රදායික ක්‍රමයට, සරල වචනවලින්.",
    edit: "උපන් විස්තර වෙනස් කරන්න", save: "සුරකින්න", reset: "මුල් විස්තර",
    fine: "මෙම විස්තර ඔබේ බ්‍රවුසරයේ පමණක් සුරැකේ. 1996-2006 කාලයේ ශ්‍රී ලංකාවේ වේලාව වෙනස් වීම ස්වයංක්‍රීයව සලකා බලයි.",
    f_name: "නම", f_date: "උපන් දිනය", f_time: "උපන් වේලාව", f_place: "උපන් ස්ථානය", f_lat: "අක්ෂාංශය",
    f_lon: "දේශාංශය", f_tz: "උපන් වේලා කලාපය", f_here: "ඔබ අද සිටින ස්ථානය",
    t_today: "අද", t_day: "දිනයක්", t_month: "මාසයක්", t_year: "වර්ෂයක්",
    footer: "ග්‍රහ පිහිටීම් හා වේලාවන් ගණනය කළ කරුණු වේ. ඒවායේ අර්ථය සාම්ප්‍රදායික ජ්‍යෝතිෂයට අනුවයි - එය විශ්වාසයක් මිස විද්‍යාවක් හෝ නියත අනාවැකියක් නොවේ. ඔබේම තීරණ ඕනෑම ග්‍රහයෙකුට වඩා වැදගත්.",
    lagna: "ලග්නය", moon: "චන්ද්‍ර රාශිය", star: "උපන් නැකත",
    loading: "ග්‍රහ පිහිටීම් ගණනය කරමින්…", refresh: "නැවුම් කරන්න", asof: "වේලාව",
    dayscore: "දවසේ ලකුණු", monthavg: "මාසය", yearavg: "වර්ෂය",
    times: "අද වේලාවන්", best: "හොඳම වේලාව", rahu: "රාහු කාලය", sun: "හිරු උදාව / බැසීම",
    do: "කිරීමට හොඳ දේ", avoid: "වළකින්න", areas: "අද ඔබේ ජීවිතය",
    bigger: "පසුබිම", chapter: "ඔබේ ජීවිතයේ මේ කාලය (දශාව)", coming: "ඉදිරියට එන දේ",
    more: "වැඩි විස්තර (තාක්ෂණික)", less: "විස්තර සඟවන්න",
    tech: "තාක්ෂණික විස්තර ඉංග්‍රීසියෙන් පෙන්වා ඇත.",
    m_reading: "මාසික පලාපල", y_reading: "වාර්ෂික පලාපල", daybyday: "දිනෙන් දින",
    tap: "සම්පූර්ණ පලාපල බැලීමට ඕනෑම දවසක් ඔබන්න.", brightest: "හොඳම දවස්", gentle: "පරිස්සම් විය යුතු දවස්",
    weeks: "සතියෙන් සතිය", events: "ග්‍රහ ගමන්", monthscards: "මාසයෙන් මාසය",
    journey: "මේ වසරේ මන්දගාමී ග්‍රහයන්", dchanges: "ඔබේ දශා කාලයේ වෙනස්කම්",
    areas_m: "මේ මාසයේ ඔබේ ජීවිතය", areas_y: "මේ වසරේ ඔබේ ජීවිතය",
    sky: "ග්‍රහ පිහිටීම්", natal: "උපන් කේන්දරය", shape: "දවස වෙනස් වන ආකාරය", weather: "පසුබිම",
    dasha: "දශා කාල", skynow: "ග්‍රහ පිහිටීම්", none: "මෙම කාලයේ විශේෂ දෙයක් නැත.",
    love: "ආදරය", work: "රැකියාව", money: "මුදල්",
  },
};

const $ = (s, el = document) => el.querySelector(s);
const out = $("#out");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// One colour per score band, matching the server's labels
const heat = (s) => (s >= 80 ? "#2f5a2a" : s >= 65 ? "#5b7a32" : s >= 48 ? "#b07a1f"
  : s >= 35 ? "#a4481c" : "#7d1f10");

let profile = loadProfile();
let lang = localStorage.getItem("kendara.lang") || "si";
let state = { mode: "today", day: todayISO(), month: todayISO().slice(0, 7), year: +todayISO().slice(0, 4) };
let lastNatal = null;
let lastData = null;
let showDetails = false;
const t = (k) => UI[lang][k] ?? UI.en[k] ?? k;

function todayISO() {
  // Sri Lanka civil time (+5:30)
  return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
}

function loadProfile() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem("kendara.profile") || "{}") }; }
  catch { return { ...DEFAULT }; }
}

function params(extra) {
  const here = PLACES.find((p) => p[0] === profile.here);
  return {
    name: profile.name, bdate: profile.date, btime: profile.time,
    lat: profile.lat, lon: profile.lon, tz: profile.tz, lang,
    clat: here ? here[1] : profile.lat, clon: here ? here[2] : profile.lon, ...extra,
  };
}

// Everything is calculated right here in the browser (js/*.js) - no server needed,
// so the page also works when index.html is opened straight from disk.
async function api(path, extra = {}) {
  await new Promise((r) => setTimeout(r, 20)); // let the "loading" message paint first
  return K.reading(params(extra));
}

/* ---------------- language ---------------- */

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll(".langswitch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  renderPicker();
}

/* ---------------- profile ---------------- */

function fillForm() {
  const f = $("#birthForm");
  const opts = PLACES.map((p) => `<option>${esc(p[0])}</option>`).join("");
  $("#placeSel").innerHTML = opts + "<option value=\"custom\">Custom…</option>";
  $("#hereSel").innerHTML = opts;
  for (const k of ["name", "date", "time", "lat", "lon", "tz"]) f.elements[k].value = profile[k];
  f.elements.place.value = PLACES.some((p) => p[0] === profile.place) ? profile.place : "custom";
  f.elements.here.value = PLACES.some((p) => p[0] === profile.here) ? profile.here : "Kuliyapitiya";
  toggleCustom();
}

function toggleCustom() {
  const f = $("#birthForm");
  const custom = f.elements.place.value === "custom";
  f.querySelectorAll(".custom").forEach((el) => el.classList.toggle("off", !custom));
  if (!custom) {
    const p = PLACES.find((x) => x[0] === f.elements.place.value);
    f.elements.lat.value = p[1]; f.elements.lon.value = p[2];
  }
}

function renderProfile(n, ns) {
  lastNatal = n;
  $("#profileSummary").innerHTML = `
    <span class="who">${esc(n.name)}</span>
    <span class="kv">${esc(t("lagna"))} <b>${esc(ns.lagna)}</b></span>
    <span class="kv">${esc(t("moon"))} <b>${esc(ns.moon)}</b></span>
    <span class="kv">${esc(t("star"))} <b>${esc(ns.star)}</b></span>
    <span class="kv">${esc(profile.date)} · ${esc(profile.time)} · ${esc(profile.place === "custom" ? `${profile.lat}, ${profile.lon}` : profile.place)}</span>`;
}

/* ---------------- moon glyph ---------------- */

function drawMoon(e) {
  const rad = (e * Math.PI) / 180;
  const rx = Math.abs(Math.cos(rad)) * 45;
  const waxing = e < 180;
  const gibbous = (e > 90 && e < 270);
  const d = waxing
    ? `M50 5 A45 45 0 0 1 50 95 A${rx} 45 0 0 ${gibbous ? 1 : 0} 50 5`
    : `M50 5 A45 45 0 0 0 50 95 A${rx} 45 0 0 ${gibbous ? 0 : 1} 50 5`;
  $("#moon").innerHTML = `
    <defs><radialGradient id="mg" cx="40%" cy="35%"><stop offset="0" stop-color="#fff8e6"/>
      <stop offset="1" stop-color="#d9c38f"/></radialGradient></defs>
    <circle cx="50" cy="50" r="45" fill="#2b1b12"/>
    <path d="${d}" fill="url(#mg)"/>
    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(212,162,55,.5)" stroke-width="1"/>`;
}

/* ---------------- shared bits ---------------- */

function dial(score, label, sub) {
  const c = 2 * Math.PI * 64;
  const off = c * (1 - score / 100);
  return `<div class="dial">
    <svg viewBox="0 0 160 160" role="img" aria-label="${score} / 100">
      <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(42,26,16,.12)" stroke-width="12"/>
      <circle cx="80" cy="80" r="64" fill="none" stroke="${heat(score)}" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 80 80)">
        <animate attributeName="stroke-dashoffset" from="${c}" to="${off}" dur="1.1s" fill="freeze"/></circle>
      <text x="80" y="92" text-anchor="middle" font-family="Gloock" font-size="42" fill="#2a1a10">${score}</text>
    </svg>
    <div class="lbl">${esc(label)}</div><div class="sub">${esc(sub)}</div></div>`;
}

function hero(eyebrow, title, lines, score, label, sub) {
  return `<section class="leaf hero reveal">
    <div><p class="date">${esc(eyebrow)}</p><h2>${esc(title)}</h2>
      <div class="summary">${lines.map((p) => `<p>${esc(p)}</p>`).join("")}</div></div>
    ${dial(score, label, sub)}</section>`;
}

const panel = (title, body, cls = "") => `<section class="leaf panel reveal ${cls}"><h3>${esc(title)}</h3>${body}</section>`;
const paras = (arr) => arr.map((p) => `<p>${esc(p)}</p>`).join("");

function simpleAreas(areas, title) {
  return `<h3 class="sectiontitle" style="font-family:var(--display);font-weight:400;font-size:28px;margin:6px 0 -6px;color:var(--leaf)">${esc(title)}</h3>
    <section class="areas">${areas.map((a, i) => `
    <article class="leaf area reveal" style="animation-delay:${i * 60}ms">
      <h4>${esc(a.title)} <span class="tone ${a.tone}">${esc(a.tone_word)}</span></h4>
      <p>${esc(a.text)}</p>
    </article>`).join("")}</section>`;
}

function simpleEvents(events, title) {
  return panel(title, events.length ? `<ul class="simple-list">${events.map((e) => `
      <li><time>${esc(e.date)} · ${esc(e.time)}</time>${esc(e.text)}</li>`).join("")}</ul>` : `<p>${esc(t("none"))}</p>`);
}

function detailsBlock(inner) {
  return `<div class="detailsbar"><button class="btn" type="button" id="detailsBtn" aria-expanded="${showDetails}">${esc(showDetails ? t("less") : t("more"))}</button></div>
    <div class="details" id="details" ${showDetails ? "" : "hidden"} lang="en"><p class="note">${esc(t("tech"))}</p>${inner}</div>`;
}

function wireDetails() {
  const b = $("#detailsBtn");
  if (!b) return;
  b.addEventListener("click", () => {
    showDetails = !showDetails;
    $("#details").hidden = !showDetails;
    b.textContent = showDetails ? t("less") : t("more");
    b.setAttribute("aria-expanded", String(showDetails));
  });
}

/* ---------------- technical pieces (English, inside "More details") ---------------- */

function chartGrid(cells, centre, lagnaIdx) {
  let html = "";
  for (let s = 0; s < 12; s++) {
    const [r, c] = SI_CELL[s];
    const house = ((s - lagnaIdx + 12) % 12) + 1;
    html += `<div class="c ${s === lagnaIdx ? "lagna" : ""}" style="grid-row:${r + 1};grid-column:${c + 1}">
      <small>${SIGNS[s].slice(0, 3)} · H${house}</small>
      ${(cells[s] || []).map((p) => `<span class="p ${p.retro ? "r" : ""}">${ABBR[p.planet]}${p.retro ? "℞" : ""} <small>${p.deg.toFixed(0)}°</small></span>`).join("")}
    </div>`;
  }
  return `<div class="sichart" role="img" aria-label="Chart grid">${html}<div class="mid">${centre}</div></div>`;
}

function skyHTML(sky) {
  const n = lastNatal;
  const cells = {};
  sky.forEach((p) => { const s = SIGNS.indexOf(p.sign); (cells[s] = cells[s] || []).push(p); });
  const natalCells = {};
  n.planets.forEach((p) => { (natalCells[p.sign_idx] = natalCells[p.sign_idx] || []).push(p); });
  return `<section class="leaf panel"><h3>Planet positions
      <span style="margin-left:auto;display:flex;gap:8px">
        <button class="btn" data-chart="sky" type="button">Sky</button>
        <button class="btn ghost" data-chart="natal" type="button">Birth chart</button></span></h3>
    <div class="chartwrap">
      <div data-pane="sky">${chartGrid(cells, `Transits<small>houses from your ${esc(n.lagna.sign)} Lagna</small>`, n.lagna.sign_idx)}</div>
      <div data-pane="natal" hidden>${chartGrid(natalCells, `${esc(n.name)}<small>birth chart · ${esc(n.lagna.sign)} Lagna</small>`, n.lagna.sign_idx)}</div>
      <div class="sky-scroll"><table class="sky"><thead><tr><th>Planet</th><th>Sign</th><th>Deg</th><th>Star</th><th>House</th><th>From Moon</th></tr></thead>
      <tbody>${sky.map((p) => `<tr>
        <td><span class="dot ${p.supportive ? "g" : "b"}"></span>${esc(p.planet)}${p.retro ? " ℞" : ""}</td>
        <td>${esc(p.sign)}</td><td class="num">${p.deg.toFixed(2)}</td>
        <td>${esc(p.nakshatra)}</td><td class="num">${p.house}</td><td class="num">${p.from_moon}</td></tr>`).join("")}</tbody></table></div>
    </div>
    <p style="font-size:14px;margin-top:12px;color:var(--ink-soft)">℞ = retrograde. Green dot = supportive from your birth Moon (classical gochara), red = testing.</p>
  </section>`;
}

function techEvents(events) {
  return `<section class="leaf panel"><h3>Sky events (technical)</h3>${events.length ? `<ul class="events">${events.map((e) => `
      <li class="${esc(e.kind)}"><time>${esc(e.date)}<br>${esc(e.time)}</time>
        <div><b>${esc(e.title)}</b><p>${esc(e.text)}</p></div></li>`).join("")}</ul>` : "<p>None.</p>"}</section>`;
}

function techAreas(areas) {
  return `<section class="leaf panel"><h3>Life areas - the reasoning</h3>${areas.map((a) =>
    `<p><strong>${esc(a.title)} (${esc(a.tone)}):</strong> ${esc(a.paragraphs.join(" "))}</p>`).join("")}</section>`;
}

function wireChartToggle() {
  out.querySelectorAll("[data-chart]").forEach((b) => b.addEventListener("click", () => {
    const sec = b.closest("section");
    sec.querySelectorAll("[data-chart]").forEach((x) => x.classList.toggle("ghost", x !== b));
    sec.querySelectorAll("[data-pane]").forEach((p) => { p.hidden = p.dataset.pane !== b.dataset.chart; });
  }));
}

/* ---------------- DAY ---------------- */

function renderDay(d) {
  const s = d.simple;
  const p = d.panchanga;
  drawMoon(p.elongation);
  const segColors = { good: "var(--leafgreen)", "very good": "#3e5a26", sensitive: "var(--ochre)",
                      challenging: "var(--vermilion)", difficult: "#7d1f10" };
  const tech = `
    <section class="strip">
      <div><small>Weekday</small><b>${esc(p.weekday)}</b> <small>ruled by ${esc(p.weekday_lord)}</small></div>
      <div><small>Tithi</small><b>${esc(p.tithi)}</b> <small>${esc(p.paksha)}</small></div>
      <div><small>Moon star</small><b>${esc(p.nakshatra)}</b> <small>in ${esc(p.moon_sign)}</small></div>
      <div><small>Your tara</small><b>${esc(p.tara)}</b></div>
      <div><small>Chandrashtama</small><b>${p.chandrashtama ? "Yes" : "No"}</b></div>
    </section>
    <section class="leaf panel timeline"><h3>How the day changes (Moon's star)</h3>
      <div class="tbar">${d.star_segments.map((g) => `
        <div style="flex:1;background:${segColors[g.quality] || "var(--ochre)"}">
          <span>${esc(g.nakshatra)} · ${esc(g.tara)}</span><small>${esc(g.from)} → ${esc(g.to)}</small></div>`).join("")}</div>
      <ul class="seglist">${d.star_segments.map((g) => `<li><b>${esc(g.from)} - ${esc(g.to)}</b> · ${esc(g.nakshatra)}, your ${esc(g.tara)} star: ${esc(g.meaning)}.</li>`).join("")}</ul>
    </section>
    <section class="leaf panel"><h3>The traditional reasoning</h3>${paras(d.summary)}${paras(d.moon)}${paras(d.weather)}
      ${d.hits.map((h) => `<p>✦ ${esc(h.text)}</p>`).join("")}</section>
    ${techAreas(d.areas)}
    <section class="leaf panel"><h3>Dasha periods</h3>${paras(d.dasha)}</section>
    ${skyHTML(d.sky)}
    ${techEvents(d.upcoming)}`;

  out.innerHTML = `
    ${hero(`${s.date}${d.is_today ? ` · ${t("asof")} ${s.as_of}` : ""}`, s.headline, s.lines, d.score, s.short, t("dayscore"))}
    ${panel(t("times"), `<div class="times">
      <div><small>${esc(t("best"))}</small>${esc(s.times.best)}</div>
      <div class="warn"><small>${esc(t("rahu"))}</small>${esc(s.times.rahu)}<br><small style="text-transform:none;letter-spacing:0">${esc(s.times.rahu_note)}</small></div>
      <div><small>${esc(t("sun"))}</small>${esc(s.times.sunrise)} / ${esc(s.times.sunset)}</div></div>`)}
    <section class="cols">
      <article class="leaf panel reveal lists do"><h3>${esc(t("do"))}</h3><ul>${s.do.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>
      <article class="leaf panel reveal lists avoid"><h3>${esc(t("avoid"))}</h3><ul>${s.avoid.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>
    </section>
    ${simpleAreas(s.areas, t("areas"))}
    ${panel(t("bigger"), paras(s.background))}
    ${panel(t("chapter"), paras(s.chapter))}
    ${simpleEvents(s.upcoming, t("coming"))}
    ${detailsBlock(tech)}`;
  wireDetails();
  wireChartToggle();
}

/* ---------------- MONTH ---------------- */

function renderMonth(m) {
  const s = m.simple;
  const blanks = Array.from({ length: m.first_weekday }, () => "<span></span>").join("");
  const shortOf = Object.fromEntries(s.days.map((d) => [d.date, d.short]));
  const scoreOf = Object.fromEntries(m.days.map((d) => [d.date, d.score]));
  const pill = (d) => `<button data-day="${d.date}" style="background:${heat(scoreOf[d.date])}">${esc(d.text)}</button>`;
  const tech = `
    <section class="leaf panel"><h3>Overview (technical)</h3>${paras(m.overview)}</section>
    <section class="leaf panel"><h3>Weeks (technical)</h3>${m.weeks.map((w) => `<p><strong>${esc(w.label)}:</strong> ${esc(w.text)}</p>`).join("")}</section>
    ${techAreas(m.areas)}
    <section class="leaf panel"><h3>Dasha periods</h3>${paras(m.dasha)}</section>
    ${skyHTML(m.sky)}
    ${techEvents(m.events)}`;

  out.innerHTML = `
    ${hero(t("m_reading"), s.title, s.lines, m.avg, s.short_label, t("monthavg"))}
    ${panel(t("daybyday"), `<p>${esc(t("tap"))}</p>
      <div class="cal">${s.weekdays.map((w) => `<div class="wd">${esc(w)}</div>`).join("")}${blanks}
        ${m.days.map((d) => `<button data-day="${d.date}" style="background:${heat(d.score)}" title="${esc(shortOf[d.date])}">
          <span class="n">${d.day}</span>
          ${d.chandrashtama ? '<span class="flag">◐</span>' : d.events ? '<span class="flag">✦</span>' : ""}
          <small>${esc(shortOf[d.date])}</small></button>`).join("")}
      </div>`)}
    <section class="cols">
      ${panel(t("brightest"), `<div class="daypills">${s.best.map(pill).join("")}</div>`)}
      ${panel(t("gentle"), `<div class="daypills">${s.careful.map(pill).join("")}</div>`)}
    </section>
    ${panel(t("weeks"), `<div class="weeks">${s.weeks.map((w) => `
      <div class="week"><div class="wl">${esc(w.label)}</div><div><p>${esc(w.text)}</p>
        ${w.events.length ? `<ul>${w.events.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}</div></div>`).join("")}</div>`)}
    ${simpleAreas(s.areas, t("areas_m"))}
    ${panel(t("chapter"), paras(s.chapter))}
    ${simpleEvents(s.events, t("events"))}
    ${detailsBlock(tech)}`;
  out.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => go("day", b.dataset.day)));
  wireDetails();
  wireChartToggle();
}

/* ---------------- YEAR ---------------- */

function renderYear(y) {
  const s = y.simple;
  const avg = Math.round(y.months.reduce((a, m) => a + m.avg, 0) / 12);
  const tech = `
    <section class="leaf panel"><h3>Overview (technical)</h3>${paras(y.overview)}</section>
    <section class="leaf panel"><h3>Slow planets (technical)</h3><ul>${y.journey.map((j) => `<li>${esc(j)}</li>`).join("")}</ul></section>
    ${techAreas(y.areas)}
    <section class="leaf panel"><h3>Dasha periods</h3>${paras(y.dasha)}</section>
    ${techEvents(y.events)}`;

  out.innerHTML = `
    ${hero(t("y_reading"), s.title, s.lines, avg, "", t("yearavg"))}
    <h3 style="font-family:var(--display);font-weight:400;font-size:28px;margin:6px 0 -6px;color:var(--leaf)">${esc(t("monthscards"))}</h3>
    <section class="months">${s.months.map((m, i) => {
      const raw = y.months[i];
      return `
      <button class="leaf mcard reveal" style="animation-delay:${i * 40}ms" data-month="${y.year}-${String(m.month).padStart(2, "0")}">
        <h4>${esc(m.name)} <small>${esc(m.short)}</small></h4>
        <div class="bar"><i style="width:${raw.avg}%;background:${heat(raw.avg)}"></i></div>
        <p>${esc(m.text)}</p>
        ${m.events.length ? `<ul>${m.events.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
        <div class="tones">
          <span class="tone ${m.tone_keys.love}">${esc(t("love"))} · ${esc(m.tones.love)}</span>
          <span class="tone ${m.tone_keys.career}">${esc(t("work"))} · ${esc(m.tones.career)}</span>
          <span class="tone ${m.tone_keys.money}">${esc(t("money"))} · ${esc(m.tones.money)}</span></div>
      </button>`; }).join("")}</section>
    ${panel(t("journey"), `<ul class="simple-list">${s.journey.map((j) => `<li>${esc(j)}</li>`).join("")}</ul>`)}
    ${s.dasha_changes.length ? panel(t("dchanges"), paras(s.dasha_changes)) : ""}
    ${panel(t("chapter"), paras(s.chapter))}
    ${simpleAreas(s.areas, t("areas_y"))}
    ${simpleEvents(s.events, t("events"))}
    ${detailsBlock(tech)}`;
  out.querySelectorAll("[data-month]").forEach((b) => b.addEventListener("click", () => go("month", b.dataset.month)));
  wireDetails();
}

/* ---------------- navigation ---------------- */

function renderPicker() {
  const pk = $("#picker");
  const m = state.mode;
  if (m === "today") pk.innerHTML = `<button class="btn ghost" id="refresh" type="button" style="color:var(--gold);border-color:var(--gold)">${esc(t("refresh"))}</button>`;
  if (m === "day") pk.innerHTML = `<input type="date" id="pv" value="${state.day}" aria-label="Date">`;
  if (m === "month") pk.innerHTML = `<input type="month" id="pv" value="${state.month}" aria-label="Month">`;
  if (m === "year") pk.innerHTML = `<input type="number" id="pv" value="${state.year}" min="1900" max="2100" style="width:110px" aria-label="Year">`;
  const pv = $("#pv");
  if (pv) pv.addEventListener("change", () => {
    if (!pv.value) return;
    state[m] = m === "year" ? +pv.value : pv.value;
    load();
  });
  const r = $("#refresh");
  if (r) r.addEventListener("click", load);
}

function go(mode, value) {
  state.mode = mode;
  if (value !== undefined) state[mode] = value;
  document.querySelectorAll(".modes [role=tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.mode === mode));
  renderPicker();
  load();
  window.scrollTo({ top: $(".modes").offsetTop - 10, behavior: "smooth" });
}

function render(data) {
  lastData = data;
  renderProfile(data.natal, data.natal_simple);
  if (data.mode === "day") renderDay(data);
  if (data.mode === "month") renderMonth(data);
  if (data.mode === "year") renderYear(data);
}

let seq = 0;
async function load() {
  const my = ++seq;
  const m = state.mode;
  location.hash = m === "today" ? "today" : `${m}=${state[m]}`;
  out.innerHTML = `<p class="status">${esc(t("loading"))}</p>`;
  try {
    let data;
    if (m === "today") data = await api("reading", { mode: "day" });
    if (m === "day") data = await api("reading", { mode: "day", date: state.day });
    if (m === "month") data = await api("reading", { mode: "month", month: state.month });
    if (m === "year") data = await api("reading", { mode: "year", year: state.year });
    if (my === seq) render(data);
  } catch (e) {
    if (my === seq) out.innerHTML = `<p class="status err">${esc(e.message)}</p>`;
  }
}

function init() {
  fillForm();
  applyLang();
  $("#editBtn").addEventListener("click", () => {
    const f = $("#birthForm");
    f.hidden = !f.hidden;
    $("#editBtn").setAttribute("aria-expanded", String(!f.hidden));
  });
  $("#placeSel").addEventListener("change", toggleCustom);
  $("#birthForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = ev.target;
    profile = { name: f.elements.name.value.trim() || "You", date: f.elements.date.value,
      time: f.elements.time.value, place: f.elements.place.value, lat: +f.elements.lat.value,
      lon: +f.elements.lon.value, tz: f.elements.tz.value, here: f.elements.here.value };
    localStorage.setItem("kendara.profile", JSON.stringify(profile));
    f.hidden = true; $("#editBtn").setAttribute("aria-expanded", "false");
    load();
  });
  $("#resetBtn").addEventListener("click", () => {
    localStorage.removeItem("kendara.profile");
    profile = { ...DEFAULT }; fillForm(); load();
  });
  document.querySelectorAll(".modes [role=tab]").forEach((b) => b.addEventListener("click", () => go(b.dataset.mode)));
  document.querySelectorAll(".langswitch button").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    localStorage.setItem("kendara.lang", lang);
    applyLang();
    load();
  }));

  const h = decodeURIComponent(location.hash.slice(1));
  const [mode, val] = h.split("=");
  if (["day", "month"].includes(mode) && val) { state[mode] = val; state.mode = mode; }
  if (mode === "year" && val) { state.year = +val; state.mode = "year"; }
  const q = new URLSearchParams(location.search);
  if (["si", "en"].includes(q.get("lang"))) { lang = q.get("lang"); applyLang(); }
  document.querySelectorAll(".modes [role=tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.mode === state.mode));
  renderPicker();
  load();
  if (state.mode !== "today" && state.mode !== "day") api("reading", { mode: "day" }).then((d) => drawMoon(d.panchanga.elongation)).catch(() => {});
}

init();
