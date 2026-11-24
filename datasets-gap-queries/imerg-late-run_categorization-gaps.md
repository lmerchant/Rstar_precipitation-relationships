# IMERG Late Run: what the research didn't search, by subcategory

- **Dataset:** IMERG Late Run V07 (V07B processing; "hybrid" since March 2026, the V07 algorithm ingesting GPROF V08),
  half-hourly `GPM_3IMERGHHL` (DOI 10.5067/GPM/IMERG/3B-HH-L/07) and daily `GPM_3IMERGDL`
  (DOI 10.5067/GPM/IMERGDL/DAY/07). V08 Late is due no sooner than winter 2026.
- **Categorized:** 2026-11-24 (first pass).
- **Output:** [imerg-late-run_rstar-categories.json](../data-rstar-categories/datasets/imerg-late-run/imerg-late-run_rstar-categories.json),
  built by `scripts/categorize/build_imerg-late-run.py` (107 evidence items).
- **Research used:**
  - `about-datasets/imerg-late-run/`: about-pt1, processing-qc-pt2, formats-people-pt3, funding-pt4, news-pt5,
    inputs-pt6 and the gap run calibration-copies-pt7;
  - `instruments/nasa-satellites` (GPM, the calibrator) and `instruments/noaa-satellites` (S-NPP, NOAA-20/21, POES,
    DMSP, Metop, AMSR2, GOES);
  - for people shared with GPCP (Huffman, Bolvin, Nelkin): GPCP Daily's people-production-pt7;
  - for the AWS S3 integrity statement only: GHCN-Daily's repository-resilience-pt9.
- **Not used:** `instruments/noaa-rain-gauges` (the Late Run reads no gauges, only a climatology of the Final Run's
  GPCC adjustment) and both `archives/noaa-ncei` runs (no source puts an IMERG copy at NCEI).
- **Not available:**
  - **the people half of the pt7 gap query.** The query `imerg-late-run-gaps_Rstar_query_pt7_people-production.md`
    asked about people, contracts, calibration and copies; the rewritten question that ran (2026-11-24) covered only
    calibration, current inputs, alternatives and copies (its answer is headed "Part 7, Run 2"). The user ran one
    run. So P-1 to P-4, D-1's contracts and DIRS-4's contracts were never searched for IMERG;
  - **the NASA GES DISC + PPS A2 repository run** (written, not run), so RRS-2 and RRS-3 have no evidence and RRS-1,
    RRS-4 and RRS-5 are thin.
- **Replaces** the coverage note `imerg-late-run_coverage-gaps.md` (2026-11-23) as the list of open gaps.

## Repositories (the JSON's `dataset` key)

| Repository | Role | Holds |
|---|---|---|
| NASA GES DISC | parent | Half-hourly and daily V07 Late, 1998 to present; on-premises services ended 2026, now Earthdata Cloud only (`gesdisc-cumulus-prod-protected`, AWS us-west-2) |
| NASA PPS | producer site | Near-real-time HDF5 (`jsimpsonhttps`) and IMERG GIS GeoTIFF; keeps Late files until the next version replaces them |

Not repositories: dynamical.org's Zarr on AWS (no DOI), Google Earth Engine (mixes Late with Final), the IRI Data
Library's V06 copy (sunset October 2026), NCAR GDEX (Final Run only), Giovanni, Worldview and the PMM Publisher API
(viewers or 60-day windows). Producer: NASA Goddard (IMERG team, Code 612; PPS, Code 619), and GES DISC is also
Goddard, so `producer_is_repository` is **true** (judgment call below).

## Scores

