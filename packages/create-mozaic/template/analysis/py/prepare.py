"""Prepare data for the charts.

Reads raw files from data/raw/ and writes tidy, long-format CSV to
data/processed/. Run from the project root: uv run analysis/py/prepare.py
Uses the standard library only; add pandas/polars to pyproject.toml if needed.
"""

import csv
from pathlib import Path

OUT = Path("data/processed")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Replace this with your own wrangling. It writes the example dataset.
    start = {"North": 42, "South": 35, "Capital": 55}
    growth = {"North": 1.6, "South": 0.95, "Capital": 3.9}
    dip_2020 = {"North": 4, "South": 3, "Capital": 7}
    rows = [
        {
            "year": year,
            "region": region,
            "value": round(start[region] + growth[region] * (year - 2015) - (dip_2020[region] if year == 2020 else 0)),
        }
        for region in start
        for year in range(2015, 2025)
    ]
    with (OUT / "example.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["year", "region", "value"], lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows to {OUT / 'example.csv'}")


if __name__ == "__main__":
    main()
