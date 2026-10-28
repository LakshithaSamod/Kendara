# Kendara: web app for traditional readings

A local web app that gives plain-language traditional Jyotiṣa readings for
**today**, **any date**, **any month** or **any year**, using the same calculation
engine as the rest of this knowledge base (`../engine/jyotisha_engine.py`).

## Run

```bash
cd horos/sri-lankan-astrology-agent/webapp
python3 server.py
# open http://127.0.0.1:8765
```

No installs beyond `pyswisseph` (already needed by the engine). It listens on
127.0.0.1 only, so it is only reachable from this computer. Change the port with `PORT=9000 python3 server.py`.

## What each view shows

| View | Contents |
|---|---|
| Today / A date | Day score, Moon's house and star, tara bala, tithi, sunrise/sunset, Rahu Kalam, how the day changes as the Moon changes star, do/avoid list, six life areas (love, work, money, health, mind, home), Sade Sati and other background, current Mahadasha → Antardasha → Pratyantar, transit chart, the next 30 days of sky events |
| A month | Calendar coloured by daily score (tap a day for its full reading), brightest and gentle days, week-by-week text, life areas, ingresses/stations/Poya/new moon/eclipses |
| A year | 12 month cards (tap for that month), the slow planets moving through your houses, Dasha changes, turning points, life areas |

**Language & style.** Readings come in **Sinhala (default) or English** (switch at the top
right). The main reading uses plain, everyday sentences with no technical terms; the technical
reasoning (degrees, houses, tara names, the chart grid) is under **More details**, in English.
The plain text lives in `simple.py`: each Sinhala message is written as its own sentence, not
translated word by word. Nakshatra names stay in English until their Sinhala spellings are confirmed.

Birth details are editable in the app and saved only in your browser.
Sri Lanka's 1996–2006 clock changes (+6:30 / +6:00) are handled automatically.

## Fact vs tradition

* **Fact:** positions, dates, sunrise, Rahu Kalam times, eclipses, dasha periods (Swiss Ephemeris, Lahiri, whole-sign houses, Vimśottarī).
* **Tradition:** every sentence about *meaning* is generated from classical rules in
  `readings.py`: gochara (transits counted from the natal Moon), tara bala, Chandrashtama,
  house themes and dasha-lord rulerships. It is belief, not science, and never a guaranteed prediction.
* The **score** (0–100) is this app's own summary of those traditional rules (tara + Moon
  position + Chandrashtama + a small slow-planet term, averaged over 7 AM–7 PM). It is not a
  standard almanac number.

## API

`GET /api/reading?mode=day|month|year&date=YYYY-MM-DD|month=YYYY-MM|year=YYYY`
plus `lang=si|en`, birth fields `name, bdate, btime, lat, lon, tz(auto|hours)` and optional
`clat, clon` (where you are today, for sunrise/Rahu Kalam). `GET /api/natal` returns the birth chart.