| Subcategory | Items (for / against / context) | Score | Main reason |
|---|---|---|---|
| P-1 Succession plan | 0 / 2 / 4 | **0** | Detailed, current documentation and a documented hand-over to PPS (against); no succession search was run |
| P-2 Retirement-eligible | 1 / 0 / 2 | NA | Only a low estimate (Huffman about 71–76, from the GPCP run) |
| P-3 Undocumented knowledge | 2 / 2 / 3 | NA | Production code not public; some operating details unwritten vs ATBD and published X-CAL tables |
| P-4 Single point of failure | 1 / 2 / 3 | **0** | Runs in PPS's Real Time system with no manual inspection; work split among organizations |
| D-1 Program defunding | 4 / 0 / 4 | **30** | GPM line $0 after FY2026 pending the Senior Review; FY2027 Earth Science and ESDS cuts pending; DAACs to be replaced |
| D-2 Storage single point | 2 / 1 / 2 | NA | GES DISC cloud-only in one region and only two NASA copies vs hosted at both PPS and GES DISC |
| D-3 Access fragile | 3 / 0 / 4 | **20** | GES DISC's on-premises services and subsetters gone; DAAC consolidation; ESDS cut pending |
| D-4 Format obsolescence | 0 / 1 / 3 | **0** | Open HDF5, netCDF and GeoTIFF with a public file spec |
| D-5 Political sensitivity | 0 / 1 / 2 | **0** | No news names IMERG, PPS, GES DISC or the team; GPM on no termination list read |
| DIRS-1 Calibration | 5 / 1 / 3 | NA | GMI the single reference, GPM funding, GMI anomalies, MetOp-C error, climatological CORRA vs X-CAL in-house and current |
| DIRS-2 Observation platforms | 7 / 0 / 3 | **25** | SSMIS, S-NPP ATMS, NOAA-18/19 MHS ended; AMSR2 past life; GPM, Metop-B, Meteosat-9 near end |
| DIRS-3 Upstream supply chain | 6 / 0 / 4 | **20** | Near-real-time feeds broke; CORRA frozen to climatology; Autosnow change; IR outage |
| DIRS-4 External processing | 3 / 1 / 1 | NA | GPROF (CSU), PDIR (CHRS), GMU job-control software, CPC IR vs common code in PPS's own system |
| DIRS-5 No alternative supplier | 3 / 4 / 1 | NA | No backup calibrator, PMM underfunded, no IR substitute vs MWI, overlapping sensors, GEOS FP fallback, other NRT datasets |
| RRS-1 Geographic redundancy | 1 / 2 / 2 | **0** | Only two NASA copies, none verified; GES DISC in one cloud region (the "for" is a low inference) |
| RRS-2 Checksum verification | 0 / 0 / 1 | NA | Not searched (NASA A2 not run) |
| RRS-3 Disaster recovery plan | 0 / 0 / 0 | NA | Not searched (NASA A2 not run) |
| RRS-4 Stable funding | 1 / 3 / 2 | NA | ESDS cut, DAAC consolidation, GPM line $0 vs Congress holding NASA's funding |
| RRS-5 Track record | 3 / 0 / 1 | **15** | Through the 2025 shutdown, Goddard staff losses and the 2026 cloud move with no data loss reported |

Totals: P NA, D NA, DIRS NA, RRS NA, so R* is NA. 9 of 19 subcategories are NA.

## Judgment calls to double-check

- **P-1 = 0 and P-4 = 0 rest on items that would change once the people run is done.** P-1's only counted items are
  documentation (the ATBD and the hand-over to PPS), as GPCP's were; GPCP's P-1 went NA only because its pt7 searched
  for a plan and found none. P-4's are the ATBD's "executed in the PPS Real Time processing system" and the split
  among organizations (both moderate). A targeted search finding no succession plan, or a named single PPS operator,
  would make each NA.
- **Huffman's retirement estimate** comes from GPCP's run (same person). It is low, so it doesn't set P-2.
- **`producer_is_repository` = true.** The producer is NASA Goddard (PPS runs the code) and both repositories are
  Goddard units, so the site's "same organization" sentence shows. If you'd rather treat PPS and GES DISC as separate
  organizations, set it to false in the script.
- **PPS as a repository** ("producer site"), as the decisions doc's example says. Its copy lasts only until V08 Late
  replaces V07 (context in RRS-1).
