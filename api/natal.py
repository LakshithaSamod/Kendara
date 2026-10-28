"""Vercel serverless function: GET /api/natal"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from jyotish.service import ApiHandler  # noqa: E402


class handler(ApiHandler):  # Vercel requires this exact class name
    ROUTE = "/api/natal"
