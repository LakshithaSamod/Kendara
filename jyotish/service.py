"""
service.py - the JSON API, shared by the Vercel functions (api/*.py) and the
local development server (server.py).
"""

import datetime as dt
import json
import sys
import traceback
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

import swisseph as swe

from . import readings as R
from . import simple as S

# Default profile, used when the browser sends no birth details
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


def api(path, q):
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


def respond(path, query_string):
    """Returns (status_code, json_dict)."""
    try:
        return 200, api(path, parse_qs(query_string))
    except (ValueError, KeyError) as e:
        return 400, {"error": f"Bad input: {e}"}
    except Exception as e:  # noqa: BLE001
        traceback.print_exc()
        return 500, {"error": f"Calculation failed: {e}"}


class ApiHandler(BaseHTTPRequestHandler):
    """Request handler for one API route. Vercel looks for a class named `handler`
    in each api/*.py file; those files subclass this and set ROUTE."""
    ROUTE = None

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), fmt % args))

    def send_body(self, code, body, ctype):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        url = urlparse(self.path)
        code, obj = respond(self.ROUTE or url.path, url.query)
        self.send_body(code, json.dumps(obj), "application/json; charset=utf-8")
