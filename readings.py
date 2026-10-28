"""
readings.py
-----------
Turns ephemeris numbers into human-readable *traditional* Jyotisha readings
for a day, a month or a year.

Two layers, kept apart on purpose:
  * FACT        - positions, dates, sunrise, dasha periods. Computed by the
                  Swiss Ephemeris via ../engine/jyotisha_engine.py.
  * TRADITION   - what those positions are said to *mean*. Rule-based text
                  built from classical gochara (transit-from-Moon) rules,
                  tara bala, chandrashtama, house themes and the dasha lords.
                  It is belief, not science, and never a guaranteed forecast.
"""

import datetime as dt
import os
import sys

import swisseph as swe

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "engine"))
import jyotisha_engine as eng  # noqa: E402

swe.set_ephe_path(None)
FLAGS = eng.FLAGS
DAY_YEARS = 365.2425

# ----------------------------------------------------------------------------
# Reference tables
# ----------------------------------------------------------------------------

SIGN_EN = [s.split("(")[1].rstrip(")") for s in eng.SIGNS]
SIGN_SK = [s.split(" (")[0] for s in eng.SIGNS]
NAK_NAMES = [n for n, _ in eng.NAKSHATRAS]

BODIES = [
    ("Sun", swe.SUN), ("Moon", swe.MOON), ("Mars", swe.MARS),
    ("Mercury", swe.MERCURY), ("Jupiter", swe.JUPITER), ("Venus", swe.VENUS),
    ("Saturn", swe.SATURN), ("Rahu", swe.MEAN_NODE),
]
ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
SLOW = ["Jupiter", "Saturn", "Rahu", "Ketu"]
MEDIUM = ["Sun", "Mars", "Mercury", "Venus"]

HOUSE = {
    1: ("self", "your body, energy, confidence and the way you come across"),
    2: ("money & family", "savings, family, food and the way you speak"),
    3: ("courage & communication", "courage, messages, short trips, siblings and your own effort"),
    4: ("home & heart", "home, mother, vehicles, comfort and inner peace"),
    5: ("romance & creativity", "romance, creativity, children, studies and joy"),
    6: ("work & obstacles", "daily work, competition, debts, health routines and rivals"),
    7: ("partnership", "your partner, marriage, one-to-one relationships and agreements"),
    8: ("depth & change", "sudden change, secrets, intimacy, shared money and deep emotions"),
    9: ("luck & wisdom", "luck, father, teachers, long journeys, faith and higher learning"),
    10: ("career", "career, status, reputation and responsibility"),
    11: ("gains & friends", "income, gains, friends, networks and wishes coming true"),
    12: ("rest & release", "expenses, sleep, solitude, foreign places and letting go"),
}

PLANET = {
    "Sun": dict(nature="identity, authority and vitality", verb="puts a spotlight on",
                good="recognition, confidence and support from people in authority",
                hard="ego clashes, pressure from authority or low energy"),
    "Moon": dict(nature="mood and feelings", verb="colours the mood of",
                 good="emotional ease and good timing",
                 hard="restlessness or over-sensitivity"),
    "Mars": dict(nature="energy, drive and courage", verb="energises - and can heat up -",
                 good="courage, beating rivals and getting things done",
                 hard="impatience, arguments or mistakes made in a hurry"),
    "Mercury": dict(nature="thinking, talking and trade", verb="sets thinking and talking in motion in",
                    good="clear thinking, useful conversations and good deals",
                    hard="mix-ups, nervousness or scattered focus"),
    "Jupiter": dict(nature="growth, wisdom and blessing", verb="expands and protects",
                    good="growth, help from others and wise choices",
                    hard="over-confidence, or help arriving slower than you hope"),
    "Venus": dict(nature="love, beauty and comfort", verb="sweetens",
                  good="affection, harmony, comfort and attraction",
                  hard="indulgence, jealousy or love feeling complicated"),
    "Saturn": dict(nature="discipline, time and responsibility", verb="slows down and tests",
                   good="steady progress that lasts, and reward for patient work",
                   hard="delays, heaviness, tiredness and extra responsibility"),
    "Rahu": dict(nature="desire, ambition and the unusual", verb="amplifies and unsettles",
                 good="unexpected openings and bold ambition paying off",
                 hard="confusion, cravings or restless dissatisfaction"),
    "Ketu": dict(nature="detachment and the inner life", verb="draws energy away from",
                 good="insight, and the ability to let go of what is finished",
                 hard="disinterest, feeling cut off, or things slipping away"),
}

# Classical gochara: houses counted from the natal Moon where a transit is favourable.
GOCHARA_GOOD = {
    "Sun": {3, 6, 10, 11}, "Moon": {1, 3, 6, 7, 10, 11}, "Mars": {3, 6, 11},
    "Mercury": {2, 4, 6, 8, 10, 11}, "Jupiter": {2, 5, 7, 9, 11},
    "Venus": {1, 2, 3, 4, 5, 8, 9, 11, 12}, "Saturn": {3, 6, 11},
    "Rahu": {3, 6, 11}, "Ketu": {3, 6, 11},
}

# Tara bala: (name, quality, score, meaning)
TARA = [
    ("Janma", "sensitive", -5,
     "your own birth star returns - a sensitive day; good for looking after yourself, not for big risks"),
    ("Sampat", "good", 15,
     "the 'wealth' star - traditionally good for money matters, effort and starting things"),
    ("Vipat", "challenging", -15,
     "the 'obstacle' star - tradition says finish things today rather than begin them"),
    ("Kshema", "good", 12,
     "the 'well-being' star - safe and comfortable, good for health and steady work"),
    ("Pratyak", "challenging", -12,
     "the 'opposition' star - expect some resistance; keep plans flexible and avoid confrontation"),
    ("Sadhana", "good", 15,
     "the 'achievement' star - good for effort, goals and getting things done"),
    ("Naidhana", "difficult", -20,
     "the most cautious star of the cycle - rest, go carefully, avoid big decisions and risky travel"),
    ("Mitra", "good", 12,
     "the 'friend' star - good for people, cooperation and help from friends"),
    ("Parama Mitra", "very good", 18,
     "the 'best friend' star - one of the most supportive days in the cycle"),
]

