#!/usr/bin/env python3
"""
jyotisha_engine.py
------------------
Reproducible Vedic (sidereal) horoscope calculation engine for the
Sri Lankan Astrology knowledge base.

Methodology (see 27-chart-calculation-method.md):
  - Framework        : Vedic / Jyotisha
  - Zodiac           : Sidereal
  - Ayanamsa         : Lahiri (Chitrapaksha)  -> swe.SIDM_LAHIRI
  - Ephemeris        : Swiss Ephemeris, Moshier mode (FLG_MOSEPH, no data files)
  - House system     : Whole Sign (Rashi = Bhava)  [primary]
                       Placidus ascmc also reported for reference
  - Node             : Mean Node (Rahu); Ketu = Rahu + 180 deg
  - Dasha            : Vimshottari (120-year cycle), Moon-nakshatra based

ASTRONOMICAL FACT vs ASTROLOGICAL INTERPRETATION:
  Everything this script outputs (longitudes, cusps, dasha dates) is an
  ASTRONOMICAL / ARITHMETIC calculation. It assigns NO meaning. All meaning
  (what a planet "does" in a house, etc.) lives in the interpretation .md files.

Usage:
  python3 jyotisha_engine.py            # runs the built-in user birth data
  (import and call compute_chart(...) for other charts)
"""

import swisseph as swe

# ----------------------------------------------------------------------------
# Static Jyotisha reference tables (pure data, no interpretation)
# ----------------------------------------------------------------------------

SIGNS = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
    "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
]

SIGN_LORDS = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
]

# 27 Nakshatras with their Vimshottari lord
NAKSHATRAS = [
    ("Ashwini", "Ketu"), ("Bharani", "Venus"), ("Krittika", "Sun"),
    ("Rohini", "Moon"), ("Mrigashira", "Mars"), ("Ardra", "Rahu"),
    ("Punarvasu", "Jupiter"), ("Pushya", "Saturn"), ("Ashlesha", "Mercury"),
    ("Magha", "Ketu"), ("Purva Phalguni", "Venus"), ("Uttara Phalguni", "Sun"),
    ("Hasta", "Moon"), ("Chitra", "Mars"), ("Swati", "Rahu"),
    ("Vishakha", "Jupiter"), ("Anuradha", "Saturn"), ("Jyeshtha", "Mercury"),
    ("Mula", "Ketu"), ("Purva Ashadha", "Venus"), ("Uttara Ashadha", "Sun"),
    ("Shravana", "Moon"), ("Dhanishta", "Mars"), ("Shatabhisha", "Rahu"),
    ("Purva Bhadrapada", "Jupiter"), ("Uttara Bhadrapada", "Saturn"), ("Revati", "Mercury"),
]

# Vimshottari dasha sequence and lengths (years). Total = 120.
VIMSHOTTARI = [
    ("Ketu", 7), ("Venus", 20), ("Sun", 6), ("Moon", 10), ("Mars", 7),
    ("Rahu", 18), ("Jupiter", 16), ("Saturn", 19), ("Mercury", 17),
]
VIM_TOTAL = 120.0

PLANETS = [
    ("Sun", swe.SUN), ("Moon", swe.MOON), ("Mars", swe.MARS),
    ("Mercury", swe.MERCURY), ("Jupiter", swe.JUPITER), ("Venus", swe.VENUS),
    ("Saturn", swe.SATURN), ("Rahu", swe.MEAN_NODE),
]

NAK_SPAN = 360.0 / 27.0        # 13.333... deg
PADA_SPAN = NAK_SPAN / 4.0     # 3.333... deg

FLAGS = swe.FLG_MOSEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED


def dms(deg):
    """Decimal degrees -> d m s string."""
    d = int(deg)
    m_full = (deg - d) * 60
    m = int(m_full)
    s = (m_full - m) * 60
    return f"{d:02d} {m:02d}' {s:05.2f}\""


