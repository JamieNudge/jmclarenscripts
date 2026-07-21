# US Household Wealth — Definitions

## What counts as household wealth?

Household wealth (net worth) is the current market value of all assets owned by households minus all debts. Following national accounts standards, assets include non-financial assets (such as owner-occupied housing and consumer durables, depending on the series), financial assets (deposits, bonds, equities, mutual funds), and pension entitlements held in individual retirement accounts and defined-contribution plans.

Human capital (expected future earnings from work), Social Security benefit entitlements, Medicare, and other government transfer promises are generally **not** included in official wealth measures, though some research series optionally include pension claims beyond account balances.

**Series differences matter:** The Federal Reserve Distributional Financial Accounts (1990 onward) follow Financial Accounts of the United States definitions for households. Historical Piketty–Saez–Zucman (PSZ) estimates capitalize taxable capital incomes and use equal-split adults; pre-1960 top shares often rely on estate-tax reconstructions.

All dollar totals in this dataset are **nominal USD** (not inflation-adjusted).

## What counts as a household?

A **household** is a person or group of people who occupy a housing unit. The U.S. Census Bureau and Survey of Consumer Finances use this housing-unit definition: a householder plus any related or unrelated people sharing the unit.

The Federal Reserve DFA distributes aggregate household net worth across percentile groups of the **household** wealth distribution. Historical PSZ/WID series often use **equal-split adults** (wealth split equally between spouses in a couple) or **tax units**, which can differ slightly from Census household counts and share levels.

## Percentile buckets in this dataset

| Bucket | Population share |
|--------|------------------|
| Top 0.1% | Wealthiest 0.1% |
| 99–99.9% | Next 0.9% below the top 0.1% |
| 90–99% | Next 9% |
| 50–90% | Next 40% |
| Bottom 50% | Lower half |

Shares are expressed as **percent of total aggregate household (or adult) net worth** in the series cited for each year.

## Zero or negative wealth

Where available, this field reports the **percent of all U.S. households** with zero or negative net worth, from Edward Wolff's analysis of the Survey of Consumer Finances (NBER Working Paper 28383, Table 1). Survey years are mapped to the nearest fifth-year grid point and flagged with the actual observation year. Pre-1960 values are not available from primary sources and are marked N/A.

## Methodology tiers

- **Tier 1 (1990–2025):** Fed DFA + Census — highest confidence; every value reproducible from the Fed's raw CSV download.
- **Tier 2 (1960–1985):** Piketty–Saez–Zucman appendix tables (equal-split adults) for shares and totals + Census HH-1 for households — medium confidence.
- **Tier 3 (1920–1955):** PSZ top-decile shares and totals only. The bottom-50% / 50–90% split and zero-wealth cells are **N/A** because no primary source reports them for these years.

Every populated cell is reproducible from a cited, downloadable source file (see the Sources section of the data browser). Cells that cannot be substantiated are shown as N/A rather than estimated. See the methodology note on each cell for observation year, interpolation, and source links.