TITHI = (["Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
          "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dvadashi",
          "Trayodashi", "Chaturdashi"])

WEEKDAY_LORD = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]  # Mon=0
WEEKDAY_FLAVOUR = {
    "Sun": "the Sun's day - traditionally good for health, dealing with authority and government matters",
    "Moon": "the Moon's day - traditionally good for family, travel by water, and caring for others",
    "Mars": "Mars's day - traditionally good for courage, sport, property and technical work; avoid quarrels",
    "Mercury": "Mercury's day - traditionally good for study, writing, trade and communication",
    "Jupiter": "Jupiter's day - traditionally good for learning, teachers, religion and important beginnings",
    "Venus": "Venus's day - traditionally good for love, art, beauty, clothes and celebrations",
    "Saturn": "Saturn's day - traditionally good for steady, hard work and finishing old tasks",
}
RAHU_KALAM_PART = {0: 2, 1: 7, 2: 5, 3: 6, 4: 4, 5: 3, 6: 8}  # weekday -> 1..8 part of daylight

AREAS = [
    dict(key="love", title="Love & relationships", houses=[5, 7], karaka="Venus",
         focus="romance, your partner and closeness"),
    dict(key="career", title="Work & career", houses=[10, 6], karaka="Saturn",
         focus="work, ambition and reputation"),
    dict(key="money", title="Money", houses=[2, 11], karaka="Jupiter",
         focus="income, savings and spending"),
    dict(key="health", title="Health & energy", houses=[1, 6], karaka="Sun",
         focus="your body, energy and stress"),
    dict(key="mind", title="Mind & communication", houses=[3], karaka="Mercury",
         focus="thinking, talking, studies and messages"),
    dict(key="home", title="Home & family", houses=[4, 2], karaka="Moon",
         focus="home, parents and family"),
]


def ordinal(n):
    return f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"


def house_label(h):
    return f"{ordinal(h)} house of {HOUSE[h][0]}"


# ----------------------------------------------------------------------------
# Time helpers
# ----------------------------------------------------------------------------

def sri_lanka_offset(y, m, d, h=12, mi=0):
    """Historical Sri Lanka civil offset (hours) for a local date-time.
    1996-05-25 -> +6:30, 1996-10-26 00:30 -> +6:00, 2006-04-15 00:30 -> +5:30.
    (1942-45 wartime offsets are not modelled - pass tz manually for those.)"""
    t = dt.datetime(y, m, d, int(h), int(mi))
    if dt.datetime(1996, 5, 25, 0, 0) <= t < dt.datetime(1996, 10, 26, 0, 30):
        return 6.5
    if dt.datetime(1996, 10, 26, 0, 30) <= t < dt.datetime(2006, 4, 15, 0, 30):
        return 6.0
    return 5.5


def jd_local(date, hours, tz):
    return swe.julday(date.year, date.month, date.day, 0.0) + (hours - tz) / 24.0


def local_dt(jd, tz):
    y, m, d, h = swe.revjul(jd + tz / 24.0)
    base = dt.datetime(y, m, d)
    return base + dt.timedelta(hours=h)


def fmt_time(jd, tz):
    return local_dt(jd, tz).strftime("%I:%M %p").lstrip("0")


def fmt_date(jd, tz):
    return local_dt(jd, tz).strftime("%Y-%m-%d")


def nice_date(jd, tz):
    return local_dt(jd, tz).strftime("%a %d %b %Y")


def sun_event(jd_start, lat, lon, rise=True):
    flag = swe.CALC_RISE if rise else swe.CALC_SET
    _, tret = swe.rise_trans(jd_start, swe.SUN, flag, (lon, lat, 0.0), 0.0, 0.0, swe.FLG_MOSEPH)
    return tret[0]


def bisect(f, a, b, tol=1.0 / 1440):
    """Find the moment f changes value between jd a and b (f(a) != f(b))."""
    fa = f(a)
    while b - a > tol:
        m = (a + b) / 2
        if f(m) == fa:
            a = m
        else:
            b = m
    return b


# ----------------------------------------------------------------------------
# Positions
# ----------------------------------------------------------------------------