def sign_of(lon):
    """Return (sign_index 0-11, degrees within sign)."""
    idx = int(lon // 30) % 12
    return idx, lon % 30


def nakshatra_of(lon):
    """Return (nak_index 0-26, pada 1-4, deg_into_nak)."""
    n = int(lon // NAK_SPAN) % 27
    into = lon - n * NAK_SPAN
    pada = int(into // PADA_SPAN) + 1
    return n, pada, into


def navamsa_sign(lon):
    """D9 sign index (0-11). Standard Parashari navamsa mapping."""
    sign_idx, within = sign_of(lon)
    navamsa = int(within // (30.0 / 9.0))  # 0-8
    # Starting navamsa sign depends on element of the rasi:
    # Fire (0,4,8)->Aries; Earth(1,5,9)->Capricorn; Air(2,6,10)->Libra; Water(3,7,11)->Cancer
    start = {0: 0, 1: 9, 2: 6, 3: 3}[sign_idx % 4]
    return (start + navamsa) % 12


def dasamsa_sign(lon):
    """D10 sign index (0-11). Parashari dasamsa."""
    sign_idx, within = sign_of(lon)
    part = int(within // 3.0)  # 0-9
    # Odd signs (0,2,4..) start from same sign; even signs start from 9th sign.
    if sign_idx % 2 == 0:
        start = sign_idx
    else:
        start = (sign_idx + 8) % 12
    return (start + part) % 12


def compute_chart(year, month, day, hour_local, minute_local, second_local,
                  tz_offset_hours, lat, lon_geo):
    """Compute a full sidereal chart. Returns a dict of pure astronomical data."""
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)

    # Local civil time -> UT
    ut_decimal = hour_local + minute_local / 60 + second_local / 3600 - tz_offset_hours
    # Handle day rollover
    jd_ut = swe.julday(year, month, day, 0.0) + ut_decimal / 24.0
    y2, m2, d2, h2 = swe.revjul(jd_ut)

    ayan = swe.get_ayanamsa_ut(jd_ut)

    planets = {}
    for name, pid in PLANETS:
        pos, _ = swe.calc_ut(jd_ut, pid, FLAGS)
        lon_p = pos[0] % 360
        speed = pos[3]
        planets[name] = {"lon": lon_p, "speed": speed, "retro": speed < 0}

    # Ketu = Rahu + 180
    ketu_lon = (planets["Rahu"]["lon"] + 180.0) % 360
    planets["Ketu"] = {"lon": ketu_lon, "speed": -planets["Rahu"]["speed"], "retro": True}

    # Houses: ascmc in sidereal. Use Placidus for ascmc; whole-sign for bhava.
    cusps, ascmc = swe.houses_ex(jd_ut, lat, lon_geo, b'P', FLAGS)
    asc = ascmc[0] % 360
    mc = ascmc[1] % 360

    asc_sign, _ = sign_of(asc)

    # Whole-sign house assignment: house 1 = asc_sign, counting forward.
    for name, p in planets.items():
        p_sign, within = sign_of(p["lon"])
        house = (p_sign - asc_sign) % 12 + 1
        n_idx, pada, _ = nakshatra_of(p["lon"])
        p["sign_idx"] = p_sign
        p["sign"] = SIGNS[p_sign]
        p["sign_deg"] = within
        p["house"] = house
        p["nakshatra"] = NAKSHATRAS[n_idx][0]
        p["nak_lord"] = NAKSHATRAS[n_idx][1]
        p["pada"] = pada
        p["navamsa_sign"] = SIGNS[navamsa_sign(p["lon"])]
        p["dasamsa_sign"] = SIGNS[dasamsa_sign(p["lon"])]

    return {
        "jd_ut": jd_ut,
        "ut": (y2, m2, d2, h2),
        "ayanamsa": ayan,
        "asc": asc, "asc_sign_idx": asc_sign, "mc": mc,
        "planets": planets,
    }


def vimshottari(moon_lon, birth_jd):
    """Compute Vimshottari dasha start balance and full Mahadasha timeline."""
    n_idx, _, into = nakshatra_of(moon_lon)
    lord = NAKSHATRAS[n_idx][1]
    # find lord position in sequence
    seq_names = [x[0] for x in VIMSHOTTARI]
    start_i = seq_names.index(lord)
    lord_years = VIMSHOTTARI[start_i][1]

    frac_elapsed = into / NAK_SPAN
    balance_years = lord_years * (1 - frac_elapsed)

    # Build Mahadasha timeline (JD based). 1 year = 365.2425 days (civil tropical year)
    DAY = 365.2425
    timeline = []
    jd = birth_jd - (lord_years - balance_years) * DAY  # notional start of running dasha
    # First (partial) dasha runs from birth with 'balance_years' remaining
    cur_jd = birth_jd
    order = [(seq_names[(start_i + k) % 9], VIMSHOTTARI[(start_i + k) % 9][1]) for k in range(9)]
    # first entry uses balance
    first_name, first_full = order[0]
    md_list = [(first_name, balance_years, first_full)]
    for k in range(1, 9 + 8):  # extend a couple cycles for future
        nm, full = order[k % 9]
        md_list.append((nm, full, full))

    out = []
    t = birth_jd
    for nm, yrs, full in md_list:
        start = t
        end = t + yrs * DAY
        out.append({"lord": nm, "years": yrs, "full_years": full,
                    "start_jd": start, "end_jd": end})
        t = end
    return {"start_lord": lord, "balance_years": balance_years,
            "nak_index": n_idx, "frac_elapsed": frac_elapsed, "timeline": out}


def antardashas(md_lord, md_full_years, md_start_jd):
    """Bhukti / Antardasha subdivisions within a Mahadasha."""
    DAY = 365.2425
    seq_names = [x[0] for x in VIMSHOTTARI]
    years_map = dict(VIMSHOTTARI)
    i = seq_names.index(md_lord)
    out = []
    t = md_start_jd
    for k in range(9):
        sub = seq_names[(i + k) % 9]
        ad_years = md_full_years * years_map[sub] / VIM_TOTAL
        out.append({"lord": sub, "years": ad_years,
                    "start_jd": t, "end_jd": t + ad_years * DAY})
        t += ad_years * DAY
    return out


def jd_to_str(jd):
    y, m, d, h = swe.revjul(jd)
    hh = int(h); mm = int((h - hh) * 60)
    return f"{y:04d}-{m:02d}-{d:02d} {hh:02d}:{mm:02d} UT"


def jd_to_date(jd):
    y, m, d, h = swe.revjul(jd)
    return f"{y:04d}-{m:02d}-{d:02d}"


# ----------------------------------------------------------------------------
# Built-in run: user's birth data
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    # Kuliyapitiya, Sri Lanka
    LAT = 7.4700
    LON = 80.0400
    # 3 June 1997, 02:52:00 local civil time
    # Sri Lanka clock in June 1997 = UTC+6:00 (see 03-astronomical-foundations.md)
    TZ = 6.0

    chart = compute_chart(1997, 6, 3, 2, 52, 0, TZ, LAT, LON)

    print("=" * 70)
    print("ASTRONOMICAL CALCULATION (fact) - Lahiri sidereal, Moshier ephemeris")
    print("=" * 70)
    print(f"JD(UT)      : {chart['jd_ut']:.6f}")
    print(f"UT instant  : {jd_to_str(chart['jd_ut'])}")
    print(f"Ayanamsa    : {chart['ayanamsa']:.6f} deg ({dms(chart['ayanamsa'])})")
    asc = chart['asc']
    ai, adeg = sign_of(asc)
    an, ap, _ = nakshatra_of(asc)
    print(f"Lagna (Asc) : {asc:.6f} deg | {SIGNS[ai]} {dms(adeg)} | "
          f"{NAKSHATRAS[an][0]} pada {ap}")
    print(f"MC          : {chart['mc']:.6f} deg")
    print()
    hdr = f"{'Planet':8} {'SidLon':>11} {'Sign':20} {'DegInSign':>12} {'H':>2} {'Nakshatra':16} {'Pd':>2} {'R':>1}"
    print(hdr)
    print("-" * len(hdr))
    order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
    for nm in order:
        p = chart["planets"][nm]
        print(f"{nm:8} {p['lon']:11.5f} {p['sign']:20} {dms(p['sign_deg']):>12} "
              f"{p['house']:2d} {p['nakshatra']:16} {p['pada']:2d} {'R' if p['retro'] else '-'}")
    print()
    print("D9 (Navamsa) / D10 (Dasamsa) signs:")
    for nm in order:
        p = chart["planets"][nm]
        print(f"  {nm:8} D1={p['sign']:20} D9={p['navamsa_sign']:20} D10={p['dasamsa_sign']}")
    print()
    print("=" * 70)
    print("VIMSHOTTARI DASHA (arithmetic from Moon nakshatra)")
    print("=" * 70)
    moon = chart["planets"]["Moon"]["lon"]
    vd = vimshottari(moon, chart["jd_ut"])
    print(f"Moon sidereal long : {moon:.5f} deg")
    print(f"Birth nakshatra    : {NAKSHATRAS[vd['nak_index']][0]} "
          f"(lord {vd['start_lord']})")
    print(f"Fraction elapsed   : {vd['frac_elapsed']*100:.3f}%")
    print(f"Balance at birth   : {vd['balance_years']:.4f} years of "
          f"{vd['start_lord']} Mahadasha")
    print()
    print(f"{'Mahadasha':10} {'Start':12} {'End':12} {'Years':>8}")
    print("-" * 46)
    now_jd = swe.julday(2026, 10, 5, 0.0)
    current = None
    for md in vd["timeline"]:
        mark = ""
        if md["start_jd"] <= now_jd < md["end_jd"]:
            mark = "  <== CURRENT"
            current = md
        print(f"{md['lord']:10} {jd_to_date(md['start_jd']):12} "
              f"{jd_to_date(md['end_jd']):12} {md['years']:8.3f}{mark}")
    print()
    if current:
        print(f"Current Mahadasha: {current['lord']} "
              f"({jd_to_date(current['start_jd'])} -> {jd_to_date(current['end_jd'])})")
        print(f"\n{'Antardasha':10} {'Start':12} {'End':12} {'Years':>8}")
        print("-" * 46)
        ads = antardashas(current["lord"], current["full_years"], current["start_jd"])
        for ad in ads:
            mark = ""
            if ad["start_jd"] <= now_jd < ad["end_jd"]:
                mark = "  <== CURRENT"
            print(f"{ad['lord']:10} {jd_to_date(ad['start_jd']):12} "
                  f"{jd_to_date(ad['end_jd']):12} {ad['years']:8.3f}{mark}")
