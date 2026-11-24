# GPCP Daily: what the research didn't search, by subcategory

- **Dataset:** GPCP Daily, two families: the 1° One-Degree Daily (1DD V1.3, NOAA CDR 01B-35 at NCEI, DOI
  10.7289/V5RX998Z) and the 0.5° V3.x Daily (V3.2 and V3.3 at NASA GES DISC; V3.3 also an NCEI CDR, C01726).
- **Categorized:** 2026-11-24 (first pass).
- **Output:** [gpcp-daily_rstar-categories.json](../data-rstar-categories/datasets/gpcp-daily/gpcp-daily_rstar-categories.json),
  built by `scripts/categorize/build_gpcp-daily.py` (102 evidence items).
- **Research used:**
  - `about-datasets/gpcp-daily/`: about-pt1, qc-formats-pt2, people-pt3, funding-news-pt4, inputs-pt5,
    satellites-pt6 and the gap run people-production-pt7;
  - `archives/noaa-ncei/`: the A1 threats run and the A2 resilience run (which covers GPCP Daily by name);
  - `instruments/nasa-satellites` and `instruments/noaa-satellites` (GPM, Aqua, DMSP, POES, Suomi NPP, GOES);
  - for NCEI-wide and NODD facts only: GHCN-Daily's repository-pt7 and repository-resilience-pt9.
- **Not used:** `instruments/noaa-rain-gauges` (GPCP's gauges come only through DWD's GPCC analysis, and no run ties
  US gauge networks to it) and the other GHCN-Daily runs.
- **Not available:** no repository run for NASA GES DISC, NCAR GDEX or Copernicus CDS. The NASA GES DISC + PPS A2
  query is written but not run (see `supplemental-queries-run-sheet.md`).
- **Replaces** the coverage note `gpcp-daily_coverage-gaps.md` (2026-11-23), which listed what the gap runs should fill.

## Repositories (the JSON's `dataset` key)

| Repository | Role | Holds |
|---|---|---|
| NOAA NCEI | parent | 1DD V1.3 (archive of record); V3.3 CDR in its `climatedatarecords` bucket |
| NASA GES DISC | parent | V3.2, V3.3 (role "ARCHIVER" in CMR) |
| AWS and Google Cloud (NODD) | child | NCEI's copies; version not confirmed |
| NSF NCAR GDEX | child | V1.3 to 2024-11, V3.2 |
| Copernicus CDS | child | v1.3 to 2024-03, V3.2, V3.3 |

