/*
 * service.js - builds a full reading from plain parameters, entirely in the browser.
 * (Same inputs and output shape as the old Python /api/reading.)
 */
(function (root) {
  "use strict";
  const K = root.K;
  const R = K.R;
  const S = K.S;

  function checkYear(y) {
    if (!(y >= 1800 && y <= 2400)) throw new Error("please choose a year between 1800 and 2400");
  }

  function nowJd() { return Date.now() / 86400000 + 2440587.5; }

  function buildNatal(p) {
    const date = R.parseIso(p.bdate);
    const [hh, mm] = String(p.btime).split(":").map(Number);
    const lat = Number(p.lat), lon = Number(p.lon);
    if (!(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 && hh >= 0 && hh < 24 && mm >= 0 && mm < 60)) {
      throw new Error("birth time or coordinates out of range");
    }
    checkYear(date.y);
    const tz = p.tz === "auto" || p.tz === undefined ? K.sriLankaOffset(date.y, date.m, date.d, hh, mm) : Number(p.tz);
    return new R.Natal(p.name, date, hh, mm, lat, lon, tz);
  }

  /** p: {name, bdate, btime, lat, lon, tz, lang, clat, clon, mode, date | month | year} */
  function reading(p) {
    const natal = buildNatal(p);
    const tzNow = p.tz_now !== undefined ? Number(p.tz_now) : 5.5; // Sri Lanka civil time since 2006
    const lat = p.clat !== undefined && p.clat !== "" ? Number(p.clat) : natal.lat;
    const lon = p.clon !== undefined && p.clon !== "" ? Number(p.clon) : natal.lon;
    const lang = p.lang || "en";
    if (!["en", "si"].includes(lang)) throw new Error("lang must be en or si");
    const todayLocal = R.parseIso(R.fmtDate(nowJd(), tzNow));
    let out;
    if ((p.mode || "day") === "day") {
      const d = p.date ? R.parseIso(p.date) : todayLocal;
      checkYear(d.y);
      out = R.dayReading(natal, d, tzNow, lat, lon, nowJd());
      out.simple = S.day(out, natal, tzNow, lang);
    } else if (p.mode === "month") {
      const [y, m] = String(p.month || R.isoDate(todayLocal).slice(0, 7)).split("-").map(Number);
      if (!(m >= 1 && m <= 12)) throw new Error("month must be 1-12");
      checkYear(y);
      out = R.monthReading(natal, y, m, tzNow);
      out.simple = S.month(out, natal, tzNow, lang);
    } else if (p.mode === "year") {
      const y = Number(p.year || todayLocal.y);
      checkYear(y);
      out = R.yearReading(natal, y, tzNow);
      out.simple = S.year(out, natal, tzNow, lang);
    } else {
      throw new Error("mode must be day, month or year");
    }
    out.natal = natal.summary();
    out.natal_simple = S.natalSimple(out.natal, lang);
    out.lang = lang;
    return out;
  }

  K.reading = reading;
})(typeof window !== "undefined" ? window : globalThis);