def positions(jd):
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    out = {}
    for name, pid in BODIES:
        pos, _ = swe.calc_ut(jd, pid, FLAGS)
        out[name] = {"lon": pos[0] % 360, "speed": pos[3]}
    out["Ketu"] = {"lon": (out["Rahu"]["lon"] + 180) % 360, "speed": out["Rahu"]["speed"]}
    for name, p in out.items():
        p["sign"] = int(p["lon"] // 30)
        p["deg"] = p["lon"] % 30
        p["nak"] = int(p["lon"] // eng.NAK_SPAN) % 27
        # Rahu/Ketu always move backwards; only flag true planets as retrograde.
        p["retro"] = p["speed"] < 0 and name not in ("Rahu", "Ketu")
    return out


def elongation(jd):
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    m = swe.calc_ut(jd, swe.MOON, FLAGS)[0][0]
    s = swe.calc_ut(jd, swe.SUN, FLAGS)[0][0]
    return (m - s) % 360


def tithi_at(jd):
    e = elongation(jd)
    i = int(e // 12)  # 0..29
    if i < 15:
        paksha = "Shukla (waxing)"
        name = "Purnima (full moon)" if i == 14 else TITHI[i]
    else:
        paksha = "Krishna (waning)"
        name = "Amavasya (new moon)" if i == 29 else TITHI[i - 15]
    return {"index": i + 1, "name": name, "paksha": paksha, "elongation": e}


# ----------------------------------------------------------------------------
# Natal chart
# ----------------------------------------------------------------------------

class Natal:
    def __init__(self, name, date, hour, minute, lat, lon, tz):
        self.name = name or "You"
        self.date, self.hour, self.minute = date, hour, minute
        self.lat, self.lon, self.tz = lat, lon, tz
        c = eng.compute_chart(date.year, date.month, date.day, hour, minute, 0, tz, lat, lon)
        self.chart = c
        self.jd = c["jd_ut"]
        self.asc = c["asc"]
        self.asc_sign = c["asc_sign_idx"]
        self.planets = c["planets"]
        self.moon_sign = self.planets["Moon"]["sign_idx"]
        self.moon_nak = int(self.planets["Moon"]["lon"] // eng.NAK_SPAN) % 27
        self.dasha = eng.vimshottari(self.planets["Moon"]["lon"], self.jd)

    def house_of_sign(self, s):
        return (s - self.asc_sign) % 12 + 1

    def from_moon(self, s):
        return (s - self.moon_sign) % 12 + 1

    def rules(self, planet):
        return sorted(self.house_of_sign(s) for s in range(12) if eng.SIGN_LORDS[s] == planet)

    def lord_of_house(self, h):
        return eng.SIGN_LORDS[(self.asc_sign + h - 1) % 12]

    def natal_house(self, planet):
        return self.planets[planet]["house"]

    def summary(self):
        an, ap, _ = eng.nakshatra_of(self.asc)
        rows = []
        for nm in ORDER:
            p = self.planets[nm]
            rows.append({
                "planet": nm, "sign": SIGN_EN[p["sign_idx"]], "sign_sk": SIGN_SK[p["sign_idx"]],
                "sign_idx": p["sign_idx"], "deg": round(p["sign_deg"], 2), "house": p["house"],
                "nakshatra": p["nakshatra"], "pada": p["pada"],
                "retro": bool(p["retro"]) and nm not in ("Rahu", "Ketu"),
            })
        return {
            "name": self.name,
            "lagna": {"sign": SIGN_EN[self.asc_sign], "sign_sk": SIGN_SK[self.asc_sign],
                      "sign_idx": self.asc_sign, "deg": round(self.asc % 30, 2),
                      "nakshatra": NAK_NAMES[an], "pada": ap},
            "moon_sign": SIGN_EN[self.moon_sign],
            "birth_star": NAK_NAMES[self.moon_nak],
            "ayanamsa": round(self.chart["ayanamsa"], 4),
            "tz": self.tz,
            "planets": rows,
        }

    # --- Vimshottari periods active at a moment -----------------------------
    def periods_at(self, jd):
        seq = [x[0] for x in eng.VIMSHOTTARI]
        yrs = dict(eng.VIMSHOTTARI)
        for i, md in enumerate(self.dasha["timeline"]):
            if md["start_jd"] <= jd < md["end_jd"]:
                # Sub-periods run from the *notional* start of the mahadasha, so the
                # first (partial) dasha at birth needs its elapsed part added back.
                notional = md["start_jd"] - (md["full_years"] - md["years"]) * DAY_YEARS
                ads = eng.antardashas(md["lord"], md["full_years"], notional)
                ad = next(a for a in ads if a["start_jd"] <= jd < a["end_jd"])
                k = seq.index(ad["lord"])
                t = ad["start_jd"]
                pd = None
                for j in range(9):
                    lord = seq[(k + j) % 9]
                    length = ad["years"] * yrs[lord] / eng.VIM_TOTAL * DAY_YEARS
                    if t <= jd < t + length:
                        pd = {"lord": lord, "start_jd": t, "end_jd": t + length}
                        break
                    t += length
                return {"md": md, "ad": ad, "pd": pd, "ads": ads}
        return None


# ----------------------------------------------------------------------------
# Interpretation helpers (TRADITION layer)
# ----------------------------------------------------------------------------

def planet_house_text(natal, name, p):
    h = natal.house_of_sign(p["sign"])
    fm = natal.from_moon(p["sign"])
    info = PLANET[name]
    good = fm in GOCHARA_GOOD[name]
    s = (f"{name} - the planet of {info['nature']} - {info['verb']} your "
         f"{house_label(h)} ({HOUSE[h][1]}). ")
    if good:
        s += (f"Counted from your Moon this is the {ordinal(fm)} position, which the classical "
              f"transit rules treat as supportive, so tradition expects {info['good']}.")
    else:
        s += (f"Counted from your Moon this is the {ordinal(fm)} position, which the classical "
              f"transit rules treat as testing, so tradition warns of {info['hard']}.")
    if p["retro"]:
        s += (f" {name} is also retrograde (it appears to move backwards), traditionally a time to "
              f"review and redo rather than start fresh in this area.")
    return s, good, h


def saturn_notes(natal, pos):
    fm = natal.from_moon(pos["Saturn"]["sign"])
    notes = []
    if fm in (12, 1, 2):
        phase = {12: "first (rising)", 1: "second (peak)", 2: "third (setting)"}[fm]
        notes.append(
            f"Sade Sati, {phase} phase: Saturn is in the {ordinal(fm)} from your Moon. Tradition sees "
            f"these 7.5 years as a slow, maturing test - more responsibility, less shortcut - not as "
            f"bad luck. Patience and steady routines are the classic advice.")
    elif fm == 8:
        notes.append("Ashtama Shani: Saturn is 8th from your Moon, a phase tradition links to strain, "
                     "worry and needing extra care with health and big risks.")
    elif fm == 4:
        notes.append("Kantaka Shani: Saturn is 4th from your Moon, traditionally linked to pressure "
                     "around home, comfort and peace of mind.")
    jf = natal.from_moon(pos["Jupiter"]["sign"])
    if jf in (2, 5, 7, 9, 11):
        notes.append(f"Jupiter is in a favourable place from your Moon (the {ordinal(jf)}) - "
                     f"tradition counts this as a protective, helpful background.")
    else:
        notes.append(f"Jupiter is {ordinal(jf)} from your Moon, which tradition does not count as one "
                     f"of its helpful positions - its support works more quietly right now.")
    return notes


def dasha_text(natal, periods, tz):
    if not periods:
        return []
    md, ad, pd = periods["md"], periods["ad"], periods["pd"]

    def lord_story(lord):
        ruled = natal.rules(lord)
        sits = natal.natal_house(lord)
        parts = []
        if ruled:
            parts.append("rules your " + " and ".join(f"{ordinal(h)} ({HOUSE[h][0]})" for h in ruled))
        parts.append(f"sits in your {ordinal(sits)} ({HOUSE[sits][0]})")
        themes = sorted(set(ruled + [sits]))
        return " and ".join(parts), themes

    md_story, md_th = lord_story(md["lord"])
    ad_story, ad_th = lord_story(ad["lord"])
    same = ad["lord"] == md["lord"]
    out = [
        f"You are in the {md['lord']} major period (Mahadasha), {fmt_date(md['start_jd'], tz)} to "
        f"{fmt_date(md['end_jd'], tz)}. In your chart {md['lord']} {md_story}, so tradition says these "
        f"years bring {', '.join(HOUSE[h][0] for h in md_th)} to the front of your life.",
        (f"Inside it runs the {ad['lord']} sub-period (Antardasha), {fmt_date(ad['start_jd'], tz)} to "
         f"{fmt_date(ad['end_jd'], tz)}. {ad['lord']} {ad_story}, adding the colour of "
         f"{', '.join(HOUSE[h][0] for h in ad_th)}.")
        if not same else
        (f"Right now you are in its opening sub-period, {md['lord']}-{md['lord']} "
         f"({fmt_date(ad['start_jd'], tz)} to {fmt_date(ad['end_jd'], tz)}) - tradition says a period's "
         f"own sub-period delivers its themes in their purest, most concentrated form."),
    ]
    if pd:
        ps, pth = lord_story(pd["lord"])
        out.append(f"At the finest level, the {pd['lord']} mini-period (Pratyantar) runs "
                   f"{fmt_date(pd['start_jd'], tz)} to {fmt_date(pd['end_jd'], tz)}, briefly "
                   f"highlighting {', '.join(HOUSE[h][0] for h in pth)}.")
    return out


def _periods_raw(periods):
    if not periods:
        return None
    md, ad = periods["md"], periods["ad"]
    return {"md": md["lord"], "md_start": md["start_jd"], "md_end": md["end_jd"],
            "ad": ad["lord"], "ad_start": ad["start_jd"], "ad_end": ad["end_jd"]}


def area_reading(natal, area, pos, periods, moon_house=None, moon_fm=None):
    """Builds a short plain-language paragraph set for one life area."""
    paras, score, items = [], 0, []
    moon_in = None
    karaka = None
    hs = area["houses"]
    if moon_house is not None:
        if moon_house in hs:
            good = moon_fm in GOCHARA_GOOD["Moon"]
            moon_in = good
            paras.append(
                f"Today the Moon passes through your {house_label(moon_house)}, so {area['focus']} are "
                f"on your mind and feelings run closer to the surface here. "
                + ("It is a supportive Moon position, good for gentle progress."
                   if good else "It is a sensitive Moon position, better for listening than pushing."))
            score += 8 if good else -6
    for name in SLOW + MEDIUM:
        p = pos[name]
        h = natal.house_of_sign(p["sign"])
        if h in hs:
            text, good, _ = planet_house_text(natal, name, p)
            paras.append(text)
            items.append({"planet": name, "good": good, "retro": p["retro"]})
            score += (10 if good else -8) if name in SLOW else (6 if good else -5)
    k = area["karaka"]
    kp = pos[k]
    kh = natal.house_of_sign(kp["sign"])
    if not any(natal.house_of_sign(pos[n]["sign"]) in hs and n == k for n in SLOW + MEDIUM):
        kgood = natal.from_moon(kp["sign"]) in GOCHARA_GOOD[k]
        karaka = {"planet": k, "good": kgood, "retro": kp["retro"]}
        paras.append(
            f"{k}, the natural significator of this area, is in your {house_label(kh)}"
            + (", a supportive placement from your Moon" if kgood else ", a testing placement from your Moon")
            + (" and retrograde - a review phase." if kp["retro"] else "."))
        score += 4 if kgood else -3
    if periods:
        lords = [("major period", periods["md"]["lord"])]
        if periods["ad"]["lord"] != periods["md"]["lord"]:
            lords.append(("sub-period", periods["ad"]["lord"]))
        for lvl, lord in lords:
            link = set(natal.rules(lord) + [natal.natal_house(lord)]) & set(hs)
            if link:
                paras.append(
                    f"Your {lvl} lord {lord} is tied to your {', '.join(ordinal(h) for h in sorted(link))} "
                    f"house, which tradition reads as this area being actively 'switched on' in this chapter of life.")
                score += 3
    if not paras:
        paras.append(f"No major planet is moving through the houses of {area['focus']} right now - "
                     f"tradition would call this a quiet, stable background for this area.")
    tone = "supportive" if score >= 8 else "mixed" if score >= -4 else "testing"
    advice = {
        "supportive": "Tradition's advice: a good time to move forward here.",
        "mixed": "Tradition's advice: steady and sincere - avoid forcing outcomes.",
        "testing": "Tradition's advice: be patient, review, and protect what you have.",
    }[tone]
    return {"key": area["key"], "title": area["title"], "tone": tone, "score": score,
            "paragraphs": paras, "advice": advice,
            "items": items, "karaka": karaka, "moon_in": moon_in}


def natal_hits(natal, pos, orb=2.0, bodies=None):
    hits = []
    targets = dict((nm, natal.planets[nm]["lon"]) for nm in ORDER)
    targets["Lagna"] = natal.asc
    for name in bodies or ORDER:
        for t, lon in targets.items():
            d = abs((pos[name]["lon"] - lon + 180) % 360 - 180)
            if d <= orb:
                hits.append({"transit": name, "natal": t, "orb": round(d, 2),
                             "text": f"Transiting {name} is passing over your birth {t} "
                                     f"(within {d:.1f}°) - tradition treats this as a moment when "
                                     f"{PLANET[name]['nature']} touches {('your ' + t) if t != 'Lagna' else 'you personally'}."})
    return hits


# ----------------------------------------------------------------------------
# Event finder (ingresses, stations, new/full moons, eclipses)
# ----------------------------------------------------------------------------

EVENT_BODIES = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu"]


def find_events(natal, jd1, jd2, tz):
    events = []
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    pid = dict(BODIES)

    def lon(b, jd):
        return swe.calc_ut(jd, pid[b], FLAGS)[0][0] % 360

    def spd(b, jd):
        return swe.calc_ut(jd, pid[b], FLAGS)[0][3]

    for b in EVENT_BODIES:
        step = 1.0
        jd = jd1
        prev_sign = int(lon(b, jd) // 30)
        prev_r = spd(b, jd) < 0
        while jd < jd2:
            nxt = min(jd + step, jd2)
            s = int(lon(b, nxt) // 30)
            r = spd(b, nxt) < 0
            if s != prev_sign:
                t = bisect(lambda x: int(lon(b, x) // 30), jd, nxt)
                h = natal.house_of_sign(s)
                events.append(_ingress(b, s, h, t, tz))
                if b == "Rahu":
                    ks = (s + 6) % 12
                    events.append(_ingress("Ketu", ks, natal.house_of_sign(ks), t, tz))
            if b != "Rahu" and r != prev_r:
                t = bisect(lambda x: spd(b, x) < 0, jd, nxt)
                h = natal.house_of_sign(int(lon(b, t) // 30))
                events.append({
                    "jd": t, "date": fmt_date(t, tz), "time": fmt_time(t, tz), "kind": "station",
                    "planet": b, "house": h, "direction": "retro" if r else "direct",
                    "title": f"{b} turns {'retrograde' if r else 'direct'} in your {ordinal(h)} house",
                    "text": (f"{b} appears to stop and reverse. Tradition reads a {b} retrograde as a "
                             f"time to review {PLANET[b]['nature']} matters around {HOUSE[h][1]}."
                             if r else
                             f"{b} resumes forward motion. Tradition reads this as delays and second "
                             f"thoughts around {HOUSE[h][1]} starting to clear."),
                })
            prev_sign, prev_r, jd = s, r, nxt

    # New & full moons (elongation crosses 0 or 180)
    jd = jd1
    pe = elongation(jd)
    while jd < jd2:
        nxt = min(jd + 0.25, jd2)
        e = elongation(nxt)
        kind = None
        if pe > 300 and e < 60:
            kind = "new"
        elif pe < 180 <= e:
            kind = "full"
        if kind:
            t = bisect(lambda x: (elongation(x) < 180) if kind == "full" else (elongation(x) > 180), jd, nxt)
            m = positions(t)["Moon"]
            h = natal.house_of_sign(m["sign"])
            if kind == "full":
                title = f"Full Moon (Poya) in {SIGN_EN[m['sign']]} - your {ordinal(h)} house"
                text = (f"A Poya day. Tradition sees the full Moon as a peak of feeling and completion; "
                        f"in your chart it lights up {HOUSE[h][1]}.")
            else:
                title = f"New Moon in {SIGN_EN[m['sign']]} - your {ordinal(h)} house"
                text = (f"The darkest Moon. Tradition treats it as a quiet reset - a time to plan "
                        f"rather than launch - here around {HOUSE[h][1]}.")
            events.append({"jd": t, "date": fmt_date(t, tz), "time": fmt_time(t, tz),
                           "kind": "lunation", "planet": "Moon", "house": h, "lunation": kind,
                           "title": title, "text": text})
        pe, jd = e, nxt

    # Eclipses
    for kind, fn in (("solar", swe.sol_eclipse_when_glob), ("lunar", swe.lun_eclipse_when)):
        t = jd1
        while True:
            res = fn(t, swe.FLG_MOSEPH, 0, False)
            tmax = res[1][0]
            if tmax > jd2:
                break
            flags = res[0]
            sort = ("total" if flags & swe.ECL_TOTAL else "annular" if flags & swe.ECL_ANNULAR
                    else "partial" if flags & swe.ECL_PARTIAL else "penumbral")
            m = positions(tmax)["Moon"]
            h = natal.house_of_sign(m["sign"])
            events.append({
                "jd": tmax, "date": fmt_date(tmax, tz), "time": fmt_time(tmax, tz), "kind": "eclipse",
                "planet": "Sun" if kind == "solar" else "Moon", "house": h, "eclipse": kind,
                "title": f"{sort.title()} {kind} eclipse in your {ordinal(h)} house",
                "text": (f"Somewhere on Earth there is a {sort} {kind} eclipse (it may not be visible in "
                         f"Sri Lanka). Tradition treats eclipses as unsettled days - avoid starting "
                         f"important things - and links this one to {HOUSE[h][1]}."),
            })
            t = tmax + 1
    events.sort(key=lambda e: e["jd"])
    return events


def _ingress(b, s, h, t, tz):
    return {
        "jd": t, "date": fmt_date(t, tz), "time": fmt_time(t, tz), "kind": "ingress", "planet": b,
        "house": h,
        "title": f"{b} enters {SIGN_EN[s]} - your {house_label(h)}",
        "text": (f"{b} ({PLANET[b]['nature']}) moves into your {ordinal(h)} house, so tradition says "
                 f"its influence now shifts to {HOUSE[h][1]}."),
    }


# ----------------------------------------------------------------------------
# Day scoring
# ----------------------------------------------------------------------------

def day_core(natal, jd):
    pos = positions(jd)
    m = pos["Moon"]
    count = (m["nak"] - natal.moon_nak) % 27
    tara_i = count % 9
    tara = TARA[tara_i]
    mh = natal.house_of_sign(m["sign"])
    mfm = natal.from_moon(m["sign"])
    chandrashtama = mfm == 8
    score = 55 + tara[2] + (10 if mfm in GOCHARA_GOOD["Moon"] else -6)
    if chandrashtama:
        score -= 18
    for n in ("Jupiter", "Saturn", "Venus", "Mars"):
        score += 2 if natal.from_moon(pos[n]["sign"]) in GOCHARA_GOOD[n] else -2
    score = max(5, min(95, score))
    label = score_label(score)
    return {"pos": pos, "tara_i": tara_i, "tara": tara, "moon_house": mh, "moon_fm": mfm,
            "chandrashtama": chandrashtama, "score": score, "label": label}


SAMPLE_HOURS = (7.0, 10.0, 13.0, 16.0, 19.0)


def day_score(natal, date, tz):
    """Day-level score: average of the waking-hours samples, so the number does not
    jump around depending on the minute you look at it."""
    cores = [day_core(natal, jd_local(date, h, tz)) for h in SAMPLE_HOURS]
    score = round(sum(c["score"] for c in cores) / len(cores))
    return score, score_label(score), cores


def score_label(score):
    return ("Excellent" if score >= 80 else "Good" if score >= 65 else "Mixed" if score >= 48
            else "Careful" if score >= 35 else "Quiet & cautious")


def sky_table(natal, pos):
    rows = []
    for nm in ORDER:
        p = pos[nm]
        rows.append({
            "planet": nm, "sign": SIGN_EN[p["sign"]], "sign_sk": SIGN_SK[p["sign"]],
            "deg": round(p["deg"], 2), "nakshatra": NAK_NAMES[p["nak"]],
            "house": natal.house_of_sign(p["sign"]), "from_moon": natal.from_moon(p["sign"]),
            "retro": p["retro"],
            "supportive": natal.from_moon(p["sign"]) in GOCHARA_GOOD[nm],
        })
    return rows


# ----------------------------------------------------------------------------
# DAY reading
# ----------------------------------------------------------------------------

def day_reading(natal, date, tz_now, lat, lon, now_jd=None):
    midnight = jd_local(date, 0.0, tz_now)
    sunrise = sun_event(midnight, lat, lon, True)
    sunset = sun_event(sunrise, lat, lon, False)
    next_sunrise = sun_event(sunset, lat, lon, True)
    is_today = now_jd is not None and midnight <= now_jd < midnight + 1
    ref = now_jd if is_today else jd_local(date, 12.0, tz_now)

    core = day_core(natal, ref)
    pos = core["pos"]
    day_sc, day_lbl, _ = day_score(natal, date, tz_now)
    periods = natal.periods_at(ref)

    # Moon star segments across the traditional day (sunrise -> next sunrise)
    def nak_at(x):
        return positions(x)["Moon"]["nak"]
    segs = []
    t = sunrise
    cur = nak_at(t)
    seg_start = sunrise
    while t < next_sunrise:
        nxt = min(t + 1 / 24, next_sunrise)
        n = nak_at(nxt)
        if n != cur:
            change = bisect(nak_at, t, nxt)
            segs.append((seg_start, change, cur))
            seg_start, cur = change, n
        t = nxt
    segs.append((seg_start, next_sunrise, cur))
    star_segments = []
    for a, b, n in segs:
        ti = ((n - natal.moon_nak) % 27) % 9
        star_segments.append({
            "from": fmt_time(a, tz_now), "to": fmt_time(b, tz_now), "nakshatra": NAK_NAMES[n],
            "tara": TARA[ti][0], "quality": TARA[ti][1], "meaning": TARA[ti][3],
            "tara_i": ti, "from_jd": a, "to_jd": b,
        })

    weekday = local_dt(sunrise, tz_now).weekday()
    wlord = WEEKDAY_LORD[weekday]
    part = (sunset - sunrise) / 8
    rk_start = sunrise + (RAHU_KALAM_PART[weekday] - 1) * part
    tithi = tithi_at(sunrise)

    m = pos["Moon"]
    mh, mfm = core["moon_house"], core["moon_fm"]
    tara = core["tara"]

    # Headline + narrative summary
    headline = (f"{day_lbl} day - the Moon is in your {house_label(mh)}, "
                f"on your {tara[0]} star" + (" right now" if is_today else ""))
    summary = [
        f"Today the Moon travels through {SIGN_EN[m['sign']]} ({SIGN_SK[m['sign']]}), which is your "
        f"{house_label(mh)}. In plain words, your attention and feelings naturally drift towards "
        f"{HOUSE[mh][1]}.",
        f"The Moon's star today is {NAK_NAMES[m['nak']]}. Counted from your birth star "
        f"{NAK_NAMES[natal.moon_nak]}, it is your {tara[0]} tara: {tara[3]}.",
    ]
    if core["chandrashtama"]:
        summary.append("It is also Chandrashtama - the Moon is 8th from your birth Moon. Sri Lankan "
                       "and Indian almanacs both mark this as a day to stay low-key: avoid arguments, "
                       "risky travel and big decisions.")
    elif mfm in GOCHARA_GOOD["Moon"]:
        summary.append(f"Counted from your birth Moon this is the {ordinal(mfm)} position - one of the "
                       f"Moon's good places, so the day's emotional weather is traditionally easy.")
    else:
        summary.append(f"Counted from your birth Moon this is the {ordinal(mfm)} position - not one of "
                       f"the Moon's easy places, so tradition advises patience with moods today.")
    summary.append(f"It is {WEEKDAY_FLAVOUR[wlord]}.")

    # Moon section
    moon_paras = [
        f"The Moon is at {m['deg']:.1f}° {SIGN_EN[m['sign']]} in {NAK_NAMES[m['nak']]}"
        + (" (it is right now)." if is_today else " (at midday)."),
        planet_house_text(natal, "Moon", m)[0],
    ]

    # Background weather
    weather = saturn_notes(natal, pos)
    retros = [n for n in ORDER if pos[n]["retro"]]
    if retros:
        weather.append(
            "Retrograde now: " + ", ".join(retros) + ". Tradition treats retrograde planets as "
            "'looking back' - good for reviewing, repairing and reconnecting; less ideal for brand-new starts "
            "in what those planets rule.")
    rh = natal.house_of_sign(pos["Rahu"]["sign"])
    kh = natal.house_of_sign(pos["Ketu"]["sign"])
    weather.append(f"The nodes sit across your {ordinal(rh)} and {ordinal(kh)} houses: Rahu stirs up "
                   f"hunger and restlessness around {HOUSE[rh][0]}, while Ketu makes you detached "
                   f"from {HOUSE[kh][0]}.")

    areas = [area_reading(natal, a, pos, periods, mh, mfm) for a in AREAS]

    hits = natal_hits(natal, pos, orb=2.0)
    for h in hits:
        if h["transit"] == "Moon":
            h["text"] = (f"The Moon passes over your birth {h['natal']} today - tradition says "
                         f"you'll feel {('that planet' if h['natal'] != 'Lagna' else 'yourself')} "
                         f"more strongly for a few hours.")

    # Do / avoid
    do, avoid = [], []
    if tara[2] > 0:
        do.append(f"Use the {tara[0]} star: {tara[3].split(' - ')[1]}.")
    else:
        avoid.append(f"Don't launch big things under the {tara[0]} star - {tara[3].split(' - ')[1]}.")
    good_segs = [g for g in star_segments if TARA[[t[0] for t in TARA].index(g["tara"])][2] > 0]
    if good_segs:
        g = good_segs[0]
        do.append(f"Best window: {g['from']} - {g['to']}, while the Moon is in {g['nakshatra']} "
                  f"(your {g['tara']} star). Put the important things there.")
    do.append(f"Lean into {HOUSE[mh][1].split(',')[0]} - that's where the Moon puts your energy.")
    do.append(f"Use the day's ruler: {WEEKDAY_FLAVOUR[wlord].split(' - ')[1]}.")
    if "Venus" in retros:
        avoid.append("Rushing love decisions - Venus is retrograde (review, don't rush).")
    if "Mercury" in retros:
        avoid.append("Signing in a hurry or sending messages unread - Mercury is retrograde.")
    if core["chandrashtama"]:
        avoid.append("Arguments and risky travel - it's Chandrashtama.")
    avoid.append(f"Starting important work during Rahu Kalam ({fmt_time(rk_start, tz_now)} - "
                 f"{fmt_time(rk_start + part, tz_now)}).")

    upcoming = [e for e in find_events(natal, ref, ref + 30, tz_now)][:8]

    return {
        "mode": "day",
        "date": date.isoformat(),
        "nice_date": local_dt(jd_local(date, 12, tz_now), tz_now).strftime("%A, %d %B %Y"),
        "is_today": is_today,
        "as_of": fmt_time(ref, tz_now) if is_today else "midday",
        "score": day_sc, "label": day_lbl, "now_score": core["score"], "headline": headline,
        "summary": summary,
        "panchanga": {
            "weekday": local_dt(sunrise, tz_now).strftime("%A"), "weekday_lord": wlord,
            "tithi": tithi["name"], "paksha": tithi["paksha"],
            "nakshatra": NAK_NAMES[m["nak"]], "moon_sign": SIGN_EN[m["sign"]],
            "sunrise": fmt_time(sunrise, tz_now), "sunset": fmt_time(sunset, tz_now),
            "rahu_kalam": f"{fmt_time(rk_start, tz_now)} - {fmt_time(rk_start + part, tz_now)}",
            "tara": tara[0], "chandrashtama": core["chandrashtama"],
            "elongation": round(elongation(ref), 1),
        },
        "star_segments": star_segments,
        "moon": moon_paras,
        "weather": weather,
        "areas": areas,
        "hits": hits,
        "dasha": dasha_text(natal, periods, tz_now),
        "do": do, "avoid": avoid,
        "sky": sky_table(natal, pos),
        "upcoming": upcoming,
        "raw": {
            "moon_house": mh, "tara_i": core["tara_i"], "chandrashtama": core["chandrashtama"],
            "sunrise": sunrise, "sunset": sunset, "rahu": [rk_start, rk_start + part],
            "weekday": weekday, "retros": retros, "periods": _periods_raw(periods),
            "sade_sati": natal.from_moon(pos["Saturn"]["sign"]) in (12, 1, 2),
            "jupiter_good": natal.from_moon(pos["Jupiter"]["sign"]) in GOCHARA_GOOD["Jupiter"],
            "date_jd": jd_local(date, 12, tz_now),
            "ref_jd": ref,
        },
    }


# ----------------------------------------------------------------------------
# MONTH reading
# ----------------------------------------------------------------------------

def month_reading(natal, year, month, tz_now, lat, lon):
    first = dt.date(year, month, 1)
    nxt = dt.date(year + (month == 12), month % 12 + 1, 1)
    ndays = (nxt - first).days
    jd1, jd2 = jd_local(first, 0, tz_now), jd_local(nxt, 0, tz_now)

    days = []
    for i in range(ndays):
        d = first + dt.timedelta(days=i)
        sc, lbl, cores = day_score(natal, d, tz_now)
        c = cores[1]  # 10 AM sample describes the working day
        m = c["pos"]["Moon"]
        days.append({
            "date": d.isoformat(), "day": d.day, "weekday": d.strftime("%a"),
            "score": sc, "label": lbl, "tara": c["tara"][0],
            "tara_quality": c["tara"][1], "moon_house": c["moon_house"],
            "moon_sign": SIGN_EN[m["sign"]], "nakshatra": NAK_NAMES[m["nak"]],
            "chandrashtama": any(x["chandrashtama"] for x in cores),
            "note": f"Moon in your {ordinal(c['moon_house'])} ({HOUSE[c['moon_house']][0]}), {c['tara'][0]} star",
        })

    events = find_events(natal, jd1, jd2, tz_now)
    for e in events:
        for d in days:
            if d["date"] == e["date"]:
                d.setdefault("events", []).append(e["title"])

    mid = jd_local(first + dt.timedelta(days=ndays // 2), 12, tz_now)
    pos = positions(mid)
    periods = natal.periods_at(mid)
    areas = [area_reading(natal, a, pos, periods) for a in AREAS]

    ranked = sorted(days, key=lambda d: -d["score"])
    best = sorted(ranked[:5], key=lambda d: d["day"])
    careful = sorted(sorted(days, key=lambda d: d["score"])[:5], key=lambda d: d["day"])

    weeks = []
    for w in range(0, ndays, 7):
        chunk = days[w:w + 7]
        evs = [e for e in events if chunk[0]["date"] <= e["date"] <= chunk[-1]["date"]]
        avg = round(sum(d["score"] for d in chunk) / len(chunk))
        houses = []
        for d in chunk:
            if not houses or houses[-1] != d["moon_house"]:
                houses.append(d["moon_house"])
        text = (f"The Moon moves through your " + ", then ".join(
            f"{ordinal(h)} ({HOUSE[h][0]})" for h in houses) + ". ")
        top = max(chunk, key=lambda d: d["score"])
        low = min(chunk, key=lambda d: d["score"])
        text += (f"The easiest day looks like {top['weekday']} {top['day']} ({top['tara']} star); "
                 f"go gently on {low['weekday']} {low['day']}"
                 + (" - Chandrashtama." if low["chandrashtama"] else f" ({low['tara']} star)."))
        if evs:
            text += " Key sky events: " + "; ".join(e["title"] for e in evs) + "."
        weeks.append({"label": f"{chunk[0]['day']}-{chunk[-1]['day']}", "avg": avg, "text": text,
                      "best": top["date"], "low": low["date"], "events": evs})

    sun_h = natal.house_of_sign(pos["Sun"]["sign"])
    overview = [
        f"This month the Sun lights up your {house_label(sun_h)} - the main stage this month is "
        f"{HOUSE[sun_h][1]}.",
        f"Mars is in your {ordinal(natal.house_of_sign(pos['Mars']['sign']))}, Venus in your "
        f"{ordinal(natal.house_of_sign(pos['Venus']['sign']))} and Mercury in your "
        f"{ordinal(natal.house_of_sign(pos['Mercury']['sign']))}, which colour energy, love and "
        f"communication respectively.",
    ] + saturn_notes(natal, pos)

    return {
        "mode": "month", "year": year, "month": month,
        "title": first.strftime("%B %Y"),
        "first_weekday": first.weekday(),
        "avg": round(sum(d["score"] for d in days) / ndays),
        "overview": overview,
        "days": days, "weeks": weeks, "events": events, "areas": areas,
        "best": best, "careful": careful,
        "dasha": dasha_text(natal, periods, tz_now),
        "sky": sky_table(natal, pos),
        "raw": {
            "sun_house": sun_h, "periods": _periods_raw(periods),
            "sade_sati": natal.from_moon(pos["Saturn"]["sign"]) in (12, 1, 2),
            "jupiter_good": natal.from_moon(pos["Jupiter"]["sign"]) in GOCHARA_GOOD["Jupiter"],
        },
    }


# ----------------------------------------------------------------------------
# YEAR reading
# ----------------------------------------------------------------------------

def year_reading(natal, year, tz_now, lat, lon):
    jd1 = jd_local(dt.date(year, 1, 1), 0, tz_now)
    jd2 = jd_local(dt.date(year + 1, 1, 1), 0, tz_now)
    events = find_events(natal, jd1, jd2, tz_now)
    big = [e for e in events if e["kind"] in ("eclipse", "station") or
           (e["kind"] == "ingress" and e["planet"] in ("Jupiter", "Saturn", "Rahu", "Ketu", "Mars", "Venus"))]

    months = []
    for mth in range(1, 13):
        first = dt.date(year, mth, 1)
        nxt = dt.date(year + (mth == 12), mth % 12 + 1, 1)
        n = (nxt - first).days
        scores = [day_score(natal, first + dt.timedelta(days=i), tz_now)[0] for i in range(n)]
        mid = jd_local(first + dt.timedelta(days=14), 12, tz_now)
        pos = positions(mid)
        periods = natal.periods_at(mid)
        love = area_reading(natal, AREAS[0], pos, periods)
        career = area_reading(natal, AREAS[1], pos, periods)
        money = area_reading(natal, AREAS[2], pos, periods)
        sh = natal.house_of_sign(pos["Sun"]["sign"])
        mevs = [e for e in big if e["date"][:7] == f"{year}-{mth:02d}"]
        text = (f"The Sun moves through your {house_label(sh)}, putting the spotlight on "
                f"{HOUSE[sh][1].split(',')[0]}. Love looks {love['tone']}, work {career['tone']}, money {money['tone']}.")
        if mevs:
            text += " Turning points: " + "; ".join(f"{e['title']} ({e['date'][8:]})" for e in mevs) + "."
        months.append({
            "month": mth, "name": first.strftime("%B"), "avg": round(sum(scores) / n),
            "best_day": scores.index(max(scores)) + 1, "text": text,
            "love": love["tone"], "career": career["tone"], "money": money["tone"],
            "sun_house": sh, "events": mevs,
        })

    # Slow-planet journey through the year
    journey, journey_raw = [], []
    for name in ("Jupiter", "Saturn", "Rahu", "Ketu"):
        segs = []
        t = jd1
        while t < jd2:
            p = positions(t)[name]
            h = natal.house_of_sign(p["sign"])
            if not segs or segs[-1]["house"] != h:
                segs.append({"house": h, "sign": SIGN_EN[p["sign"]], "from": fmt_date(t, tz_now)})
            t += 5
        txt = f"{name}: " + " -> ".join(
            f"your {ordinal(s['house'])} ({HOUSE[s['house']][0]}) from {s['from']}" for s in segs)
        journey.append(txt)
        journey_raw.append({"planet": name, "segments": segs})

    mid = jd_local(dt.date(year, 7, 1), 12, tz_now)
    pos = positions(mid)
    periods_start = natal.periods_at(jd1)
    periods_end = natal.periods_at(jd2 - 1)
    dasha_changes = []
    if periods_start and periods_end:
        for ad in periods_start["ads"] + (periods_end["ads"] if periods_end["md"] is not periods_start["md"] else []):
            if jd1 <= ad["start_jd"] < jd2:
                dasha_changes.append(f"{fmt_date(ad['start_jd'], tz_now)}: "
                                     f"{ad['lord']} sub-period begins")
        if periods_end["md"]["start_jd"] >= jd1:
            dasha_changes.insert(0, f"{fmt_date(periods_end['md']['start_jd'], tz_now)}: "
                                    f"{periods_end['md']['lord']} MAJOR period begins - a new life chapter")

    areas = [area_reading(natal, a, pos, natal.periods_at(mid)) for a in AREAS]
    ranked = sorted(months, key=lambda m: -m["avg"])
    overview = [
        f"Strongest-feeling months (by daily averages): {', '.join(m['name'] for m in ranked[:3])}. "
        f"Gentlest/most cautious: {', '.join(m['name'] for m in ranked[-3:])}.",
    ] + saturn_notes(natal, pos)

    return {
        "mode": "year", "year": year, "overview": overview, "months": months,
        "journey": journey, "events": big, "dasha_changes": dasha_changes,
        "dasha": dasha_text(natal, natal.periods_at(mid), tz_now),
        "areas": areas,
        "raw": {
            "journey": journey_raw, "periods": _periods_raw(natal.periods_at(mid)),
            "sade_sati": natal.from_moon(pos["Saturn"]["sign"]) in (12, 1, 2),
            "best": [m["month"] for m in ranked[:3]], "worst": [m["month"] for m in ranked[-3:]],
            "dasha_changes": [
                {"jd": ad["start_jd"], "lord": ad["lord"], "major": False}
                for ad in (periods_start["ads"] if periods_start else []) if jd1 <= ad["start_jd"] < jd2
            ],
        },
    }
