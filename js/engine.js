/*
 * engine.js - the astronomy layer (JavaScript port of jyotisha_engine.py).
 *
 * Methodology (see 27-chart-calculation-method.md in the knowledge base):
 *   Sidereal zodiac, Lahiri ayanamsa, whole-sign houses, mean Rahu (Ketu = Rahu + 180),
 *   Vimshottari dasha from the Moon's nakshatra.
 *
 * Positions come from Astronomy Engine (vendor/astronomy.min.js, MIT licence) as
 * apparent geocentric longitudes on the true ecliptic of date. They are made sidereal
 * exactly the way the Swiss Ephemeris does it:
 *     sidereal = true tropical - (mean Lahiri ayanamsa + nutation in longitude)
 * The Lahiri curve below is a degree-4 fit to Swiss Ephemeris' own values (1700-2500),
 * exact to well under 0.01".
 *
 * Everything here is arithmetic/astronomy. No meaning is assigned in this file.
 */
(function (root) {
  "use strict";
  const A = root.Astronomy;
  const K = root.K || (root.K = {});

  const J2000 = 2451545.0;
  const LAHIRI = [23.85709234707075, 1.3968879530344405, 0.00030710487068437474,
                  4.258908641068297e-09, -5.994882411020684e-09];

  // Delta-T (TT - UT, seconds) as used by the Swiss Ephemeris, every 2 years from 1700 to 2500.
  // Using the same values keeps future Moon positions in step with the Swiss Ephemeris
  // (Delta-T for future years is a prediction, and models differ).
  const DT_START = 1700, DT_STEP = 2;
  const DT_TABLE = [
    12.985, 12.338, 11.749, 11.219, 10.751, 10.348, 10.011, 9.743, 9.546, 9.422, 9.373, 9.401,
    9.502, 9.67, 9.901, 10.19, 10.532, 10.922, 11.354, 11.824, 12.327, 12.859, 13.413, 13.985,
    14.57, 15.164, 15.761, 16.356, 16.943, 17.52, 18.079, 18.618, 19.129, 19.609, 20.052, 20.454,
    20.809, 21.113, 21.36, 21.546, 21.666, 21.714, 21.686, 21.577, 21.382, 21.095, 20.713, 20.229,
    19.64, 18.939, 18.124, 17.208, 16.291, 15.493, 14.936, 14.738, 14.965, 15.45, 15.971, 16.306,
    16.231, 15.593, 14.506, 13.152, 11.715, 10.374, 9.282, 8.45, 7.863, 7.5, 7.343, 7.374,
    7.576, 7.933, 8.429, 9.046, 9.713, 10.129, 9.955, 9.319, 8.816, 8.794, 8.557, 7.187,
    4.732, 2.191, 0.387, -0.807, -1.731, -2.572, -3.349, -4.039, -4.464, -4.423, -4.086, -3.988,
    -4.47, -5.026, -4.952, -3.936, -2.051, 0.549, 3.448, 6.182, 8.641, 11.092, 13.707, 16.275,
    18.481, 20.222, 21.587, 22.662, 23.465, 24.003, 24.299, 24.403, 24.363, 24.234, 24.076, 24.049,
    24.42, 25.343, 26.507, 27.503, 28.237, 28.931, 29.698, 30.623, 31.35, 32.181, 33.15, 34.001,
    35.03, 36.541, 38.29, 40.181, 42.23, 44.486, 46.457, 48.536, 50.539, 52.168, 53.788, 54.872,
    55.82, 56.856, 58.309, 59.986, 61.629, 62.967, 63.828, 64.3, 64.574, 64.846, 65.457, 66.07,
    66.603, 67.281, 68.102, 68.968, 69.361, 69.294, 69.1, 68.9, 68.8, 69.276, 69.761, 70.257,
    70.761, 71.276, 71.8, 72.335, 72.88, 73.436, 74.003, 74.581, 75.169, 75.77, 76.382, 77.006,
    77.642, 78.29, 78.951, 79.624, 80.31, 81.009, 81.721, 82.447, 83.185, 83.939, 84.705, 85.486,
    86.281, 87.091, 87.915, 88.755, 89.609, 90.479, 91.364, 92.266, 93.182, 94.114, 95.063, 96.029,
    97.011, 98.011, 99.026, 100.061, 101.111, 102.18, 103.266, 104.371, 105.493, 106.635, 107.793, 108.957,
    110.138, 111.34, 112.559, 113.8, 115.059, 116.34, 117.638, 118.96, 120.299, 121.662, 123.043, 124.447,
    125.871, 127.318, 128.785, 130.276, 131.787, 133.322, 134.878, 136.458, 138.059, 139.685, 141.333, 143.006,
    144.7, 146.421, 148.163, 149.932, 151.722, 153.54, 155.38, 157.248, 159.138, 161.056, 162.997, 164.964,
    166.957, 168.979, 171.024, 173.098, 175.197, 177.325, 179.478, 181.66, 183.868, 186.105, 188.368, 190.662,
    192.981, 195.332, 197.708, 200.117, 202.551, 205.017, 207.51, 210.036, 212.588, 215.173, 217.786, 220.432,
    223.105, 225.813, 228.548, 231.318, 234.115, 236.948, 239.809, 242.706, 245.631, 248.592, 251.582, 254.608,
    257.664, 260.756, 263.878, 267.037, 270.226, 273.453, 276.71, 280.006, 283.331, 286.696, 290.091, 293.525,
    296.99, 300.491, 304.027, 307.604, 311.212, 314.861, 318.542, 322.264, 326.018, 329.814, 333.642, 337.512,
    341.415, 345.361, 349.34, 353.362, 357.417, 361.516, 365.648, 369.825, 374.035, 378.291, 382.58, 386.914,
    391.283, 395.697, 400.146, 404.642, 409.171, 413.748, 418.36, 423.02, 427.714, 432.456, 437.234, 442.061,
    446.922, 451.834, 456.78, 461.777, 466.81, 471.892, 477.012, 482.181, 487.388, 492.645, 497.94, 503.286,
    508.669, 514.105, 519.577, 525.103, 530.666, 536.283, 541.937, 547.645, 553.391, 559.192, 565.031, 570.925,
    576.857, 582.845, 588.872, 594.954, 601.076, 607.254, 613.471, 619.745, 626.06, 632.431, 638.842, 645.312,
    651.821, 658.389, 664.997, 671.665, 678.373, 685.14, 691.949, 698.817, 705.727, 712.697, 719.709, 726.781,
    733.896, 741.071, 748.289, 755.569, 762.892, 770.276, 777.704, 785.194, 792.727, 800.324, 807.964, 815.668,
    823.415, 831.227, 839.082, 847.003, 854.967,
  ];
  A.SetDeltaTFunction(function (ut) {
    const year = 2000 + ut / 365.2425;
    const x = (year - DT_START) / DT_STEP;
    if (x < 0 || x >= DT_TABLE.length - 1) return A.DeltaT_EspenakMeeus(ut);
    const i = Math.floor(x), f = x - i;
    return DT_TABLE[i] + (DT_TABLE[i + 1] - DT_TABLE[i]) * f;
  });

  const SIGNS = ["Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
    "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"];
  const SIGN_EN = SIGNS.map((s) => s.split("(")[1].replace(")", ""));
  const SIGN_SK = SIGNS.map((s) => s.split(" (")[0]);
  const SIGN_LORDS = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
                      "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  const NAKSHATRAS = [
    ["Ashwini", "Ketu"], ["Bharani", "Venus"], ["Krittika", "Sun"], ["Rohini", "Moon"],
    ["Mrigashira", "Mars"], ["Ardra", "Rahu"], ["Punarvasu", "Jupiter"], ["Pushya", "Saturn"],
    ["Ashlesha", "Mercury"], ["Magha", "Ketu"], ["Purva Phalguni", "Venus"],
    ["Uttara Phalguni", "Sun"], ["Hasta", "Moon"], ["Chitra", "Mars"], ["Swati", "Rahu"],
    ["Vishakha", "Jupiter"], ["Anuradha", "Saturn"], ["Jyeshtha", "Mercury"], ["Mula", "Ketu"],
    ["Purva Ashadha", "Venus"], ["Uttara Ashadha", "Sun"], ["Shravana", "Moon"],
    ["Dhanishta", "Mars"], ["Shatabhisha", "Rahu"], ["Purva Bhadrapada", "Jupiter"],
    ["Uttara Bhadrapada", "Saturn"], ["Revati", "Mercury"],
  ];
  const NAK_NAMES = NAKSHATRAS.map((n) => n[0]);
  const VIMSHOTTARI = [["Ketu", 7], ["Venus", 20], ["Sun", 6], ["Moon", 10], ["Mars", 7],
                       ["Rahu", 18], ["Jupiter", 16], ["Saturn", 19], ["Mercury", 17]];
  const VIM_TOTAL = 120;
  const DAY_YEARS = 365.2425;
  const NAK_SPAN = 360 / 27;
  const PADA_SPAN = NAK_SPAN / 4;
  const BODY_NAMES = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"];
  const ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const BODY = { Sun: A.Body.Sun, Moon: A.Body.Moon, Mars: A.Body.Mars, Mercury: A.Body.Mercury,
                 Jupiter: A.Body.Jupiter, Venus: A.Body.Venus, Saturn: A.Body.Saturn };

  const norm = (x) => ((x % 360) + 360) % 360;
  const rad = Math.PI / 180;

  function astroTime(jd) { return A.MakeTime(jd - J2000); }

  function ayanamsa(jd) {
    const T = (jd - J2000) / 36525;
    return LAHIRI[0] + T * (LAHIRI[1] + T * (LAHIRI[2] + T * (LAHIRI[3] + T * LAHIRI[4])));
  }

  // Offset to subtract from true-of-date tropical longitudes
  function siderealOffset(jd, t) {
    return ayanamsa(jd) + A.e_tilt(t).dpsi / 3600;
  }

  // Mean lunar node on the mean equinox of date (Meeus, Astronomical Algorithms 47.7)
  function meanNodeMean(t) {
    const T = t.tt / 36525;
    return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441
      - (T * T * T * T) / 60616000);
  }

  function tropicalTrue(name, t) {
    if (name === "Rahu") return norm(meanNodeMean(t) + A.e_tilt(t).dpsi / 3600);
    return A.Ecliptic(A.GeoVector(BODY[name], t, true)).elon;
  }

  function siderealLon(name, jd) {
    const t = astroTime(jd);
    return norm(tropicalTrue(name, t) - siderealOffset(jd, t));
  }

  function speed(name, jd) {
    const h = name === "Moon" ? 0.05 : 0.25;
    let d = siderealLon(name, jd + h) - siderealLon(name, jd - h);
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d / (2 * h);
  }

  // Sidereal ascendant (degrees) for a moment and place
  function ascendant(jd, lat, lon) {
    const t = astroTime(jd);
    const tilt = A.e_tilt(t);
    const ramc = norm(A.SiderealTime(t) * 15 + lon) * rad;
    const eps = tilt.tobl * rad;
    const asc = Math.atan2(Math.cos(ramc),
      -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat * rad) * Math.sin(eps))) / rad;
    return norm(asc - siderealOffset(jd, t));
  }

  function signOf(lon) { return [Math.floor(lon / 30) % 12, lon % 30]; }

  function nakshatraOf(lon) {
    const n = Math.floor(lon / NAK_SPAN) % 27;
    const into = lon - n * NAK_SPAN;
    return [n, Math.floor(into / PADA_SPAN) + 1, into];
  }

  // All nine grahas at a moment. withSpeed=false skips the (3x costlier) speed calc.
  function positions(jd, withSpeed = true) {
    const t = astroTime(jd);
    const off = siderealOffset(jd, t);
    const out = {};
    for (const name of BODY_NAMES) {
      const lon = norm(tropicalTrue(name, t) - off);
      out[name] = { lon, speed: withSpeed ? speed(name, jd) : 0 };
    }
    out.Ketu = { lon: norm(out.Rahu.lon + 180), speed: out.Rahu.speed };
    for (const name of ORDER) {
      const p = out[name];
      p.sign = Math.floor(p.lon / 30) % 12;
      p.deg = p.lon % 30;
      p.nak = Math.floor(p.lon / NAK_SPAN) % 27;
      // Rahu/Ketu always move backwards; only true planets are flagged retrograde.
      p.retro = withSpeed && p.speed < 0 && name !== "Rahu" && name !== "Ketu";
    }
    return out;
  }

  /* ---------------- time ---------------- */

  // Julian Day (UT) for a calendar date (y, m, d) plus decimal hours, Gregorian calendar.
  function julday(y, m, d, h = 0) {
    if (m <= 2) { y -= 1; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5 + h / 24;
  }

  // JD -> {year, month, day, hour(decimal)} (Gregorian)
  function revjul(jd) {
    const z = Math.floor(jd + 0.5);
    const f = jd + 0.5 - z;
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    const a = z + 1 + alpha - Math.floor(alpha / 4);
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const day = b - d - Math.floor(30.6001 * e);
    const month = e < 14 ? e - 1 : e - 13;
    const year = month > 2 ? c - 4716 : c - 4715;
    return { year, month, day, hour: f * 24 };
  }

  // Local civil time parts for a JD at a fixed offset (hours)
  function localParts(jd, tz) {
    const r = revjul(jd + tz / 24);
    let mins = Math.floor(r.hour * 60 + 1e-7);
    const hh = Math.floor(mins / 60), mm = mins % 60;
    const date = new Date(Date.UTC(r.year, r.month - 1, r.day));
    return { year: r.year, month: r.month, day: r.day, hour: hh, minute: mm,
             weekday: (date.getUTCDay() + 6) % 7 }; // Mon = 0
  }

  // A plain date object {y, m, d}
  function jdLocal(date, hours, tz) { return julday(date.y, date.m, date.d, 0) + (hours - tz) / 24; }

  /** Historical Sri Lanka civil offset (hours) for a local date-time.
   *  1996-05-25 -> +6:30, 1996-10-26 00:30 -> +6:00, 2006-04-15 00:30 -> +5:30. */
  function sriLankaOffset(y, m, d, h = 12, mi = 0) {
    const v = ((y * 100 + m) * 100 + d) * 10000 + h * 100 + mi;
    if (v >= 199605250000 && v < 199610260030) return 6.5;
    if (v >= 199610260030 && v < 200604150030) return 6.0;
    return 5.5;
  }

  function sunEvent(jdStart, lat, lon, rise) {
    const obs = new A.Observer(lat, lon, 0);
    const t = A.SearchRiseSet(A.Body.Sun, obs, rise ? +1 : -1, astroTime(jdStart), 2);
    return t ? t.ut + J2000 : jdStart + (rise ? 0.25 : 0.75); // polar fallback, unused in Sri Lanka
  }

  function elongation(jd) {
    const t = astroTime(jd);
    return norm(tropicalTrue("Moon", t) - tropicalTrue("Sun", t));
  }

  // Eclipses with maximum between jd1 and jd2
  function eclipses(jd1, jd2) {
    const out = [];
    let e = A.SearchGlobalSolarEclipse(astroTime(jd1));
    while (e.peak.ut + J2000 <= jd2) {
      out.push({ kind: "solar", sort: e.kind, jd: e.peak.ut + J2000 });
      e = A.NextGlobalSolarEclipse(e.peak);
    }
    let l = A.SearchLunarEclipse(astroTime(jd1));
    while (l.peak.ut + J2000 <= jd2) {
      out.push({ kind: "lunar", sort: l.kind, jd: l.peak.ut + J2000 });
      l = A.NextLunarEclipse(l.peak);
    }
    return out;
  }

  /* ---------------- natal chart & dasha ---------------- */

  function computeChart(date, hour, minute, tz, lat, lon) {
    const jd = julday(date.y, date.m, date.d, 0) + (hour + minute / 60 - tz) / 24;
    const pos = positions(jd, true);
    const asc = ascendant(jd, lat, lon);
    const ascSign = Math.floor(asc / 30) % 12;
    const planets = {};
    for (const name of ORDER) {
      const p = pos[name];
      const [n, pada] = nakshatraOf(p.lon);
      planets[name] = {
        lon: p.lon, speed: p.speed, retro: name === "Ketu" ? true : p.speed < 0,
        sign_idx: p.sign, sign: SIGNS[p.sign], sign_deg: p.deg,
        house: ((p.sign - ascSign + 12) % 12) + 1,
        nakshatra: NAKSHATRAS[n][0], nak_lord: NAKSHATRAS[n][1], pada,
      };
    }
    return { jd_ut: jd, ayanamsa: ayanamsa(jd), asc, asc_sign_idx: ascSign, planets };
  }

  function vimshottari(moonLon, birthJd) {
    const [n, , into] = nakshatraOf(moonLon);
    const lord = NAKSHATRAS[n][1];
    const names = VIMSHOTTARI.map((x) => x[0]);
    const start = names.indexOf(lord);
    const frac = into / NAK_SPAN;
    const balance = VIMSHOTTARI[start][1] * (1 - frac);
    const timeline = [];
    let t = birthJd;
    for (let k = 0; k < 17; k++) {
      const [nm, full] = VIMSHOTTARI[(start + k) % 9];
      const yrs = k === 0 ? balance : full;
      timeline.push({ lord: nm, years: yrs, full_years: full, start_jd: t, end_jd: t + yrs * DAY_YEARS });
      t += yrs * DAY_YEARS;
    }
    return { start_lord: lord, balance_years: balance, nak_index: n, frac_elapsed: frac, timeline };
  }

  function antardashas(mdLord, mdFullYears, mdStartJd) {
    const names = VIMSHOTTARI.map((x) => x[0]);
    const years = Object.fromEntries(VIMSHOTTARI);
    const i = names.indexOf(mdLord);
    const out = [];
    let t = mdStartJd;
    for (let k = 0; k < 9; k++) {
      const sub = names[(i + k) % 9];
      const ad = (mdFullYears * years[sub]) / VIM_TOTAL;
      out.push({ lord: sub, years: ad, start_jd: t, end_jd: t + ad * DAY_YEARS });
      t += ad * DAY_YEARS;
    }
    return out;
  }

  Object.assign(K, {
    J2000, SIGNS, SIGN_EN, SIGN_SK, SIGN_LORDS, NAKSHATRAS, NAK_NAMES, VIMSHOTTARI, VIM_TOTAL,
    DAY_YEARS, NAK_SPAN, ORDER, norm, astroTime, ayanamsa, siderealLon, speed, ascendant,
    signOf, nakshatraOf, positions, julday, revjul, localParts, jdLocal, sriLankaOffset,
    sunEvent, elongation, eclipses, computeChart, vimshottari, antardashas,
  });
})(typeof window !== "undefined" ? window : globalThis);