Not repositories: Google Earth Engine (reformatted); obs4MIPs/ESGF (not confirmed). Producer: UMD/ESSIC (1DD V1.3 and
NCEI's V3.3 CDR) and NASA Goddard under MEaSUREs (V3.x), so `producer_is_repository` is false.

## Scores

| Subcategory | Items (for / against / context) | Score | Main reason |
|---|---|---|---|
| P-1 Succession plan | 1 / 2 / 4 | NA | No plan found (for) vs V1.3's CDR handover package and V3.3's ATBD (against) |
| P-2 Retirement-eligible | 2 / 1 / 3 | NA | Only estimates (low): Huffman likely eligible now; Adler about 80 |
| P-3 Undocumented knowledge | 1 / 3 / 1 | NA | V3.x code not published (for) vs V1.3 code public and V3.3 ATBD (against) |
| P-4 Single point of failure | 1 / 1 / 3 | NA | Huffman sole ATBD reviser and only federal employee vs three people on Goddard production |
| D-1 Program defunding | 3 / 2 / 5 | NA | Pending FY2027 cuts to NCEI and NASA ESDS vs MEaSUREs and CISESS awards running to 2028–2029 |
| D-2 Storage single point | 2 / 2 / 1 | NA | NCEI copies in Asheville only, single cloud region vs several organizations serving it |
| D-3 Access fragile | 6 / 0 / 1 | **20** | NCEI access outage (Nov 2026), pending NCEI cut, NODD with no term, DAAC consolidation, GDEX wind-down |
| D-4 Format obsolescence | 0 / 1 / 2 | **0** | Open CF netCDF-4 on every route |
| D-5 Political sensitivity | 0 / 1 / 2 | **0** | About 40 news searches found nothing naming GPCP |
| DIRS-1 Calibration | 3 / 0 / 1 | **25** | 1DD calibrated to F17 SSMIS alone; GridSat's HIRS calibration ended in 2024; IMERG anchored to GPM |
| DIRS-2 Observation platforms | 4 / 0 / 3 | **25** | DMSP SSMIS, Aqua AIRS, lost IMERG microwave satellites, GPM's unfunded extension |
| DIRS-3 Upstream supply chain | 5 / 0 / 2 | **20** | IMERG V07 Final ended, V08 late; GridSat pause; SSMIS feed undocumented; AIRS |
| DIRS-4 External processing | 2 / 1 / 2 | NA | CPC makes 1DD's IR histograms vs producers compute on their own workstations |
| DIRS-5 No alternative supplier | 2 / 1 / 1 | NA | 1DD has one sensor of each kind vs IMERG's overlapping constellation for V3.x |
| RRS-1 Geographic redundancy | 1 / 4 / 1 | NA | Copies at independent organizations vs none verified, NCEI's in Asheville, stale copies |
| RRS-2 Checksum verification | 0 / 2 / 1 | **0** | Checksums only at ingest and on order (DSMR-00163, CoreTrustSeal) |
| RRS-3 Disaster recovery plan | 0 / 1 / 1 | **0** | NCCF can't test at alternate sites; NCEI's plan not shareable |
| RRS-4 Stable funding | 1 / 5 / 0 | NA | FY2026 enacted vs pending FY2027 cuts and no-term cloud copies |
| RRS-5 Track record | 3 / 2 / 2 | NA | Helene and 2015 merger without reported loss vs 8% backlog unaccounted, 27 products retired |

People, data and repository totals are NA, so R* is NA (11 of 19 subcategories NA).

## Judgment calls to double-check

- **D-3 = 20 rests on repository facts** (NCEI's November 2026 outage, NODD contracts, DAAC consolidation, GDEX). None
  names GPCP; under the rules repository facts count in D-3.
- **D-5 = 0** comes from one moderate "against" item: a search that found nothing. GHCN-Daily had a source tying it to
  political action; GPCP has none.
- **DIRS items reached through IMERG** (GPM, POES, S-NPP, AMSR2) are counted as "for": IMERG is on V3.x's input list
  and pt6 lists those satellites as GPCP's. They were given moderate rather than high confidence.
- **DIRS-4:** CPC's GPCP IR histograms are filed as outside processing ("for"), not as a data feed (DIRS-3).
- **D-4:** the GES DISC and CDS login and licence gaps were filed as context (access, not format).
- **P-4:** "three people on Goddard production" was filed as "against", which turns the run's "P-4 supported for
  V3.x" into NA.
- **GDEX and CDS as child repositories:** both serve the original netCDF with metadata, so they count.
- **Two parents:** NCEI for V1.3 and GES DISC for V3.x.
- **Point values:** the scorer reads `docs/scoring/how_to_score_rstar.md`, which gives DIRS-2 25, P-3 25 and DIRS-4 15;
  the decisions doc's table says 20, 20 and 20.

## What the research never searched, by subcategory

### People risk
- **P-1:** a written plan at Goddard, UMD or Arizona; the team's size. *Search:* "GPCP team" staff; NASA Code 612
  workforce plan; MEaSUREs project management plan.
- **P-2:** real ages and service dates (not public). Huffman's federal start date from a second source.
- **P-3:** whether V3.x code is shared on request; the contents of the 2017 tarball. *Ask:* Huffman or
  gpcp_contacts@noaa.gov.
- **P-4:** who computes each version each month; who backs up Huffman; which contract pays Bolvin and Nelkin.

### Data risk
- **D-1:** Behrangi's MEaSUREs award number and end date (USAspending under the University of Arizona; NSPIRES);
  GPCP's share of CISESS; the FY2027 outcome.
- **D-2:** GES DISC's storage and backup; NCEI's AWS regions after the move.
- **D-3:** GES DISC and CDS funding and staff; NODD contract end dates.
- **D-4:** which version the NODD buckets hold.
- **D-5:** any data rescue snapshot of GPCP Daily.

### Dependent infrastructure resilience
- **DIRS-1:** which SSMIS feed calibrates 1DD now; IMERG's calibration plan after GPM.
- **DIRS-2:** DMSP data to NOAA after September 30, 2026 (a CLASS notice seen only as a search summary); Aqua's real
  end-of-science date.
- **DIRS-3:** the V08 transition and V3.3's next extension; NCEI's preliminary monthly feed.
- **DIRS-4:** the machines that run each version; whether CPC still makes the IR histograms.
- **DIRS-5:** substitute datasets for GPCP Daily (never searched); a 1DD contingency if F17 or AIRS stops.

### Repository resilience
- **All five, for GES DISC, GDEX and CDS:** not searched. Run the NASA GES DISC + PPS A2 query; GDEX and CDS are
  copies and may not need a run of their own.
- **RRS-1:** copy count and regions after NCEI's move; whether NODD copies are verified.
- **RRS-2:** NCEI's SOP 60-6-015 (not public).
- **RRS-3:** NCEI's contingency-plan test results (FOIA).
- **RRS-4:** NCEI's and NASA's FY2026 spend plans.
- **RRS-5:** a final Helene loss count; whether the 2026 migration delays GPCP Daily.

## Conflicts between runs

- **Who computes NCEI's V3.3 copy:** UMD (NCEI metadata, likely carried over from V1.3) or Goddard (Huffman's bio).
- **Who runs 1DD V1.3:** UMD (NCEI) or Huffman ("Produce ... One-Degree Daily", his job line).
- **V3.3's pause month:** March 2024 (release notes) or September 2024 (catalog); both out of date.
- **Aqua's end:** August 26, 2026 (2025 deck), still operating October 30, 2026, power to September 2027.
- **Bolvin and Nelkin's employer:** STC (GSFC pages) or SSAI (NCEI metadata, EGU26 abstract).
- **MEaSUREs award length:** "5 more years" from 2023, "(2017-2028)", against the unenacted FY2026 plan to end
  projects by CY2026.
