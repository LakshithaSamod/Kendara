# Kendara: Sinhala / English Jyotiṣa readings

A web app that gives plain-language traditional Jyotiṣa readings in **Sinhala or English** for
**today**, **any date**, **any month** or **any year**.

**Just double-click `index.html`.** Everything runs inside the browser, so there's no server, no
install and no internet needed (fonts load from Google Fonts when online; otherwise the system
fonts are used).

## Layout

```
index.html, style.css, app.js   the page and its interface
js/engine.js     astronomy: sidereal positions, Lagna, sunrise, eclipses, Vimshottari dasha
js/readings.js   the traditional rules (gochara, tara bala, chandrashtama, dasha lords)
js/simple.js     builds the plain reading from those rules
js/phrases.js    every sentence of the plain reading, English + Sinhala (edit wording here)
js/service.js    puts it all together for a given birth chart and date
vendor/astronomy.min.js   Astronomy Engine 2.1.19 (MIT licence, by Don Cross)
```

## What each view shows

| View | Contents |
|---|---|
| Today / A date | What kind of day it is, best time, Rahu Kalam, sunrise/sunset, what to do and avoid, six life areas (love, work, money, health, mind, home), the bigger picture (Sade Sati, Jupiter), your current Dasha, the next 30 days |
| A month | Calendar coloured by day (tap any day for its reading), best and gentle days, week by week, life areas, sky events |
| A year | 12 month cards (tap for that month), the slow planets' journey through your houses, Dasha changes, life areas, turning points |

Readings come in **Sinhala (default) or English** (switch at the top right) and use plain,
everyday sentences. The technical reasoning (degrees, houses, tara names, chart grid) sits
under **More details**, in English. Nakshatra names stay in English until their Sinhala
spellings are confirmed. Birth details can be edited in the app and are saved only in your browser.
Sri Lanka's 1996–2006 clock changes (+6:30 / +6:00) are handled automatically.

## Accuracy

Method: sidereal zodiac, Lahiri ayanāṁśa, whole-sign houses, mean Rahu, Vimśottarī dasha (the
same method as the rest of this knowledge base). Positions come from Astronomy Engine and are
made sidereal exactly the way the Swiss Ephemeris does it, using a Lahiri curve and a ΔT table
matched to the Swiss Ephemeris.

Checked against the Swiss Ephemeris (pyswisseph 2.10, the knowledge base's reference engine)
at 301 random moments from 1800 to 2400:

| | typical difference | worst |
|---|---|---|
| Sun, planets, Lagna | 1–3″ (arcseconds) | 23″ |
| Moon | 3″ | 21″ |
| Rahu, ayanāṁśa | < 1″ | < 1″ |

0 sign, 0 nakshatra and 0 retrograde mismatches in 2,408 checks. A full side-by-side run of 24
day, month and year readings (both languages) gave identical text, scores and calendars. The only
difference was one event clock time: a slow, near-stationary Venus sign change came out 18 minutes apart.

## Fact vs tradition

* **Fact:** positions, dates, sunrise, Rahu Kalam times, eclipses, dasha periods.
* **Tradition:** every sentence about *meaning* comes from classical rules in `js/readings.js`.
  It is belief, not science, and never a guaranteed prediction.
* The **score** (0–100) is this app's own summary of those rules (tara + Moon position +
  Chandrashtama + a small slow-planet term, averaged over 7 AM–7 PM). It is not a standard almanac number.

## Put it online (optional)

It is a plain static site. Push this folder to GitHub, then either import the repo on
**Vercel** (framework preset "Other", no build settings) or enable **GitHub Pages**
(Settings → Pages → deploy from the `main` branch, root folder).
