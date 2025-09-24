from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional

import requests

from ..core.config import get_settings

EVDS_BASE_URL = "https://evds2.tcmb.gov.tr/service/evds/series={series}&startDate={start}&endDate={end}&type=json"
_CACHE_TTL = timedelta(hours=1)


def _format_date(date: datetime) -> str:
    return date.strftime("%Y-%m-%d")


@dataclass
class _CacheEntry:
    value: float
    fetched_at: datetime


class PriceFetcher:
    def __init__(self) -> None:
        self._gold_cache: Optional[_CacheEntry] = None

    def _fetch_tcmb_gram_gold_try(self) -> float:
        settings = get_settings()
        if not settings.tcmb_api_key:
            raise ValueError("SFT_TCMB_API_KEY environment variable must be set")

        series_candidates: list[str] = []
        if settings.tcmb_gold_series:
            series_candidates.append(settings.tcmb_gold_series)

        if not series_candidates:
            raise ValueError("SFT_TCMB_GOLD_SERIES must be configured to fetch gold prices")

        headers = {"X-evds-key": settings.tcmb_api_key}
        today = datetime.utcnow()
        start = _format_date(today)
        end = _format_date(today)

        last_error: Optional[Exception] = None
        for series in series_candidates:
            url = EVDS_BASE_URL.format(series=series, start=start, end=end)
            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                payload = response.json()
                items = payload.get("items") or []
                if not items:
                    continue
                item = items[0]
                for key, value in item.items():
                    if key.lower() == "date":
                        continue
                    try:
                        return float(value)
                    except (TypeError, ValueError):
                        continue
            except Exception as exc:  # pragma: no cover - network error path
                last_error = exc
                continue
        if last_error:
            raise last_error
        raise RuntimeError("Unable to fetch gold price from TCMB")

    def get_gold_price(self) -> float:
        if self._gold_cache and (datetime.utcnow() - self._gold_cache.fetched_at) < _CACHE_TTL:
            return self._gold_cache.value
        price = self._fetch_tcmb_gram_gold_try()
        self._gold_cache = _CacheEntry(value=price, fetched_at=datetime.utcnow())
        return price

    def calculate_gold_value(self, grams: float) -> float:
        return grams * self.get_gold_price()


price_fetcher = PriceFetcher()
