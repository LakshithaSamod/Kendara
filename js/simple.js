/*
 * simple.js - plain-language readings in English ("en") or Sinhala ("si").
 *
 * readings.js does the astronomy and the traditional rules; this file only turns those
 * results into short, friendly sentences without technical terms (no house numbers,
 * degrees or "counted from the Moon"). All wording lives in phrases.js.
 */
(function (root) {
  "use strict";
  const K = root.K;
  const P = K.P;
  const R = K.R;

  const fmt = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : `{${k}}`));
  const pName = (lang, name) => P.PLANET[lang][name];
  const pad = (n) => String(n).padStart(2, "0");

  function time(jd, tz, lang) {
    const t = K.localParts(jd, tz);
    const h = t.hour % 12 || 12;
    if (lang === "si") return `${t.hour < 12 ? "පෙ.ව." : "ප.ව."} ${h}:${pad(t.minute)}`;
    return `${h}:${pad(t.minute)} ${t.hour < 12 ? "AM" : "PM"}`;
  }

  function date(jd, tz, lang, weekday = true, year = false) {
    const t = K.localParts(jd, tz);
    if (lang === "si") {
      let s = `${P.MONTH.si[t.month - 1]} ${t.day}`;
      if (year) s = `${t.year} ${s}`;
      return weekday ? `${s} (${P.WEEKDAY.si[t.weekday]})` : s;
    }
    const s = `${t.day} ${P.MONTH.en[t.month - 1].slice(0, 3)}` + (year ? ` ${t.year}` : "");
    return weekday ? `${P.WEEKDAY.en[t.weekday].slice(0, 3)} ${s}` : s;
  }

  function longDate(jd, tz, lang) {
    const t = K.localParts(jd, tz);
    if (lang === "si") return `${t.year} ${P.MONTH.si[t.month - 1]} ${t.day}, ${P.WEEKDAY.si[t.weekday]}`;
    return `${P.WEEKDAY.en[t.weekday]}, ${t.day} ${P.MONTH.en[t.month - 1]} ${t.year}`;
  }

  function join(items, lang) {
    if (items.length <= 1) return items.join("");
    return items.slice(0, -1).join(", ") + ` ${P.T[lang].and} ` + items[items.length - 1];
  }

  const isoJd = (iso, tz) => K.jdLocal(R.parseIso(iso), 12, tz);

  function lordThemes(natal, lord, lang) {
    const hs = [...new Set([...natal.rules(lord), natal.natalHouse(lord)])].sort((a, b) => a - b);
    return join(hs.map((h) => P.THEME_SHORT[lang][h]), lang);
  }

  /* ---------------- builders ---------------- */

  function areaSimple(a, lang) {
    const reasons = [];
    if (a.key === "love" && (a.items.some((i) => i.planet === "Venus" && i.retro) || (a.karaka && a.karaka.retro))) {
      reasons.push(P.VENUS_RETRO_LOVE[lang]);
    }
    if (a.moon_in !== null) reasons.push(P.MOON_IN[lang][a.moon_in ? 0 : 1]);
    for (const it of a.items) {
      if (it.planet === "Venus" && it.retro && a.key === "love") continue;
      const [g, b] = P.REASON[lang][it.planet];
      reasons.push(it.good ? g : b);
      if (it.retro) reasons.push(fmt(P.RETRO[lang], { p: pName(lang, it.planet) }));
    }
    const k = a.karaka;
    if (!a.items.length && k && k.retro && !(a.key === "love" && k.planet === "Venus")) {
      reasons.push(fmt(P.RETRO[lang], { p: pName(lang, k.planet) }));
    }
    const uniq = [...new Set(reasons)];
    return { key: a.key, title: P.AREA_TITLE[lang][a.key], tone: a.tone, tone_word: P.TONE[lang][a.tone],
      text: [P.AREA_BASE[lang][a.key][a.tone], ...uniq.slice(0, 2)].join(" ") };
  }

  function chapterSimple(natal, periods, tz, lang) {
    if (!periods) return [];
    const L = P.T[lang];
    const out = [fmt(L.chapter, { a: date(periods.md_start, tz, lang, false, true), b: date(periods.md_end, tz, lang, false, true),
      p: pName(lang, periods.md), themes: lordThemes(natal, periods.md, lang) })];
    const b = date(periods.ad_end, tz, lang, false, true);
    out.push(periods.ad === periods.md
      ? fmt(L.sub_same, { p: pName(lang, periods.md), b })
      : fmt(L.sub, { p: pName(lang, periods.ad), b, themes: lordThemes(natal, periods.ad, lang) }));
    return out;
  }

  function backgroundSimple(raw, lang) {
    const L = P.T[lang];
    const out = [];
    if (raw.sade_sati) out.push(L.sade_sati);
    out.push(raw.jupiter_good ? L.jup_good : L.jup_quiet);
    return out;
  }

  function eventSimple(e, tz, lang) {
    const L = P.T[lang];
    const theme = P.THEME_SHORT[lang][e.house];
    const p = pName(lang, e.planet);
    let text;
    if (e.kind === "ingress") text = fmt(L.ing, { p, theme, effect: P.EFFECT[lang][e.planet] });
    else if (e.kind === "station") text = fmt(e.direction === "retro" ? L.retro_ev : L.direct_ev, { p, theme });
    else if (e.kind === "lunation") text = fmt(e.lunation === "full" ? L.full : L.new, { theme });
    else text = fmt(L["eclipse_" + e.eclipse], { theme });
    return { date: date(e.jd, tz, lang), time: time(e.jd, tz, lang), kind: e.kind, text };
  }

  function day(d, natal, tz, lang) {
    const raw = d.raw;
    const L = P.T[lang];
    const mh = raw.moon_house, ti = raw.tara_i;
    const lines = [P.MOOD[lang][mh], P.STAR[lang][ti]];
    if (raw.chandrashtama) lines.push(L.chandrashtama);

    // Best window: the longest good-star stretch inside daylight
    let best = null;
    for (const s of d.star_segments) {
      if (R.TARA[s.tara_i][2] <= 0) continue;
      const a = Math.max(s.from_jd, raw.sunrise), b = Math.min(s.to_jd, raw.sunset);
      if (b - a > 1 / 48 && (!best || b - a > best[1] - best[0])) best = [a, b];
    }
    const [ra, rb] = raw.rahu;
    const times = {
      best: best ? fmt(L.range, { a: time(best[0], tz, lang), b: time(best[1], tz, lang) }) : L.no_best,
      rahu: fmt(L.range, { a: time(ra, tz, lang), b: time(rb, tz, lang) }),
      rahu_note: L.rahu_note,
      sunrise: time(raw.sunrise, tz, lang), sunset: time(raw.sunset, tz, lang),
    };

    const doList = [P.DO_BY_MOOD[lang][mh]];
    const avoid = [];
    if (R.TARA[ti][2] > 0) doList.push(ti === 7 || ti === 8 ? L.ask_help : L.start_new);
    else avoid.push(L.avoid_new);
    if (raw.retros.includes("Venus")) avoid.push(L.avoid_love);
    if (raw.retros.includes("Mercury")) avoid.push(L.avoid_msgs);
    if (raw.chandrashtama) avoid.push(L.avoid_fight);
    avoid.push(fmt(L.avoid_rahu, { a: time(ra, tz, lang), b: time(rb, tz, lang) }));

    return {
      date: longDate(raw.date_jd, tz, lang), as_of: time(raw.ref_jd, tz, lang),
      headline: P.HEADLINE[lang][d.label], short: P.SHORT[lang][d.label],
      lines, times, do: doList, avoid,
      areas: d.areas.map((a) => areaSimple(a, lang)),
      background: backgroundSimple(raw, lang),
      chapter: chapterSimple(natal, raw.periods, tz, lang),
      upcoming: d.upcoming.map((e) => eventSimple(e, tz, lang)),
    };
  }

  function month(m, natal, tz, lang) {
    const raw = m.raw;
    const L = P.T[lang];
    const label = R.scoreLabel(m.avg);
    const lines = [fmt(L.month_focus, { theme: P.THEME[lang][raw.sun_house] }),
      fmt(L.month_overall, { word: P.WORD[lang][label] }), ...backgroundSimple(raw, lang)];
    const weeks = m.weeks.map((w) => ({
      label: w.label,
      text: fmt(L.week, { word: P.WORD[lang][R.scoreLabel(w.avg)], best: date(isoJd(w.best, tz), tz, lang), low: date(isoJd(w.low, tz), tz, lang) }),
      events: w.events.map((e) => eventSimple(e, tz, lang).text),
    }));
    const pill = (d) => ({ date: d.date, text: date(isoJd(d.date, tz), tz, lang) });
    return {
      title: lang === "en" ? `${P.MONTH[lang][m.month - 1]} ${m.year}` : `${m.year} ${P.MONTH[lang][m.month - 1]}`,
      lines, short_label: P.WORD[lang][label],
      days: m.days.map((d) => ({ date: d.date, short: P.SHORT[lang][d.label] })),
      best: m.best.map(pill), careful: m.careful.map(pill), weeks,
      areas: m.areas.map((a) => areaSimple(a, lang)),
      chapter: chapterSimple(natal, raw.periods, tz, lang),
      events: m.events.map((e) => eventSimple(e, tz, lang)),
      weekdays: P.WEEKDAY[lang].map((w) => (lang === "en" ? w.slice(0, 3) : w)),
    };
  }

  function year(y, natal, tz, lang) {
    const raw = y.raw;
    const L = P.T[lang];
    const names = P.MONTH[lang];
    const lines = [fmt(L.year_best, { best: join(raw.best.map((i) => names[i - 1]), lang), worst: join(raw.worst.map((i) => names[i - 1]), lang) })];
    if (raw.sade_sati) lines.push(L.sade_sati);
    const months = y.months.map((mo) => ({
      month: mo.month, name: names[mo.month - 1], short: P.WORD[lang][R.scoreLabel(mo.avg)],
      text: fmt(L.card, { theme: P.THEME[lang][mo.sun_house] }),
      events: mo.events.filter((e) => ["eclipse", "station"].includes(e.kind) || ["Jupiter", "Saturn", "Venus"].includes(e.planet))
        .slice(0, 2).map((e) => eventSimple(e, tz, lang).text),
      tones: { love: P.TONE[lang][mo.love], career: P.TONE[lang][mo.career], money: P.TONE[lang][mo.money] },
      tone_keys: { love: mo.love, career: mo.career, money: mo.money },
    }));
    const journey = raw.journey.map((j) => fmt(L.journey, {
      p: pName(lang, j.planet), role: P.ROLE[lang][j.planet],
      path: j.segments.map((s) => fmt(L.journey_seg, { theme: P.THEME_SHORT[lang][s.house], date: date(isoJd(s.from, tz), tz, lang, false) })).join(L.then),
    }));
    const changes = raw.dasha_changes.map((c) => fmt(L.dasha_change, { date: date(c.jd, tz, lang, false, true), p: pName(lang, c.lord), themes: lordThemes(natal, c.lord, lang) }));
    return {
      title: String(y.year), lines, months, journey, dasha_changes: changes,
      chapter: chapterSimple(natal, raw.periods, tz, lang),
      areas: y.areas.map((a) => areaSimple(a, lang)),
      events: y.events.map((e) => eventSimple(e, tz, lang)),
    };
  }

  // Profile line: sign names in Sinhala; nakshatra names stay in English
  // (their Sinhala spellings are not yet confirmed).
  function natalSimple(n, lang) {
    if (lang !== "si") return { lagna: n.lagna.sign, moon: n.moon_sign, star: n.birth_star };
    return { lagna: P.SIGN_SI[n.lagna.sign_idx], moon: P.SIGN_SI[K.SIGN_EN.indexOf(n.moon_sign)], star: n.birth_star };
  }

  K.S = { day, month, year, natalSimple };
})(typeof window !== "undefined" ? window : globalThis);
