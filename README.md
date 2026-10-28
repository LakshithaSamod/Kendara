# Kendara: web app for traditional readings

A web app that gives plain-language traditional Jyotiṣa readings (Sinhala or English) for
**today**, **any date**, **any month** or **any year**. It is self-contained: the calculation
engine is included in `jyotish/`.

## Layout

```
index.html, style.css, app.js   the website (static files)
api/reading.py, api/natal.py    Vercel serverless functions (the JSON API)
jyotish/                        engine.py (Swiss Ephemeris), readings.py (traditional rules),
                                simple.py (plain English/Sinhala text), service.py (API logic)
server.py                       local development server (same API + static files)
requirements.txt, vercel.json   deployment settings
```

## Run locally

```bash
pip install -r requirements.txt
python3 server.py
# open http://127.0.0.1:8765
```

## Deploy on Vercel (via GitHub)

1. Push this folder to a GitHub repository (this folder is the repo root).
2. On vercel.com → **Add New… → Project** → import the repository.
3. Framework preset: **Other**. Leave the build and output settings empty, then **Deploy**.

Vercel serves `index.html` and the other static files, and runs `api/*.py` as Python
functions. They install `pyswisseph` from `requirements.txt`. PyPI has no prebuilt pyswisseph
package for Python 3.12+, so Vercel compiles it from source during the build (needs only a C
compiler). If that build step ever fails, choose a Python 3.11 runtime in the project settings,
where a prebuilt package exists.

## What each view shows

| View | Contents |
|---|---|
| Today / A date | Day score, Moon's house and star, tara bala, tithi, sunrise/sunset, Rahu Kalam, how the day changes as the Moon changes star, do/avoid list, six life areas (love, work, money, health, mind, home), Sade Sati and other background, current Mahadasha → Antardasha → Pratyantar, transit chart, the next 30 days of sky events |
| A month | Calendar coloured by daily score (tap a day for its full reading), brightest and gentle days, week-by-week text, life areas, ingresses/stations/Poya/new moon/eclipses |
| A year | 12 month cards (tap for that month), the slow planets moving through your houses, Dasha changes, turning points, life areas |

**Language & style.** Readings come in **Sinhala (default) or English** (switch at the top
right). The main reading uses plain, everyday sentences with no technical terms; the technical
reasoning (degrees, houses, tara names, the chart grid) is under **More details**, in English.
The plain text lives in `jyotish/simple.py`: each Sinhala message is written as its own sentence, not
translated word by word. Nakshatra names stay in English until their Sinhala spellings are confirmed.

Birth details are editable in the app and saved only in your browser.
Sri Lanka's 1996–2006 clock changes (+6:30 / +6:00) are handled automatically.

## Fact vs tradition

* **Fact:** positions, dates, sunrise, Rahu Kalam times, eclipses, dasha periods (Swiss Ephemeris, Lahiri, whole-sign houses, Vimśottarī).
* **Tradition:** every sentence about *meaning* is generated from classical rules in
  `jyotish/readings.py`: gochara (transits counted from the natal Moon), tara bala, Chandrashtama,
  house themes and dasha-lord rulerships. It is belief, not science, and never a guaranteed prediction.
* The **score** (0–100) is this app's own summary of those traditional rules (tara + Moon
  position + Chandrashtama + a small slow-planet term, averaged over 7 AM–7 PM). It is not a
  standard almanac number.

## API

`GET /api/reading?mode=day|month|year&date=YYYY-MM-DD|month=YYYY-MM|year=YYYY`
plus `lang=si|en`, birth fields `name, bdate, btime, lat, lon, tz(auto|hours)` and optional
`clat, clon` (where you are today, for sunrise/Rahu Kalam). `GET /api/natal` returns the birth chart.
