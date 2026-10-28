/*
 * readings.js - turns positions into *traditional* readings (port of readings.py).
 *
 *   FACT      positions, dates, sunrise, dasha periods (engine.js)
 *   TRADITION what those positions are said to mean: classical gochara (transits counted
 *             from the natal Moon), tara bala, chandrashtama, house themes, dasha lords.
 *             Belief, not science, and never a guaranteed forecast.
 *
 * The English text here is the technical layer shown under "More details";
 * simple.js builds the plain English / Sinhala reading from the same results.
 */
(function (root) {
  "use strict";
  const K = root.K;
  const { SIGN_EN, SIGN_SK, NAK_NAMES, ORDER, SIGN_LORDS, VIMSHOTTARI, VIM_TOTAL, DAY_YEARS } = K;

  const SLOW = ["Jupiter", "Saturn", "Rahu", "Ketu"];
  const MEDIUM = ["Sun", "Mars", "Mercury", "Venus"];

  const HOUSE = {
    1: ["self", "your body, energy, confidence and the way you come across"],
    2: ["money & family", "savings, family, food and the way you speak"],
    3: ["courage & communication", "courage, messages, short trips, siblings and your own effort"],
    4: ["home & heart", "home, mother, vehicles, comfort and inner peace"],
    5: ["romance & creativity", "romance, creativity, children, studies and joy"],
    6: ["work & obstacles", "daily work, competition, debts, health routines and rivals"],
    7: ["partnership", "your partner, marriage, one-to-one relationships and agreements"],
    8: ["depth & change", "sudden change, secrets, intimacy, shared money and deep emotions"],
    9: ["luck & wisdom", "luck, father, teachers, long journeys, faith and higher learning"],
    10: ["career", "career, status, reputation and responsibility"],
    11: ["gains & friends", "income, gains, friends, networks and wishes coming true"],
    12: ["rest & release", "expenses, sleep, solitude, foreign places and letting go"],
  };

  const PLANET = {
    Sun: { nature: "identity, authority and vitality", verb: "puts a spotlight on",
      good: "recognition, confidence and support from people in authority",
      hard: "ego clashes, pressure from authority or low energy" },
    Moon: { nature: "mood and feelings", verb: "colours the mood of",
      good: "emotional ease and good timing", hard: "restlessness or over-sensitivity" },
    Mars: { nature: "energy, drive and courage", verb: "energises - and can heat up -",
      good: "courage, beating rivals and getting things done",
      hard: "impatience, arguments or mistakes made in a hurry" },
    Mercury: { nature: "thinking, talking and trade", verb: "sets thinking and talking in motion in",
      good: "clear thinking, useful conversations and good deals",
      hard: "mix-ups, nervousness or scattered focus" },
    Jupiter: { nature: "growth, wisdom and blessing", verb: "expands and protects",
      good: "growth, help from others and wise choices",
      hard: "over-confidence, or help arriving slower than you hope" },
    Venus: { nature: "love, beauty and comfort", verb: "sweetens",
      good: "affection, harmony, comfort and attraction",
      hard: "indulgence, jealousy or love feeling complicated" },
    Saturn: { nature: "discipline, time and responsibility", verb: "slows down and tests",
      good: "steady progress that lasts, and reward for patient work",
      hard: "delays, heaviness, tiredness and extra responsibility" },
    Rahu: { nature: "desire, ambition and the unusual", verb: "amplifies and unsettles",
      good: "unexpected openings and bold ambition paying off",
      hard: "confusion, cravings or restless dissatisfaction" },
    Ketu: { nature: "detachment and the inner life", verb: "draws energy away from",
      good: "insight, and the ability to let go of what is finished",
      hard: "disinterest, feeling cut off, or things slipping away" },
  };

  // Classical gochara: houses counted from the natal Moon where a transit is favourable.
  const GOCHARA_GOOD = {
    Sun: [3, 6, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [3, 6, 11],
    Mercury: [2, 4, 6, 8, 10, 11], Jupiter: [2, 5, 7, 9, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], Saturn: [3, 6, 11], Rahu: [3, 6, 11], Ketu: [3, 6, 11],
  };
  const good = (planet, fromMoon) => GOCHARA_GOOD[planet].includes(fromMoon);

  // Tara bala: [name, quality, score, meaning]
  const TARA = [
    ["Janma", "sensitive", -5, "your own birth star returns - a sensitive day; good for looking after yourself, not for big risks"],
    ["Sampat", "good", 15, "the 'wealth' star - traditionally good for money matters, effort and starting things"],
    ["Vipat", "challenging", -15, "the 'obstacle' star - tradition says finish things today rather than begin them"],
    ["Kshema", "good", 12, "the 'well-being' star - safe and comfortable, good for health and steady work"],
    ["Pratyak", "challenging", -12, "the 'opposition' star - expect some resistance; keep plans flexible and avoid confrontation"],
    ["Sadhana", "good", 15, "the 'achievement' star - good for effort, goals and getting things done"],
    ["Naidhana", "difficult", -20, "the most cautious star of the cycle - rest, go carefully, avoid big decisions and risky travel"],
    ["Mitra", "good", 12, "the 'friend' star - good for people, cooperation and help from friends"],
    ["Parama Mitra", "very good", 18, "the 'best friend' star - one of the most supportive days in the cycle"],
  ];

  const TITHI = ["Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
    "Ashtami", "Navami", "Dashami", "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi"];

  const WEEKDAY_LORD = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]; // Mon = 0
  const WEEKDAY_FLAVOUR = {
    Sun: "the Sun's day - traditionally good for health, dealing with authority and government matters",
    Moon: "the Moon's day - traditionally good for family, travel by water, and caring for others",
    Mars: "Mars's day - traditionally good for courage, sport, property and technical work; avoid quarrels",
    Mercury: "Mercury's day - traditionally good for study, writing, trade and communication",
    Jupiter: "Jupiter's day - traditionally good for learning, teachers, religion and important beginnings",
    Venus: "Venus's day - traditionally good for love, art, beauty, clothes and celebrations",
    Saturn: "Saturn's day - traditionally good for steady, hard work and finishing old tasks",
  };
  const RAHU_KALAM_PART = { 0: 2, 1: 7, 2: 5, 3: 6, 4: 4, 5: 3, 6: 8 }; // weekday -> 1..8 part of daylight

  const AREAS = [
    { key: "love", title: "Love & relationships", houses: [5, 7], karaka: "Venus", focus: "romance, your partner and closeness" },
    { key: "career", title: "Work & career", houses: [10, 6], karaka: "Saturn", focus: "work, ambition and reputation" },
    { key: "money", title: "Money", houses: [2, 11], karaka: "Jupiter", focus: "income, savings and spending" },
    { key: "health", title: "Health & energy", houses: [1, 6], karaka: "Sun", focus: "your body, energy and stress" },
    { key: "mind", title: "Mind & communication", houses: [3], karaka: "Mercury", focus: "thinking, talking, studies and messages" },
    { key: "home", title: "Home & family", houses: [4, 2], karaka: "Moon", focus: "home, parents and family" },
  ];

  function ordinal(n) {
    const s = n % 100 >= 10 && n % 100 <= 20 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th");
    return `${n}${s}`;
  }
  const houseLabel = (h) => `${ordinal(h)} house of ${HOUSE[h][0]}`;
  const sortNum = (a) => [...a].sort((x, y) => x - y);
  const uniqSorted = (a) => sortNum([...new Set(a)]);

  /* ---------------- time & formatting ---------------- */

  const WEEKDAY_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const MONTH_EN = ["January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December"];
  const pad = (n) => String(n).padStart(2, "0");

  function fmtTime(jd, tz) {
    const p = K.localParts(jd, tz);
    return `${p.hour % 12 || 12}:${pad(p.minute)} ${p.hour < 12 ? "AM" : "PM"}`;
  }
  function fmtDate(jd, tz) {
    const p = K.localParts(jd, tz);
    return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
  }

  // Plain dates {y, m, d}
  function addDays(date, n) {
    const t = new Date(Date.UTC(date.y, date.m - 1, date.d + n));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  const isoDate = (date) => `${date.y}-${pad(date.m)}-${pad(date.d)}`;
  const weekdayOf = (date) => (new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay() + 6) % 7;
  const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  function parseIso(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
    if (!m) throw new Error(`invalid date '${s}'`);
    const date = { y: +m[1], m: +m[2], d: +m[3] };
    if (date.m < 1 || date.m > 12 || date.d < 1 || date.d > daysInMonth(date.y, date.m)) throw new Error(`invalid date '${s}'`);
    return date;
  }

  // Find the moment f changes value between jd a and b (f(a) != f(b)), to the minute.
  function bisect(f, a, b, tol = 1 / 1440) {
    const fa = f(a);
    while (b - a > tol) {
      const m = (a + b) / 2;
      if (f(m) === fa) a = m; else b = m;
    }
    return b;
  }

  function tithiAt(jd) {
    const e = K.elongation(jd);
    const i = Math.floor(e / 12);
    if (i < 15) return { index: i + 1, name: i === 14 ? "Purnima (full moon)" : TITHI[i], paksha: "Shukla (waxing)", elongation: e };
    return { index: i + 1, name: i === 29 ? "Amavasya (new moon)" : TITHI[i - 15], paksha: "Krishna (waning)", elongation: e };
  }

  /* ---------------- natal chart ---------------- */

  class Natal {
    constructor(name, date, hour, minute, lat, lon, tz) {
      this.name = name || "You";
      Object.assign(this, { date, hour, minute, lat, lon, tz });
      const c = K.computeChart(date, hour, minute, tz, lat, lon);
      this.chart = c;
      this.jd = c.jd_ut;
      this.asc = c.asc;
      this.asc_sign = c.asc_sign_idx;
      this.planets = c.planets;
      this.moon_sign = this.planets.Moon.sign_idx;
      this.moon_nak = Math.floor(this.planets.Moon.lon / K.NAK_SPAN) % 27;
      this.dasha = K.vimshottari(this.planets.Moon.lon, this.jd);
    }
    houseOfSign(s) { return ((s - this.asc_sign + 12) % 12) + 1; }
    fromMoon(s) { return ((s - this.moon_sign + 12) % 12) + 1; }
    rules(planet) {
      const out = [];
      for (let s = 0; s < 12; s++) if (SIGN_LORDS[s] === planet) out.push(this.houseOfSign(s));
      return sortNum(out);
    }
    natalHouse(planet) { return this.planets[planet].house; }
    summary() {
      const [an, ap] = K.nakshatraOf(this.asc);
      return {
        name: this.name,
        lagna: { sign: SIGN_EN[this.asc_sign], sign_sk: SIGN_SK[this.asc_sign], sign_idx: this.asc_sign,
                 deg: Math.round((this.asc % 30) * 100) / 100, nakshatra: NAK_NAMES[an], pada: ap },
        moon_sign: SIGN_EN[this.moon_sign],
        birth_star: NAK_NAMES[this.moon_nak],
        ayanamsa: Math.round(this.chart.ayanamsa * 10000) / 10000,
        tz: this.tz,
        planets: ORDER.map((nm) => {
          const p = this.planets[nm];
          return { planet: nm, sign: SIGN_EN[p.sign_idx], sign_sk: SIGN_SK[p.sign_idx], sign_idx: p.sign_idx,
                   deg: Math.round(p.sign_deg * 100) / 100, house: p.house, nakshatra: p.nakshatra, pada: p.pada,
                   retro: !!p.retro && nm !== "Rahu" && nm !== "Ketu" };
        }),
      };
    }
    // Vimshottari periods active at a moment
    periodsAt(jd) {
      const seq = VIMSHOTTARI.map((x) => x[0]);
      const yrs = Object.fromEntries(VIMSHOTTARI);
      for (const md of this.dasha.timeline) {
        if (md.start_jd <= jd && jd < md.end_jd) {
          // Sub-periods run from the *notional* start of the mahadasha, so the first
          // (partial) dasha at birth needs its elapsed part added back.
          const notional = md.start_jd - (md.full_years - md.years) * DAY_YEARS;
          const ads = K.antardashas(md.lord, md.full_years, notional);
          const ad = ads.find((a) => a.start_jd <= jd && jd < a.end_jd);
          const k = seq.indexOf(ad.lord);
          let t = ad.start_jd, pd = null;
          for (let j = 0; j < 9; j++) {
            const lord = seq[(k + j) % 9];
            const length = (ad.years * yrs[lord]) / VIM_TOTAL * DAY_YEARS;
            if (t <= jd && jd < t + length) { pd = { lord, start_jd: t, end_jd: t + length }; break; }
            t += length;
          }
          return { md, ad, pd, ads };
        }
      }
      return null;
    }
  }

  /* ---------------- interpretation helpers (TRADITION layer) ---------------- */

  function planetHouseText(natal, name, p) {
    const h = natal.houseOfSign(p.sign);
    const fm = natal.fromMoon(p.sign);
    const info = PLANET[name];
    const g = good(name, fm);
    let s = `${name} - the planet of ${info.nature} - ${info.verb} your ${houseLabel(h)} (${HOUSE[h][1]}). `;
    s += g
      ? `Counted from your Moon this is the ${ordinal(fm)} position, which the classical transit rules treat as supportive, so tradition expects ${info.good}.`
      : `Counted from your Moon this is the ${ordinal(fm)} position, which the classical transit rules treat as testing, so tradition warns of ${info.hard}.`;
    if (p.retro) s += ` ${name} is also retrograde (it appears to move backwards), traditionally a time to review and redo rather than start fresh in this area.`;
    return [s, g, h];
  }

  function saturnNotes(natal, pos) {
    const fm = natal.fromMoon(pos.Saturn.sign);
    const notes = [];
    if ([12, 1, 2].includes(fm)) {
      const phase = { 12: "first (rising)", 1: "second (peak)", 2: "third (setting)" }[fm];
      notes.push(`Sade Sati, ${phase} phase: Saturn is in the ${ordinal(fm)} from your Moon. Tradition sees these 7.5 years as a slow, maturing test - more responsibility, less shortcut - not as bad luck. Patience and steady routines are the classic advice.`);
    } else if (fm === 8) {
      notes.push("Ashtama Shani: Saturn is 8th from your Moon, a phase tradition links to strain, worry and needing extra care with health and big risks.");
    } else if (fm === 4) {
      notes.push("Kantaka Shani: Saturn is 4th from your Moon, traditionally linked to pressure around home, comfort and peace of mind.");
    }
    const jf = natal.fromMoon(pos.Jupiter.sign);
    notes.push([2, 5, 7, 9, 11].includes(jf)
      ? `Jupiter is in a favourable place from your Moon (the ${ordinal(jf)}) - tradition counts this as a protective, helpful background.`
      : `Jupiter is ${ordinal(jf)} from your Moon, which tradition does not count as one of its helpful positions - its support works more quietly right now.`);
    return notes;
  }

  function dashaText(natal, periods, tz) {
    if (!periods) return [];
    const { md, ad, pd } = periods;
    const lordStory = (lord) => {
      const ruled = natal.rules(lord);
      const sits = natal.natalHouse(lord);
      const parts = [];
      if (ruled.length) parts.push("rules your " + ruled.map((h) => `${ordinal(h)} (${HOUSE[h][0]})`).join(" and "));
      parts.push(`sits in your ${ordinal(sits)} (${HOUSE[sits][0]})`);
      return [parts.join(" and "), uniqSorted([...ruled, sits])];
    };
    const [mdStory, mdTh] = lordStory(md.lord);
    const [adStory, adTh] = lordStory(ad.lord);
    const out = [
      `You are in the ${md.lord} major period (Mahadasha), ${fmtDate(md.start_jd, tz)} to ${fmtDate(md.end_jd, tz)}. In your chart ${md.lord} ${mdStory}, so tradition says these years bring ${mdTh.map((h) => HOUSE[h][0]).join(", ")} to the front of your life.`,
      ad.lord !== md.lord
        ? `Inside it runs the ${ad.lord} sub-period (Antardasha), ${fmtDate(ad.start_jd, tz)} to ${fmtDate(ad.end_jd, tz)}. ${ad.lord} ${adStory}, adding the colour of ${adTh.map((h) => HOUSE[h][0]).join(", ")}.`
        : `Right now you are in its opening sub-period, ${md.lord}-${md.lord} (${fmtDate(ad.start_jd, tz)} to ${fmtDate(ad.end_jd, tz)}) - tradition says a period's own sub-period delivers its themes in their purest, most concentrated form.`,
    ];
    if (pd) {
      const [, pth] = lordStory(pd.lord);
      out.push(`At the finest level, the ${pd.lord} mini-period (Pratyantar) runs ${fmtDate(pd.start_jd, tz)} to ${fmtDate(pd.end_jd, tz)}, briefly highlighting ${pth.map((h) => HOUSE[h][0]).join(", ")}.`);
    }
    return out;
  }

  function periodsRaw(p) {
    if (!p) return null;
    return { md: p.md.lord, md_start: p.md.start_jd, md_end: p.md.end_jd,
             ad: p.ad.lord, ad_start: p.ad.start_jd, ad_end: p.ad.end_jd };
  }

  function areaReading(natal, area, pos, periods, moonHouse = null, moonFm = null) {
    const paras = [], items = [];
    let score = 0, moonIn = null, karaka = null;
    const hs = area.houses;
    if (moonHouse !== null && hs.includes(moonHouse)) {
      const g = good("Moon", moonFm);
      moonIn = g;
      paras.push(`Today the Moon passes through your ${houseLabel(moonHouse)}, so ${area.focus} are on your mind and feelings run closer to the surface here. `
        + (g ? "It is a supportive Moon position, good for gentle progress." : "It is a sensitive Moon position, better for listening than pushing."));
      score += g ? 8 : -6;
    }
    for (const name of [...SLOW, ...MEDIUM]) {
      const p = pos[name];
      if (hs.includes(natal.houseOfSign(p.sign))) {
        const [text, g] = planetHouseText(natal, name, p);
        paras.push(text);
        items.push({ planet: name, good: g, retro: p.retro });
        score += SLOW.includes(name) ? (g ? 10 : -8) : (g ? 6 : -5);
      }
    }
    const k = area.karaka;
    const kp = pos[k];
    const kh = natal.houseOfSign(kp.sign);
    const karakaInArea = [...SLOW, ...MEDIUM].some((n) => n === k && hs.includes(natal.houseOfSign(pos[n].sign)));
    if (!karakaInArea) {
      const kg = good(k, natal.fromMoon(kp.sign));
      karaka = { planet: k, good: kg, retro: kp.retro };
      paras.push(`${k}, the natural significator of this area, is in your ${houseLabel(kh)}`
        + (kg ? ", a supportive placement from your Moon" : ", a testing placement from your Moon")
        + (kp.retro ? " and retrograde - a review phase." : "."));
      score += kg ? 4 : -3;
    }
    if (periods) {
      const lords = [["major period", periods.md.lord]];
      if (periods.ad.lord !== periods.md.lord) lords.push(["sub-period", periods.ad.lord]);
      for (const [lvl, lord] of lords) {
        const link = uniqSorted([...natal.rules(lord), natal.natalHouse(lord)].filter((h) => hs.includes(h)));
        if (link.length) {
          paras.push(`Your ${lvl} lord ${lord} is tied to your ${link.map(ordinal).join(", ")} house, which tradition reads as this area being actively 'switched on' in this chapter of life.`);
          score += 3;
        }
      }
    }
    if (!paras.length) paras.push(`No major planet is moving through the houses of ${area.focus} right now - tradition would call this a quiet, stable background for this area.`);
    const tone = score >= 8 ? "supportive" : score >= -4 ? "mixed" : "testing";
    const advice = {
      supportive: "Tradition's advice: a good time to move forward here.",
      mixed: "Tradition's advice: steady and sincere - avoid forcing outcomes.",
      testing: "Tradition's advice: be patient, review, and protect what you have.",
    }[tone];
    return { key: area.key, title: area.title, tone, score, paragraphs: paras, advice, items, karaka, moon_in: moonIn };
  }

  function natalHits(natal, pos, orb = 2) {
    const hits = [];
    const targets = ORDER.map((nm) => [nm, natal.planets[nm].lon]);
    targets.push(["Lagna", natal.asc]);
    for (const name of ORDER) {
      for (const [t, lon] of targets) {
        const d = Math.abs(((pos[name].lon - lon + 540) % 360) - 180);
        if (d <= orb) {
          hits.push({ transit: name, natal: t, orb: Math.round(d * 100) / 100,
            text: `Transiting ${name} is passing over your birth ${t} (within ${d.toFixed(1)}°) - tradition treats this as a moment when ${PLANET[name].nature} touches ${t !== "Lagna" ? "your " + t : "you personally"}.` });
        }
      }
    }
    return hits;
  }

  /* ---------------- events: ingresses, stations, new/full moons, eclipses ---------------- */

  const EVENT_BODIES = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu"];

  function ingress(b, s, h, t, tz) {
    return { jd: t, date: fmtDate(t, tz), time: fmtTime(t, tz), kind: "ingress", planet: b, house: h,
      title: `${b} enters ${SIGN_EN[s]} - your ${houseLabel(h)}`,
      text: `${b} (${PLANET[b].nature}) moves into your ${ordinal(h)} house, so tradition says its influence now shifts to ${HOUSE[h][1]}.` };
  }

  function findEvents(natal, jd1, jd2, tz) {
    const events = [];
    const lon = (b, jd) => K.siderealLon(b, jd);
    const spd = (b, jd) => K.speed(b, jd);
    for (const b of EVENT_BODIES) {
      let jd = jd1;
      let prevSign = Math.floor(lon(b, jd) / 30);
      let prevR = spd(b, jd) < 0;
      while (jd < jd2) {
        const nxt = Math.min(jd + 1, jd2);
        const s = Math.floor(lon(b, nxt) / 30);
        const r = b === "Rahu" ? prevR : spd(b, nxt) < 0;
        if (s !== prevSign) {
          const t = bisect((x) => Math.floor(lon(b, x) / 30), jd, nxt);
          events.push(ingress(b, s, natal.houseOfSign(s), t, tz));
          if (b === "Rahu") { const ks = (s + 6) % 12; events.push(ingress("Ketu", ks, natal.houseOfSign(ks), t, tz)); }
        }
        if (b !== "Rahu" && r !== prevR) {
          const t = bisect((x) => spd(b, x) < 0, jd, nxt);
          const h = natal.houseOfSign(Math.floor(lon(b, t) / 30));
          events.push({ jd: t, date: fmtDate(t, tz), time: fmtTime(t, tz), kind: "station", planet: b, house: h,
            direction: r ? "retro" : "direct",
            title: `${b} turns ${r ? "retrograde" : "direct"} in your ${ordinal(h)} house`,
            text: r
              ? `${b} appears to stop and reverse. Tradition reads a ${b} retrograde as a time to review ${PLANET[b].nature} matters around ${HOUSE[h][1]}.`
              : `${b} resumes forward motion. Tradition reads this as delays and second thoughts around ${HOUSE[h][1]} starting to clear.` });
        }
        prevSign = s; prevR = r; jd = nxt;
      }
    }

    // New & full moons (elongation crosses 0 or 180)
    let jd = jd1;
    let pe = K.elongation(jd);
    while (jd < jd2) {
      const nxt = Math.min(jd + 0.25, jd2);
      const e = K.elongation(nxt);
      const kind = pe > 300 && e < 60 ? "new" : pe < 180 && e >= 180 ? "full" : null;
      if (kind) {
        const t = bisect((x) => (kind === "full" ? K.elongation(x) < 180 : K.elongation(x) > 180), jd, nxt);
        const ms = Math.floor(K.siderealLon("Moon", t) / 30);
        const h = natal.houseOfSign(ms);
        events.push({ jd: t, date: fmtDate(t, tz), time: fmtTime(t, tz), kind: "lunation", planet: "Moon", house: h, lunation: kind,
          title: kind === "full" ? `Full Moon (Poya) in ${SIGN_EN[ms]} - your ${ordinal(h)} house` : `New Moon in ${SIGN_EN[ms]} - your ${ordinal(h)} house`,
          text: kind === "full"
            ? `A Poya day. Tradition sees the full Moon as a peak of feeling and completion; in your chart it lights up ${HOUSE[h][1]}.`
            : `The darkest Moon. Tradition treats it as a quiet reset - a time to plan rather than launch - here around ${HOUSE[h][1]}.` });
      }
      pe = e; jd = nxt;
    }

    for (const ec of K.eclipses(jd1, jd2)) {
      const h = natal.houseOfSign(Math.floor(K.siderealLon("Moon", ec.jd) / 30));
      const sort = ec.sort;
      events.push({ jd: ec.jd, date: fmtDate(ec.jd, tz), time: fmtTime(ec.jd, tz), kind: "eclipse",
        planet: ec.kind === "solar" ? "Sun" : "Moon", house: h, eclipse: ec.kind,
        title: `${sort[0].toUpperCase() + sort.slice(1)} ${ec.kind} eclipse in your ${ordinal(h)} house`,
        text: `Somewhere on Earth there is a ${sort} ${ec.kind} eclipse (it may not be visible in Sri Lanka). Tradition treats eclipses as unsettled days - avoid starting important things - and links this one to ${HOUSE[h][1]}.` });
    }
    events.sort((a, b) => a.jd - b.jd);
    return events;
  }

  /* ---------------- day scoring ---------------- */

  function scoreLabel(score) {
    return score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 48 ? "Mixed" : score >= 35 ? "Careful" : "Quiet & cautious";
  }

  function dayCore(natal, jd, withSpeed = false) {
    const pos = K.positions(jd, withSpeed);
    const m = pos.Moon;
    const taraI = (((m.nak - natal.moon_nak) % 27) + 27) % 27 % 9;
    const tara = TARA[taraI];
    const mh = natal.houseOfSign(m.sign);
    const mfm = natal.fromMoon(m.sign);
    const chandrashtama = mfm === 8;
    let score = 55 + tara[2] + (good("Moon", mfm) ? 10 : -6);
    if (chandrashtama) score -= 18;
    for (const n of ["Jupiter", "Saturn", "Venus", "Mars"]) score += good(n, natal.fromMoon(pos[n].sign)) ? 2 : -2;
    score = Math.max(5, Math.min(95, score));
    return { pos, tara_i: taraI, tara, moon_house: mh, moon_fm: mfm, chandrashtama, score, label: scoreLabel(score) };
  }

  const SAMPLE_HOURS = [7, 10, 13, 16, 19];
  // Python's round() rounds halves to even; keep identical scores.
  function roundHalfEven(x) {
    const r = Math.round(x);
    return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
  }

  // Day-level score: average of the waking-hours samples, so the number does not jump
  // around depending on the minute you look at it.
  function dayScore(natal, date, tz) {
    const cores = SAMPLE_HOURS.map((h) => dayCore(natal, K.jdLocal(date, h, tz)));
    const score = roundHalfEven(cores.reduce((a, c) => a + c.score, 0) / cores.length);
    return [score, scoreLabel(score), cores];
  }

  function skyTable(natal, pos) {
    return ORDER.map((nm) => {
      const p = pos[nm];
      return { planet: nm, sign: SIGN_EN[p.sign], sign_sk: SIGN_SK[p.sign], deg: Math.round(p.deg * 100) / 100,
        nakshatra: NAK_NAMES[p.nak], house: natal.houseOfSign(p.sign), from_moon: natal.fromMoon(p.sign),
        retro: p.retro, supportive: good(nm, natal.fromMoon(p.sign)) };
    });
  }

  /* ---------------- DAY reading ---------------- */

  function dayReading(natal, date, tzNow, lat, lon, nowJd = null) {
    const midnight = K.jdLocal(date, 0, tzNow);
    const sunrise = K.sunEvent(midnight, lat, lon, true);
    const sunset = K.sunEvent(sunrise, lat, lon, false);
    const nextSunrise = K.sunEvent(sunset, lat, lon, true);
    const isToday = nowJd !== null && midnight <= nowJd && nowJd < midnight + 1;
    const ref = isToday ? nowJd : K.jdLocal(date, 12, tzNow);

    const core = dayCore(natal, ref, true);
    const pos = core.pos;
    const [daySc, dayLbl] = dayScore(natal, date, tzNow);
    const periods = natal.periodsAt(ref);

    // Moon star segments across the traditional day (sunrise -> next sunrise)
    const nakAt = (x) => Math.floor(K.siderealLon("Moon", x) / K.NAK_SPAN) % 27;
    const segs = [];
    let t = sunrise, cur = nakAt(t), segStart = sunrise;
    while (t < nextSunrise) {
      const nxt = Math.min(t + 1 / 24, nextSunrise);
      const n = nakAt(nxt);
      if (n !== cur) {
        const change = bisect(nakAt, t, nxt);
        segs.push([segStart, change, cur]);
        segStart = change; cur = n;
      }
      t = nxt;
    }
    segs.push([segStart, nextSunrise, cur]);
    const starSegments = segs.map(([a, b, n]) => {
      const ti = (((n - natal.moon_nak) % 27) + 27) % 27 % 9;
      return { from: fmtTime(a, tzNow), to: fmtTime(b, tzNow), nakshatra: NAK_NAMES[n],
        tara: TARA[ti][0], quality: TARA[ti][1], meaning: TARA[ti][3], tara_i: ti, from_jd: a, to_jd: b };
    });

    const weekday = K.localParts(sunrise, tzNow).weekday;
    const wlord = WEEKDAY_LORD[weekday];
    const part = (sunset - sunrise) / 8;
    const rkStart = sunrise + (RAHU_KALAM_PART[weekday] - 1) * part;
    const tithi = tithiAt(sunrise);

    const m = pos.Moon;
    const mh = core.moon_house, mfm = core.moon_fm, tara = core.tara;

    const headline = `${dayLbl} day - the Moon is in your ${houseLabel(mh)}, on your ${tara[0]} star` + (isToday ? " right now" : "");
    const summary = [
      `Today the Moon travels through ${SIGN_EN[m.sign]} (${SIGN_SK[m.sign]}), which is your ${houseLabel(mh)}. In plain words, your attention and feelings naturally drift towards ${HOUSE[mh][1]}.`,
      `The Moon's star today is ${NAK_NAMES[m.nak]}. Counted from your birth star ${NAK_NAMES[natal.moon_nak]}, it is your ${tara[0]} tara: ${tara[3]}.`,
    ];
    if (core.chandrashtama) summary.push("It is also Chandrashtama - the Moon is 8th from your birth Moon. Sri Lankan and Indian almanacs both mark this as a day to stay low-key: avoid arguments, risky travel and big decisions.");
    else if (good("Moon", mfm)) summary.push(`Counted from your birth Moon this is the ${ordinal(mfm)} position - one of the Moon's good places, so the day's emotional weather is traditionally easy.`);
    else summary.push(`Counted from your birth Moon this is the ${ordinal(mfm)} position - not one of the Moon's easy places, so tradition advises patience with moods today.`);
    summary.push(`It is ${WEEKDAY_FLAVOUR[wlord]}.`);

    const moonParas = [
      `The Moon is at ${m.deg.toFixed(1)}° ${SIGN_EN[m.sign]} in ${NAK_NAMES[m.nak]}` + (isToday ? " (it is right now)." : " (at midday)."),
      planetHouseText(natal, "Moon", m)[0],
    ];

    const weather = saturnNotes(natal, pos);
    const retros = ORDER.filter((n) => pos[n].retro);
    if (retros.length) weather.push(`Retrograde now: ${retros.join(", ")}. Tradition treats retrograde planets as 'looking back' - good for reviewing, repairing and reconnecting; less ideal for brand-new starts in what those planets rule.`);
    const rh = natal.houseOfSign(pos.Rahu.sign), kh = natal.houseOfSign(pos.Ketu.sign);
    weather.push(`The nodes sit across your ${ordinal(rh)} and ${ordinal(kh)} houses: Rahu stirs up hunger and restlessness around ${HOUSE[rh][0]}, while Ketu makes you detached from ${HOUSE[kh][0]}.`);

    const areas = AREAS.map((a) => areaReading(natal, a, pos, periods, mh, mfm));

    const hits = natalHits(natal, pos, 2);
    for (const h of hits) {
      if (h.transit === "Moon") h.text = `The Moon passes over your birth ${h.natal} today - tradition says you'll feel ${h.natal !== "Lagna" ? "that planet" : "yourself"} more strongly for a few hours.`;
    }

    const doList = [], avoid = [];
    if (tara[2] > 0) doList.push(`Use the ${tara[0]} star: ${tara[3].split(" - ")[1]}.`);
    else avoid.push(`Don't launch big things under the ${tara[0]} star - ${tara[3].split(" - ")[1]}.`);
    const goodSegs = starSegments.filter((g) => TARA[g.tara_i][2] > 0);
    if (goodSegs.length) {
      const g = goodSegs[0];
      doList.push(`Best window: ${g.from} - ${g.to}, while the Moon is in ${g.nakshatra} (your ${g.tara} star). Put the important things there.`);
    }
    doList.push(`Lean into ${HOUSE[mh][1].split(",")[0]} - that's where the Moon puts your energy.`);
    doList.push(`Use the day's ruler: ${WEEKDAY_FLAVOUR[wlord].split(" - ")[1]}.`);
    if (retros.includes("Venus")) avoid.push("Rushing love decisions - Venus is retrograde (review, don't rush).");
    if (retros.includes("Mercury")) avoid.push("Signing in a hurry or sending messages unread - Mercury is retrograde.");
    if (core.chandrashtama) avoid.push("Arguments and risky travel - it's Chandrashtama.");
    avoid.push(`Starting important work during Rahu Kalam (${fmtTime(rkStart, tzNow)} - ${fmtTime(rkStart + part, tzNow)}).`);

    const upcoming = findEvents(natal, ref, ref + 30, tzNow).slice(0, 8);
    const noon = K.jdLocal(date, 12, tzNow);

    return {
      mode: "day",
      date: isoDate(date),
      nice_date: `${WEEKDAY_EN[weekdayOf(date)]}, ${pad(date.d)} ${MONTH_EN[date.m - 1]} ${date.y}`,
      is_today: isToday,
      as_of: isToday ? fmtTime(ref, tzNow) : "midday",
      score: daySc, label: dayLbl, now_score: core.score, headline, summary,
      panchanga: {
        weekday: WEEKDAY_EN[weekday], weekday_lord: wlord, tithi: tithi.name, paksha: tithi.paksha,
        nakshatra: NAK_NAMES[m.nak], moon_sign: SIGN_EN[m.sign],
        sunrise: fmtTime(sunrise, tzNow), sunset: fmtTime(sunset, tzNow),
        rahu_kalam: `${fmtTime(rkStart, tzNow)} - ${fmtTime(rkStart + part, tzNow)}`,
        tara: tara[0], chandrashtama: core.chandrashtama,
        elongation: Math.round(K.elongation(ref) * 10) / 10,
      },
      star_segments: starSegments, moon: moonParas, weather, areas, hits,
      dasha: dashaText(natal, periods, tzNow),
      do: doList, avoid, sky: skyTable(natal, pos), upcoming,
      raw: {
        moon_house: mh, tara_i: core.tara_i, chandrashtama: core.chandrashtama,
        sunrise, sunset, rahu: [rkStart, rkStart + part], weekday, retros, periods: periodsRaw(periods),
        sade_sati: [12, 1, 2].includes(natal.fromMoon(pos.Saturn.sign)),
        jupiter_good: good("Jupiter", natal.fromMoon(pos.Jupiter.sign)),
        date_jd: noon, ref_jd: ref,
      },
    };
  }

  /* ---------------- MONTH reading ---------------- */

  function monthReading(natal, year, month, tzNow) {
    const first = { y: year, m: month, d: 1 };
    const ndays = daysInMonth(year, month);
    const jd1 = K.jdLocal(first, 0, tzNow), jd2 = K.jdLocal(addDays(first, ndays), 0, tzNow);
    const SHORT_WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const days = [];
    for (let i = 0; i < ndays; i++) {
      const d = addDays(first, i);
      const [sc, lbl, cores] = dayScore(natal, d, tzNow);
      const c = cores[1]; // 10 AM sample describes the working day
      const m = c.pos.Moon;
      days.push({ date: isoDate(d), day: d.d, weekday: SHORT_WD[weekdayOf(d)], score: sc, label: lbl,
        tara: c.tara[0], tara_quality: c.tara[1], moon_house: c.moon_house, moon_sign: SIGN_EN[m.sign],
        nakshatra: NAK_NAMES[m.nak], chandrashtama: cores.some((x) => x.chandrashtama),
        note: `Moon in your ${ordinal(c.moon_house)} (${HOUSE[c.moon_house][0]}), ${c.tara[0]} star` });
    }

    const events = findEvents(natal, jd1, jd2, tzNow);
    for (const e of events) {
      const d = days.find((x) => x.date === e.date);
      if (d) (d.events = d.events || []).push(e.title);
    }

    const mid = K.jdLocal(addDays(first, Math.floor(ndays / 2)), 12, tzNow);
    const pos = K.positions(mid, true);
    const periods = natal.periodsAt(mid);
    const areas = AREAS.map((a) => areaReading(natal, a, pos, periods));

    // Python's sorted() is stable; Array.prototype.sort is stable too.
    const best = [...days].sort((a, b) => b.score - a.score).slice(0, 5).sort((a, b) => a.day - b.day);
    const careful = [...days].sort((a, b) => a.score - b.score).slice(0, 5).sort((a, b) => a.day - b.day);

    const weeks = [];
    for (let w = 0; w < ndays; w += 7) {
      const chunk = days.slice(w, w + 7);
      const evs = events.filter((e) => chunk[0].date <= e.date && e.date <= chunk[chunk.length - 1].date);
      const avg = roundHalfEven(chunk.reduce((a, d) => a + d.score, 0) / chunk.length);
      const houses = [];
      for (const d of chunk) if (!houses.length || houses[houses.length - 1] !== d.moon_house) houses.push(d.moon_house);
      // max()/min() return the first best item, like Python
      const top = chunk.reduce((a, d) => (d.score > a.score ? d : a));
      const low = chunk.reduce((a, d) => (d.score < a.score ? d : a));
      let text = "The Moon moves through your " + houses.map((h) => `${ordinal(h)} (${HOUSE[h][0]})`).join(", then ") + ". ";
      text += `The easiest day looks like ${top.weekday} ${top.day} (${top.tara} star); go gently on ${low.weekday} ${low.day}`
        + (low.chandrashtama ? " - Chandrashtama." : ` (${low.tara} star).`);
      if (evs.length) text += " Key sky events: " + evs.map((e) => e.title).join("; ") + ".";
      weeks.push({ label: `${chunk[0].day}-${chunk[chunk.length - 1].day}`, avg, text, best: top.date, low: low.date, events: evs });
    }

    const sunH = natal.houseOfSign(pos.Sun.sign);
    const overview = [
      `This month the Sun lights up your ${houseLabel(sunH)} - the main stage this month is ${HOUSE[sunH][1]}.`,
      `Mars is in your ${ordinal(natal.houseOfSign(pos.Mars.sign))}, Venus in your ${ordinal(natal.houseOfSign(pos.Venus.sign))} and Mercury in your ${ordinal(natal.houseOfSign(pos.Mercury.sign))}, which colour energy, love and communication respectively.`,
      ...saturnNotes(natal, pos),
    ];

    return {
      mode: "month", year, month, title: `${MONTH_EN[month - 1]} ${year}`, first_weekday: weekdayOf(first),
      avg: roundHalfEven(days.reduce((a, d) => a + d.score, 0) / ndays),
      overview, days, weeks, events, areas, best, careful,
      dasha: dashaText(natal, periods, tzNow), sky: skyTable(natal, pos),
      raw: { sun_house: sunH, periods: periodsRaw(periods),
        sade_sati: [12, 1, 2].includes(natal.fromMoon(pos.Saturn.sign)),
        jupiter_good: good("Jupiter", natal.fromMoon(pos.Jupiter.sign)) },
    };
  }

  /* ---------------- YEAR reading ---------------- */

  function yearReading(natal, year, tzNow) {
    const jd1 = K.jdLocal({ y: year, m: 1, d: 1 }, 0, tzNow);
    const jd2 = K.jdLocal({ y: year + 1, m: 1, d: 1 }, 0, tzNow);
    const events = findEvents(natal, jd1, jd2, tzNow);
    const big = events.filter((e) => ["eclipse", "station"].includes(e.kind)
      || (e.kind === "ingress" && ["Jupiter", "Saturn", "Rahu", "Ketu", "Mars", "Venus"].includes(e.planet)));

    const months = [];
    for (let mth = 1; mth <= 12; mth++) {
      const first = { y: year, m: mth, d: 1 };
      const n = daysInMonth(year, mth);
      const scores = [];
      for (let i = 0; i < n; i++) scores.push(dayScore(natal, addDays(first, i), tzNow)[0]);
      const mid = K.jdLocal(addDays(first, 14), 12, tzNow);
      const pos = K.positions(mid, true);
      const periods = natal.periodsAt(mid);
      const love = areaReading(natal, AREAS[0], pos, periods);
      const career = areaReading(natal, AREAS[1], pos, periods);
      const money = areaReading(natal, AREAS[2], pos, periods);
      const sh = natal.houseOfSign(pos.Sun.sign);
      const mevs = big.filter((e) => e.date.slice(0, 7) === `${year}-${pad(mth)}`);
      let text = `The Sun moves through your ${houseLabel(sh)}, putting the spotlight on ${HOUSE[sh][1].split(",")[0]}. Love looks ${love.tone}, work ${career.tone}, money ${money.tone}.`;
      if (mevs.length) text += " Turning points: " + mevs.map((e) => `${e.title} (${e.date.slice(8)})`).join("; ") + ".";
      months.push({ month: mth, name: MONTH_EN[mth - 1], avg: roundHalfEven(scores.reduce((a, b) => a + b, 0) / n),
        best_day: scores.indexOf(Math.max(...scores)) + 1, text,
        love: love.tone, career: career.tone, money: money.tone, sun_house: sh, events: mevs });
    }

    // Slow-planet journey through the year
    const journey = [], journeyRaw = [];
    for (const name of ["Jupiter", "Saturn", "Rahu", "Ketu"]) {
      const segs = [];
      for (let t = jd1; t < jd2; t += 5) {
        const s = Math.floor((name === "Ketu" ? K.norm(K.siderealLon("Rahu", t) + 180) : K.siderealLon(name, t)) / 30);
        const h = natal.houseOfSign(s);
        if (!segs.length || segs[segs.length - 1].house !== h) segs.push({ house: h, sign: SIGN_EN[s], from: fmtDate(t, tzNow) });
      }
      journey.push(`${name}: ` + segs.map((s) => `your ${ordinal(s.house)} (${HOUSE[s.house][0]}) from ${s.from}`).join(" -> "));
      journeyRaw.push({ planet: name, segments: segs });
    }

    const mid = K.jdLocal({ y: year, m: 7, d: 1 }, 12, tzNow);
    const pos = K.positions(mid, true);
    const periodsStart = natal.periodsAt(jd1);
    const periodsEnd = natal.periodsAt(jd2 - 1);
    const dashaChanges = [];
    if (periodsStart && periodsEnd) {
      const ads = periodsStart.ads.concat(periodsEnd.md !== periodsStart.md ? periodsEnd.ads : []);
      for (const ad of ads) if (jd1 <= ad.start_jd && ad.start_jd < jd2) dashaChanges.push(`${fmtDate(ad.start_jd, tzNow)}: ${ad.lord} sub-period begins`);
      if (periodsEnd.md.start_jd >= jd1) dashaChanges.unshift(`${fmtDate(periodsEnd.md.start_jd, tzNow)}: ${periodsEnd.md.lord} MAJOR period begins - a new life chapter`);
    }

    const periodsMid = natal.periodsAt(mid);
    const areas = AREAS.map((a) => areaReading(natal, a, pos, periodsMid));
    const ranked = [...months].sort((a, b) => b.avg - a.avg);
    const overview = [
      `Strongest-feeling months (by daily averages): ${ranked.slice(0, 3).map((m) => m.name).join(", ")}. Gentlest/most cautious: ${ranked.slice(-3).map((m) => m.name).join(", ")}.`,
      ...saturnNotes(natal, pos),
    ];

    return {
      mode: "year", year, overview, months, journey, events: big, dasha_changes: dashaChanges,
      dasha: dashaText(natal, periodsMid, tzNow), areas,
      raw: {
        journey: journeyRaw, periods: periodsRaw(periodsMid),
        sade_sati: [12, 1, 2].includes(natal.fromMoon(pos.Saturn.sign)),
        best: ranked.slice(0, 3).map((m) => m.month), worst: ranked.slice(-3).map((m) => m.month),
        dasha_changes: (periodsStart ? periodsStart.ads : []).filter((ad) => jd1 <= ad.start_jd && ad.start_jd < jd2)
          .map((ad) => ({ jd: ad.start_jd, lord: ad.lord, major: false })),
      },
    };
  }

  K.R = { HOUSE, PLANET, TARA, AREAS, ORDER, Natal, ordinal, scoreLabel, dayReading, monthReading,
    yearReading, parseIso, isoDate, addDays, daysInMonth, fmtDate, fmtTime };
})(typeof window !== "undefined" ? window : globalThis);
