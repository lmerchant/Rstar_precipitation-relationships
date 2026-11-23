# IMERG Late Run: what the research didn't search, by subcategory

- **Dataset:** IMERG Late Run, version V07 (V08 pending), from NASA's Precipitation Processing System (PPS), archived
  at NASA GES DISC.
- **Checked:** 2026-11-23, by a coverage check of the six IMERG runs and the NASA and NOAA satellite runs, against the
  19 subcategories. **Not a categorization:** nothing is in `data-rstar-categories/` yet (and there is no
  `imerg-late-run/` folder). Categorize once the gap runs below come back.
- **Runs read:** `2026-11-20_imerg-late-run-about-pt1`, `2026-11-21_imerg-late-run-processing-qc-pt2`,
  `2026-11-21_imerg-late-run-formats-people-pt3`, `2026-11-21_imerg-late-run-funding-pt4`,
  `2026-11-21_imerg-late-run-news-pt5`, `2026-11-21_imerg-late-run-inputs-pt6` (in
  `Rstar_query_results/web_search_results/`). Pt6 isn't copied into `data-rstar-query-results/` yet.

## Hosts

| Host | Role | Repository run |
|---|---|---|
| NASA GES DISC (Earthdata Cloud, AWS us-west-2) | Archive of record; on-premises services ended in 2026 | NASA A2 written; no A1 (NASA budget is in pt4 and pt5) |
| NASA PPS (`jsimpsonhttps.pps.eosdis.nasa.gov`, IMERG GIS) | Producer's own near-real-time site; keeps Late files until the next version | NASA A2 written |
| dynamical.org Zarr (`s3://dynamical-nasa-imerg`) | Independent third-party copy, no DOI | Copies only: checked in pt7 |
| Google Earth Engine (`NASA/GPM_L3/IMERG_V07`) | Redistributor; mixes Late with Final | Copies only: checked in pt7 |

## Summary

| Subcategory | Coverage | What's missing | Filled by |
|---|---|---|---|
| P-1 Succession plan | Partly | Any succession plan; team sizes; PPS roster | pt7 |
| P-2 Retirement-eligible | **Not searched** | ORCID iDs, earliest publication years, ages | pt7 |
| P-3 Undocumented knowledge | Partly | PPS runbooks; whether the code is shared on request; X-CAL tables | pt7 |
| P-4 Single point of failure | Partly | Who runs the Late Run day to day at PPS; departures since 2024 | pt7 |
| D-1 Program defunding | Covered | PPS funding route; the contract paying SSAI's IMERG staff | pt7 |
| D-2 Storage single point | Partly | PPS storage and failover; Earthdata Cloud single-region risk | NASA A2 |
| D-3 Access fragile | Partly | PPS distribution funding and staff; dynamical.org funding; Earthdata Login | NASA A2, pt7 |
| D-4 Format obsolescence | Covered | CF standard names (minor) | — |
| D-5 Political sensitivity | Partly | Executive orders not searched; some mission lists unread (minor) | — |
| DIRS-1 Calibration | Partly (thin) | Who maintains X-CAL, its funding and versions; the L1C ATBD version conflict; calibration after GPM | pt7 |
| DIRS-2 Observation platforms | Covered | What PPS's near-real-time stream ingests now (watch item) | — |
| DIRS-3 Upstream supply chain | Covered | JMA forecast and NOAA Autosnow inputs | pt7 |
| DIRS-4 External processing | Partly | GMU CEOSR contract; where PDIR-Now is computed | pt7 |
| DIRS-5 No alternative supplier | Partly | Substitutes for CPC IR and GEOS FP; substitutes for the Late Run | pt7 |
| RRS-1 Geographic redundancy | Partly | Whether any copy is verified at a separate site now that GES DISC is cloud-only | NASA A2, pt7 |
| RRS-2 Checksum verification | **Not searched** | GES DISC, PPS, Earthdata Cloud | NASA A2 |
| RRS-3 Disaster recovery plan | **Not searched** | ESDIS, GES DISC, PPS | NASA A2 |
| RRS-4 Stable funding | Covered (GES DISC); partly (PPS) | PPS budget line; dynamical.org sustainability | pt7 |
| RRS-5 Track record | Partly | Holdings and latency before and after the 2025 shutdown and the 2026 migration | NASA A2 |

## Notes

- **Already settled (the gap runs shouldn't search them again):** products, DOIs, V07B status and V08 timing; how Late
  differs from Early and Final; no QC flag; FAIR ratings and the licence conflict; NASA budget lines and the continuing
  resolution to December 11, 2026; NASA and Goddard workforce figures; no news ties cuts to IMERG, PPS or GES DISC; the
  status of every satellite input; the GPM successor picture; GES DISC's cloud migration dates.
- **Inference:** with GES DISC's on-premises services retired, its on-premises and cloud copies may no longer count as
  two independent sites. The NASA A2 run asks.
- **Shared with PERSIANN-CDR:** UC Irvine's CHRS supplies the PDIR-Now method. PERSIANN-CDR's pt7 looks up the CHRS
  people.
