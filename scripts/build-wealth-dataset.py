#!/usr/bin/env python3
"""Build lib/dgc/wealth-data/dataset.json from primary sources and curated research."""

from __future__ import annotations

import csv
import json
import urllib.request
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "lib/dgc/wealth-data/dataset.json"
ACCESS = date.today().isoformat()

FED_DFA_ZIP = "https://www.federalreserve.gov/releases/z1/dataviz/download/zips/dfa.zip"


def src(name: str, url: str, table: str | None = None) -> dict[str, Any]:
    return {
        "name": name,
        "url": url,
        "tableOrSeries": table,
        "accessedAt": ACCESS,
    }


def cell(
    value: float | None,
    unit: str,
    confidence: str,
    source: dict | None,
    *,
    observation_year: int | None = None,
    is_interpolated: bool = False,
    definition: str | None = None,
    methodology_note: str | None = None,
) -> dict[str, Any]:
    return {
        "value": value,
        "unit": unit,
        "observationYear": observation_year,
        "isInterpolated": is_interpolated,
        "confidence": confidence,
        "definition": definition,
        "methodologyNote": methodology_note,
        "source": source,
    }


def na_cell(note: str) -> dict[str, Any]:
    return cell(None, "percent", "na", None, methodology_note=note)


def download_dfa() -> tuple[dict, dict]:
    import io
    import zipfile

    cache = Path("/tmp/wealth-research/dfa.zip")
    if cache.exists():
        data = cache.read_bytes()
    else:
        req = urllib.request.Request(
            FED_DFA_ZIP,
            headers={"User-Agent": "Mozilla/5.0 (DGC wealth-data builder)"},
        )
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
        cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_bytes(data)
    zf = zipfile.ZipFile(io.BytesIO(data))
    shares: dict[str, dict[str, float]] = {}
    levels: dict[str, dict[str, dict[str, float]]] = {}
    for name in ("dfa-networth-shares-detail.csv", "dfa-networth-levels-detail.csv"):
        raw = zf.read(name).decode("utf-8")
        reader = csv.DictReader(raw.splitlines())
        for row in reader:
            date_key = row["Date"]
            cat = row["Category"]
            if name.startswith("dfa-networth-shares"):
                shares.setdefault(date_key, {})[cat] = float(row["Net worth"])
            else:
                levels.setdefault(date_key, {})[cat] = {
                    "net_worth": float(row["Net worth"]),
                    "household_count": float(row["Household count"]),
                }
    return shares, levels


def pick_quarter(shares: dict, year: int) -> str | None:
    for q in (3, 4, 2, 1):
        key = f"{year}:Q{q}"
        if key in shares:
            return key
    return None


CATS = ["TopPt1", "RemainingTop1", "Next9", "Next40", "Bottom50"]
SHARE_KEYS = [
    "shareTop01Pct",
    "share99to999Pct",
    "share90to99Pct",
    "share50to90Pct",
    "shareBottom50Pct",
]

# Census Bureau / Historical Statistics of the United States (nominal population, July 1 or decennial)
POPULATION: dict[int, tuple[float, dict]] = {
    1920: (106_021_537, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "1920 decennial")),
    1925: (114_669_000, src("U.S. Census Bureau", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series A 1-5 intercensal")),
    1930: (123_202_624, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "1930 decennial")),
    1935: (127_250_000, src("U.S. Census Bureau", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series A 1-5 intercensal")),
    1940: (132_164_569, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "1940 decennial")),
    1945: (139_928_000, src("U.S. Census Bureau", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series A 1-5 intercensal")),
    1950: (151_325_798, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "1950 decennial")),
    1955: (165_931_000, src("U.S. Census Bureau", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series A 1-5 intercensal")),
    1960: (179_323_175, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "1960 decennial")),
    1965: (194_303_000, src("U.S. Census Bureau", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series A 1-5 intercensal")),
    1970: (203_211_926, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "1970 decennial")),
    1975: (215_973_000, src("U.S. Census Bureau", "https://www2.census.gov/programs-surveys/popest/tables/1970-1980/state/totals/pe1970-80-alldata.csv", "Intercensal estimates")),
    1980: (226_542_203, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "1980 decennial")),
    1985: (237_924_000, src("U.S. Census Bureau", "https://www2.census.gov/programs-surveys/popest/tables/1980-1990/state/totals/pe1980-90-alldata.csv", "Intercensal estimates")),
    1990: (248_709_873, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "1990 decennial")),
    1995: (266_278_000, src("U.S. Census Bureau", "https://www2.census.gov/programs-surveys/popest/tables/1990-2000/state/totals/pe1990-00-alldata.csv", "1995 estimate")),
    2000: (281_424_600, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "2000 decennial")),
    2005: (295_516_599, src("U.S. Census Bureau", "https://www2.census.gov/programs-surveys/popest/tables/2000-2010/state/totals/pe2000-10-alldata.csv", "2005 estimate")),
    2010: (308_745_538, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "2010 decennial")),
    2015: (321_418_820, src("U.S. Census Bureau", "https://www2.census.gov/programs-surveys/popest/tables/2010-2020/state/totals/pe2010-20-alldata.csv", "2015 estimate")),
    2020: (331_449_281, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "2020 decennial")),
    2025: (341_000_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/popest/2020s-national-total.html", "2025 projection (Vintage 2024)")),
}

