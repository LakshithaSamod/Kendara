#!/usr/bin/env python3
"""
server.py - local web app for traditional Jyotisha readings.

    python3 server.py            # then open http://127.0.0.1:8765

Standard library only (plus pyswisseph, already used by the engine).
Binds to 127.0.0.1 so it is only reachable from this computer.
"""

import datetime as dt
import json
import mimetypes
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import swisseph as swe

import readings as R
import simple as S

HERE = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(HERE, "static")
PORT = int(os.environ.get("PORT", "8765"))

# Default profile: the user's own birth data (see ../user/birth-chart.md)
DEFAULT = dict(name="Lakshitha", bdate="1997-06-03", btime="02:52",
               lat="7.47", lon="80.04", tz="auto", place="Kuliyapitiya")


def _get(q, key):
    v = q.get(key, [""])[0].strip()
    return v or DEFAULT.get(key, "")


def build_natal(q):
    d = dt.date.fromisoformat(_get(q, "bdate"))
    hh, mm = (int(x) for x in _get(q, "btime").split(":")[:2])
    lat, lon = float(_get(q, "lat")), float(_get(q, "lon"))
    if not (-90 <= lat <= 90 and -180 <= lon <= 180 and 0 <= hh < 24 and 0 <= mm < 60):
        raise ValueError("birth time or coordinates out of range")
    tz = _get(q, "tz")
    tz = R.sri_lanka_offset(d.year, d.month, d.day, hh, mm) if tz == "auto" else float(tz)
    return R.Natal(_get(q, "name"), d, hh, mm, lat, lon, tz)


def check_year(y):
    if not 1800 <= y <= 2400:
        raise ValueError("please choose a year between 1800 and 2400")


def now_jd():
    n = dt.datetime.now(dt.timezone.utc)
    return swe.julday(n.year, n.month, n.day, n.hour + n.minute / 60 + n.second / 3600)


def tz_now_for(q):
    v = q.get("tz_now", [""])[0].strip()
    return float(v) if v else 5.5  # Sri Lanka civil time since 2006


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), fmt % args))

    def _send(self, code, body, ctype):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _json(self, code, obj):
        self._send(code, json.dumps(obj), "application/json; charset=utf-8")

    def do_GET(self):
        url = urlparse(self.path)
        q = parse_qs(url.query)
        if url.path.startswith("/api/"):
            try:
                self._json(200, self.api(url.path, q))
            except (ValueError, KeyError) as e:
                self._json(400, {"error": f"Bad input: {e}"})
            except Exception as e:  # noqa: BLE001
                traceback.print_exc()
                self._json(500, {"error": f"Calculation failed: {e}"})
            return
        self.static(url.path)

    def api(self, path, q):
        natal = build_natal(q)
        tz_now = tz_now_for(q)
        lat = float(q.get("clat", [str(natal.lat)])[0] or natal.lat)
        lon = float(q.get("clon", [str(natal.lon)])[0] or natal.lon)
        if path == "/api/natal":
            return {"natal": natal.summary(), "defaults": DEFAULT}
        if path == "/api/reading":
            mode = q.get("mode", ["day"])[0]
            today_local = (dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=tz_now)).date()
            if mode == "day":
                d = q.get("date", [""])[0]
                d = dt.date.fromisoformat(d) if d else today_local
                check_year(d.year)
                out = R.day_reading(natal, d, tz_now, lat, lon, now_jd())
            elif mode == "month":
                ym = q.get("month", [""])[0] or today_local.strftime("%Y-%m")
                y, m = (int(x) for x in ym.split("-"))
                if not 1 <= m <= 12:
                    raise ValueError("month must be 1-12")
                check_year(y)
                out = R.month_reading(natal, y, m, tz_now, lat, lon)
            elif mode == "year":
                y = int(q.get("year", [""])[0] or today_local.year)
                check_year(y)
                out = R.year_reading(natal, y, tz_now, lat, lon)
            else:
                raise ValueError("mode must be day, month or year")
            lang = q.get("lang", ["en"])[0]
            if lang not in ("en", "si"):
                raise ValueError("lang must be en or si")
            builder = {"day": S.day, "month": S.month, "year": S.year}[out["mode"]]
            out["simple"] = builder(out, natal, tz_now, lang)
            out["natal"] = natal.summary()
            out["natal_simple"] = S.natal_simple(out["natal"], lang)
            out["lang"] = lang
            return out
        raise KeyError(path)

    def static(self, path):
        rel = "index.html" if path in ("", "/") else path.lstrip("/")
        full = os.path.realpath(os.path.join(STATIC, rel))
        if not full.startswith(os.path.realpath(STATIC) + os.sep) or not os.path.isfile(full):
            self._send(404, "Not found", "text/plain; charset=utf-8")
            return
        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript",):
            ctype += "; charset=utf-8"
        with open(full, "rb") as f:
            self._send(200, f.read(), ctype)


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Jyotisha readings running at http://127.0.0.1:{PORT}  (Ctrl+C to stop)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