- **GEOS FP running** is context in DIRS-3, not "against" (a working feed doesn't show the others safe; GPCP filed
  CPC's IR the same way). As "against" it would make DIRS-3 NA.
- **DIRS-1's "against" item** is X-CAL being done in-house at Goddard and current (v1.11, Aug 2026). DIRS-1 asks about
  an *external* calibration service; GMI as the single reference is "for". Dropping either flips the score.
- **The GPM line in D-1 and RRS-4.** NASA's 2023 Senior Review funded GPM "to support the near real-time processing
  system", so the $0 after FY2026 is read as bearing on PPS's near-real-time system (RRS-4 "against" for PPS).
- **D-4 = 0:** login and licence failures are filed as access, not format (as GPCP did), unlike GHCN-Daily's FAIR item.
- **RRS-5 = 15** rests on no data loss being reported through the 2025 shutdown and the 2026 cloud move (moderate,
  absence of reports). The NASA A2 run may change it.
- **D-1's HQ slide** ("PMM" science team eliminated) is low because "PMM" may mean the planned mission.

## What the research never searched, by subcategory

**For the next people run (P-1 to P-4, D-1, DIRS-4).** These were in the pt7 query but not in the run:
- **P-1:** a written succession or knowledge-transfer plan for the IMERG team (GSFC Code 612) or PPS (Code 619); team
  sizes; departures since 2024 (compare GES DISC and PPS staff pages on the Wayback Machine); why Christopher Kidd
  left the ATBD author list between 2023 and 2026.
- **P-2:** ORCID iD, earliest publication year, first TRMM/GPM year and estimated age for Robert Joyce, Jackson Tan,
  Owen Kelley, Daniel Watters, B. Jason West and Erich Stocker, and whoever runs the Late Run day to day at PPS; FERS
  eligibility for the federal staff (Huffman, Stocker, Kelley if federal). Huffman, Bolvin and Nelkin are done in
  GPCP's pt7.
- **P-3:** whether the IMERG production code is shared on request (PPS help desk); PPS runbooks; the SPEEDe code
  statement (Tan et al. 2024, GRL).
- **P-4:** who runs the Late Run day to day at PPS and who is the backup; whether Robert Joyce is still active.
- **D-1 and P-4:** which contract pays the SSAI/STC IMERG staff (ATMOS 80GSFC26D0002 is the candidate); PPS's
  funding route and operations contract.
- **DIRS-4:** the GMU CEOSR contract for PPS job-control software; where PDIR-Now is computed for IMERG; whether V08
  drops PDIR-Now for GPROF-IR.

**For the NASA GES DISC + PPS A2 run (RRS, D-2, D-3):**
- **RRS-1 / D-2:** how many copies GES DISC keeps and in which AWS regions; where PPS stores its copy; whether any copy
  is verified against another.
- **RRS-2:** fixity or checksum practice at GES DISC, Earthdata Cloud and PPS, and how often.
- **RRS-3:** disaster recovery or contingency plans at ESDIS, GES DISC and PPS, and when they were last tested.
- **RRS-4:** PPS's budget line; GES DISC's place in the DAAC consolidation; ESDIS Next's award.
- **RRS-5:** holdings and latency at GES DISC and PPS before and after the 2025 shutdown and the 2026 migration.

**Other open items (from the runs' own gaps):**
- **DIRS-2 / DIRS-3:** what PPS's near-real-time stream ingests after SSMIS (30 Sep 2026), AMSR2 (2 Sep 2026) and
  S-NPP ATMS (2 Nov 2026) ended; whether the Late Run uses AMSR3; which Autosnow version it reads; whether the
  near-real-time MetOp-C GPROF has the calibration-file error; Meteosat-12 in CPC's merged IR. **By hand:** the input
  lists in Late Run file headers (free PPS sign-up) settle most of these.
- **DIRS-1:** X-CAL's funding; a backup reference if GMI or DPR stopped.
- **DIRS-5:** model substitutes for GEOS FP; GSMaP_NRT's status (JAXA pages refused).
- **D-5:** mission-list articles not read (Science, CNN, SpaceNews); executive orders not searched.
- **D-4:** CF standard names inside the files.
- **By hand (hosts refused):** JAXA's GCOM-W pages (AMSR2 end), EUMETSAT's IODC page (Meteosat-9) and Metop-B end of
  life; the 2026 Senior Review result for GPM when posted.

## Conflicts between runs

- **NOAA-18/19 MHS:** pt6 counts them as Late Run sounders lost in 2025; pt1's 2023 sensor table says NOAA-19 MHS
  ended as an input in September 2020. Both kept in DIRS-2.
- **L1C ATBD version:** pt2 cites v1.6 (2016), pt3 v1.9 (2022); pt7 settles it: v1.11 (August 2026) is current.
- **GEOS FP:** pt6's forum snippet said "GMAO-FP streams" ended 31 May 2026; pt7 shows GEOS FP running and the end was
  FP-IT.
- **Latency:** 12 h (ATBD Table 3), about 14 h (ATBD text, GES DISC), "almost 13 hr" (Tech Doc), 14–15 h (README.GIS).
  Not used for a score.
- **Licence:** CMR names none, NASA policy says CC0, the AWS Registry says CC BY 4.0. Context in D-4.
- **"PMM" on the May 2026 HQ slide:** the science team or the planned mission. Low in D-1.