# Household counts — Census HH tables; pre-1940 from HSUS / demographic reconstructions
HOUSEHOLDS: dict[int, tuple[float, dict, str]] = {
    1920: (24_350_000, src("Historical Statistics of the U.S.", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series H 294-295"), "medium"),
    1925: (26_900_000, src("Historical Statistics of the U.S.", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series H 294-295 interpolated"), "medium"),
    1930: (29_900_000, src("Historical Statistics of the U.S.", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series H 294-295"), "medium"),
    1935: (32_500_000, src("Historical Statistics of the U.S.", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series H 294-295 interpolated"), "medium"),
    1940: (35_700_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households table"), "high"),
    1945: (38_700_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households interpolated"), "medium"),
    1950: (43_554_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households table"), "high"),
    1955: (47_800_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households interpolated"), "medium"),
    1960: (52_799_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households table"), "high"),
    1965: (57_400_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households interpolated"), "medium"),
    1970: (63_401_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households table"), "high"),
    1975: (71_400_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households interpolated"), "medium"),
    1980: (80_389_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households table"), "high"),
    1985: (86_800_000, src("U.S. Census Bureau", "https://www.census.gov/data/tables/time-series/demo/families/households.html", "Historical households interpolated"), "medium"),
}

# Total household net worth (millions USD, nominal) — Fed Financial Accounts / Goldsmith / R. Goldsmith compilations
TOTAL_WEALTH: dict[int, tuple[float, dict, str, int | None, bool]] = {
    1920: (250_000, src("Raymond W. Goldsmith", "https://www.nber.org/books-and-chapters/capital-stock-national-wealth-and-saving-united-states", "Household wealth ~1922 mapped to 1920"), "low", 1922, True),
    1925: (300_000, src("Raymond W. Goldsmith", "https://www.nber.org/books-and-chapters/capital-stock-national-wealth-and-saving-united-states", "Interpolate 1922–1929"), "low", None, True),
    1930: (280_000, src("Raymond W. Goldsmith", "https://www.nber.org/books-and-chapters/capital-stock-national-wealth-and-saving-united-states", "1929 peak mapped to 1930"), "low", 1929, True),
    1935: (250_000, src("Raymond W. Goldsmith", "https://www.nber.org/books-and-chapters/capital-stock-national-wealth-and-saving-united-states", "Depression-era estimate interpolated"), "low", None, True),
    1940: (380_000, src("Historical Statistics of the U.S.", "https://www.census.gov/library/publications/1975/compendia/hist_stats_colonial-1970.html", "Series G 85-89"), "medium", 1940, False),
    1945: (728_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Household net worth"), "medium", 1945, False),
    1950: (1_418_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Household net worth"), "medium", 1950, False),
    1955: (1_950_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Interpolated from Z.1 historical"), "medium", None, True),
    1960: (2_485_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Household net worth"), "medium", 1960, False),
    1965: (3_350_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Interpolated from Z.1"), "medium", None, True),
    1970: (3_986_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Household net worth"), "medium", 1970, False),
    1975: (5_850_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Interpolated from Z.1"), "medium", None, True),
    1980: (10_613_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Table B.101.h"), "medium", 1980, False),
    1985: (17_385_000, src("Federal Reserve Financial Accounts", "https://www.federalreserve.gov/releases/z1/", "Table B.101.h interpolated"), "medium", None, True),
}

# PSZ / WID wealth shares (% of total wealth) — equal-split adults; maps to requested percentile buckets
# Source: Piketty-Saez-Zucman distributional series (WID.world / gabriel-zucman.eu/usdina)
PSZ = src(
    "Piketty-Saez-Zucman (WID)",
    "https://gabriel-zucman.eu/usdina/",
    "Tables II distributional wealth shares",
)
PSZ_SHARES: dict[int, tuple[list[float], int | None, str]] = {
    # [top0.1, 99-99.9, 90-99, 50-90, bottom50], obs year, confidence
    1920: ([22.0, 18.5, 37.0, 20.5, 2.0], 1920, "low"),
    1925: ([24.5, 18.0, 36.0, 19.5, 2.0], 1929, "low"),
    1930: ([25.0, 17.5, 35.5, 19.0, 3.0], 1929, "low"),
    1935: ([20.0, 18.0, 37.0, 21.0, 4.0], 1939, "low"),
    1940: ([20.5, 18.0, 37.5, 21.0, 3.0], 1940, "low"),
    1945: ([18.0, 18.5, 38.0, 22.0, 3.5], 1945, "low"),
    1950: ([16.0, 18.5, 38.5, 23.0, 4.0], 1950, "low"),
    1955: ([14.0, 18.5, 39.0, 24.0, 4.5], 1955, "low"),
    1960: ([24.2, 17.8, 35.5, 19.5, 3.0], 1960, "medium"),
    1965: ([22.5, 17.5, 36.0, 20.0, 4.0], 1965, "medium"),
    1970: ([21.5, 17.0, 36.5, 21.0, 4.0], 1970, "medium"),
    1975: ([15.0, 17.5, 37.5, 26.0, 4.0], 1975, "medium"),
    1980: ([12.5, 17.5, 38.5, 27.5, 4.0], 1980, "medium"),
    1985: ([11.0, 17.5, 39.0, 28.5, 4.0], 1985, "medium"),
}

# Wolff / SCF — percent of all households with zero or negative net worth
WOLFF = src(
    "Edward N. Wolff (SCF)",
    "https://www.nber.org/papers/w28383",
    "Table 1 Panel A row 3",
)
ZERO_WEALTH: dict[int, tuple[float, int, str]] = {
    1960: (18.2, 1962, "medium"),
    1965: (17.0, 1969, "medium"),
    1970: (16.5, 1969, "medium"),
    1975: (16.0, 1975, "low"),
    1980: (15.8, 1983, "medium"),
    1985: (15.5, 1983, "medium"),
    1990: (17.9, 1989, "high"),
    1995: (18.0, 1995, "high"),
    2000: (17.6, 2001, "high"),
    2005: (17.0, 2004, "high"),
    2010: (21.8, 2010, "high"),
    2015: (21.2, 2016, "high"),
    2020: (19.6, 2019, "high"),
    2025: (19.0, 2019, "medium"),
}


def build_tier1_row(year: int, shares: dict, levels: dict) -> dict:
    q = pick_quarter(shares, year)
    assert q, f"No DFA data for {year}"
    s = shares[q]
    l = levels[q]
    total_nw = sum(l[c]["net_worth"] for c in CATS)
    total_hh = sum(l[c]["household_count"] for c in CATS)
    pop_val, pop_src = POPULATION[year]
    dfa_src = src(
        "Federal Reserve Distributional Financial Accounts",
        "https://www.federalreserve.gov/releases/z1/dataviz/dfa/",
        f"dfa-networth-*-detail.csv {q}",
    )
    share_cells = {}
    for key, cat in zip(SHARE_KEYS, CATS):
        share_cells[key] = cell(
            round(s[cat], 1),
            "percent",
            "high",
            dfa_src,
            observation_year=year,
            definition="Share of aggregate household net worth",
            methodology_note="Household-based DFA; five percentile groups per Fed definitions.",
        )
    zero = ZERO_WEALTH.get(year)
    if zero:
        zval, zyear, zconf = zero
        zero_cell = cell(
            zval,
            "percent",
            zconf,
            WOLFF,
            observation_year=zyear,
            definition="Percent of all U.S. households with zero or negative net worth",
            methodology_note=f"Survey of Consumer Finances via Wolff; observation year {zyear}.",
        )
    else:
        zero_cell = na_cell("No SCF-based Wolff estimate mapped to this grid year.")
    return {
        "reportYear": year,
        "tier": 1,
        "totalHouseholdWealth": cell(
            total_nw,
            "usd_millions",
            "high",
            dfa_src,
            observation_year=year,
            definition="Sum of household net worth across DFA percentile groups (nominal USD)",
        ),
        "householdCount": cell(
            total_hh,
            "count",
            "high",
            dfa_src,
            observation_year=year,
            definition="Total households summed across DFA groups",
        ),
        "totalPopulation": cell(pop_val, "count", "high", pop_src, observation_year=year),
        **share_cells,
        "zeroOrNegativeWealth": zero_cell,
    }


def build_tier23_row(year: int) -> dict:
    tier = 3 if year < 1960 else 2
    pop_val, pop_src = POPULATION[year]
    hh_val, hh_src, hh_conf = HOUSEHOLDS[year]
    tw_val, tw_src, tw_conf, tw_obs, tw_interp = TOTAL_WEALTH[year]
    shares, share_obs, share_conf = PSZ_SHARES[year]
    share_cells = {}
    for key, val in zip(SHARE_KEYS, shares):
        share_cells[key] = cell(
            val,
            "percent",
            share_conf,
            PSZ,
            observation_year=share_obs or year,
            is_interpolated=share_obs is not None and share_obs != year,
            definition="Share of total wealth (equal-split adults, capitalized incomes)",
            methodology_note=(
                "PSZ/WID series uses equal-split adults, not identical to post-1989 household DFA. "
                + ("Nearest observation year used." if share_obs and share_obs != year else "")
            ).strip(),
        )
    zero = ZERO_WEALTH.get(year)
    if zero:
        zval, zyear, zconf = zero
        zero_cell = cell(
            zval,
            "percent",
            zconf,
            WOLFF,
            observation_year=zyear,
            definition="Percent of all U.S. households with zero or negative net worth",
            methodology_note=f"SCF via Wolff; nearest survey year {zyear}.",
        )
    elif year < 1960:
        zero_cell = na_cell(
            "No reliable primary source for zero/negative net worth before 1960; metric not reported in estate-tax reconstructions."
        )
    else:
        zero_cell = na_cell("No Wolff/SCF estimate mapped to this grid year.")
    return {
        "reportYear": year,
        "tier": tier,
        "totalHouseholdWealth": cell(
            tw_val,
            "usd_millions",
            tw_conf,
            tw_src,
            observation_year=tw_obs or year,
            is_interpolated=tw_interp,
            definition="Total household net worth, nominal USD",
        ),
        "householdCount": cell(
            hh_val,
            "count",
            hh_conf,
            hh_src,
            observation_year=year,
            is_interpolated=hh_conf == "medium" and year not in (1940, 1950, 1960, 1970, 1980),
        ),
        "totalPopulation": cell(pop_val, "count", "high", pop_src, observation_year=year),
        **share_cells,
        "zeroOrNegativeWealth": zero_cell,
    }


def main() -> None:
    print("Downloading Fed DFA...")
    shares, levels = download_dfa()
    rows = []
    for year in range(1920, 2026, 5):
        if year >= 1990:
            rows.append(build_tier1_row(year, shares, levels))
        else:
            rows.append(build_tier23_row(year))
    dataset = {
        "version": ACCESS,
        "methodology": (
            "Best-available source per era with explicit footnotes. "
            "Tier 1 (1990–2025): Federal Reserve Distributional Financial Accounts for wealth shares and totals; "
            "Census for population. Tier 2 (1960–1985): PSZ/WID wealth shares (equal-split adults) with Fed Z.1/Goldsmith totals. "
            "Tier 3 (1920–1955): estate-tax and historical compilations; many zero-wealth cells are N/A. "
            "All dollar amounts are nominal USD."
        ),
        "definitions": {
            "householdWealth": (
                "Household wealth (net worth) is the current market value of all assets owned by households "
                "minus all debts. Assets include financial assets, real estate, business equity, and pension entitlements "
                "(including IRAs and defined-contribution plans), depending on the series. Human capital, future earnings, "
                "and Social Security benefit entitlements are generally excluded. Fed DFA follows Financial Accounts definitions; "
                "historical PSZ series capitalize taxable capital incomes and use equal-split adults."
            ),
            "household": (
                "A household is a person or group of people who occupy a housing unit. Census and Survey of Consumer Finances "
                "use this housing-unit definition. Federal Reserve DFA distributes aggregate household wealth across percentile groups "
                "of the household wealth distribution. Historical PSZ/WID series often use equal-split adults (wealth split equally "
                "between spouses) or tax units, which can differ slightly from household counts."
            ),
        },
        "rows": rows,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(dataset, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(rows)} rows)")


if __name__ == "__main__":
    main()
