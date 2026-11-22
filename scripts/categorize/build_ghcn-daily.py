"""Build the GHCN-Daily R* categorization JSON (second pass, 2026-11-22).

Hand-sorted evidence from every answer file in data-rstar-query-results/ that bears on
GHCN-Daily: the six about-datasets/ghcn-daily runs, archives/noaa-ncei and
instruments/noaa-rain-gauges. Markdown links [label](url) in the text become <a> tags.

Run:  python3 scripts/categorize/build_ghcn-daily.py
"""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data-rstar-categories" / "datasets" / "ghcn-daily" / "ghcn-daily_rstar-categories.json"

# data-source values: the research run folder names
PT1 = "2026-11-19_ghcn-daily-about-pt1"
PT2 = "2026-11-19_ghcn-daily-about-pt2"
PT3C = "2026-11-19_ghcn-daily-about-pt3_combined"
FUND = "2026-11-21_ghcn-daily-funding-pt3"
PT4 = "2026-11-21_ghcn-daily-threats-news-pt4"
PT5 = "2026-11-21_ghcn-daily-sources-pt5"
NCEI = "2026-11-17_noaa-ncei-threats"
GAUGE = "2026-11-18_noaa-rain-gauge-threats"

H, M, L = "high", "moderate", "low"

LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")


def fmt(text):
    out, pos = [], 0
    for m in LINK.finditer(text):
        out.append(html.escape(text[pos:m.start()]))
        out.append(f'<a href="{html.escape(m.group(2))}">{html.escape(m.group(1))}</a>')
        pos = m.end()
    out.append(html.escape(text[pos:]))
    return "".join(out)


# Stance of each evidence item toward the subcategory's description, in list order:
# F = for (supports the statement), A = against (contradicts it), N = neutral (context, or mixed).
STANCES = {
    "P-1": "F A N N N A A A F",
    "P-2": "N N F N F N",
    "P-3": "A F A A F F N F",
    "P-4": "A A A A A F N",
    "D-1": "N F F A A A F A N F A",
    "D-2": "A F F A A F F F F",
    "D-3": "A F F F N A F N",
    "D-4": "N A F N N F A",
    "D-5": "A F A F F N F F A A F",
    "DIRS-1": "N F A F N F F F F",
    "DIRS-2": "N N F F F F A N A F A",
    "DIRS-3": "N F F F F F F F F F N N",
    "DIRS-4": "A A F F N F N",
    "DIRS-5": "N F F N A F F F",
    "RRS-1": "F N F A F N",
    "RRS-2": "N N N",
    "RRS-3": "N N N N N",
    "RRS-4": "A A A N A F N",
    "RRS-5": "F F F F F F A",
}
STANCE_NAME = {"F": "for", "A": "against", "N": "neutral"}
STANCE_ORDER = {"for": 0, "against": 1, "neutral": 2}


def div(key, evidence, gaps):
    cls = key.lower()
    if not evidence and not gaps:
        return f'<div class="{cls}"></div>'
    stances = [STANCE_NAME[c] for c in STANCES[key].split()]
    assert len(stances) == len(evidence), (key, len(stances), len(evidence))
    # Sort by stance (for, against, neutral); Python's sort keeps the original order within a group.
    items = sorted(zip(stances, evidence), key=lambda x: STANCE_ORDER[x[0]])
    parts = [f'<div class="{cls}">']
    if evidence:
        parts.append('<h4>Evidence</h4><ul class="evidence">')
        for stance, (conf, src, text) in items:
            parts.append(
                f'<li data-stance="{stance}" data-confidence="{conf}" data-source="{src}">{fmt(text)} '
                f'<span class="confidence">({conf})</span></li>'
            )
        parts.append("</ul>")
    if gaps:
        parts.append('<h4>Gaps</h4><ul class="gaps">')
        parts.extend(f"<li>{fmt(g)}</li>" for g in gaps)
        parts.append("</ul>")
    parts.append("</div>")
    return "".join(parts)


# Frequently cited pages
ISO = "https://www.ncei.noaa.gov/metadata/geoportal/rest/metadata/item/gov.noaa.ncdc:C00861/html"
README = "https://www.ncei.noaa.gov/pub/data/ghcn/daily/readme.txt"
STATUS = "https://www.ncei.noaa.gov/pub/data/ghcn/daily/status.txt"
PRODUCT = "https://www.ncei.noaa.gov/products/land-based-station/global-historical-climatology-network-daily"
MENNE12 = "https://www.ncei.noaa.gov/pub/data/ushcn/papers/menne-etal2012.pdf"
DURRE10 = "https://www.ncei.noaa.gov/pub/data/ghcn/daily/papers/durre-menne-etal2010.pdf"
ORG23 = "https://www.nesdis.noaa.gov/s3dl?path=/s3/2023-02/NCEI_Org_Chart_Feb_2023.pdf"
CJ26 = "https://www.noaa.gov/sites/default/files/2025-06/NOAA%20FY26%20Congressional%20Justification.pdf"
CJ27 = "https://www.noaa.gov/sites/default/files/2026-04/FY2027-NOAA-CJ-Submission.pdf"
JES26 = "https://www.appropriations.senate.gov/imo/media/doc/fy26_cjs_jes.pdf"
HR652 = "https://www.govinfo.gov/content/pkg/CRPT-119hrpt652/html/CRPT-119hrpt652.htm"
SEN27 = "https://www.appropriations.senate.gov/imo/media/doc/cjs_explanatory_stmt.pdf"
WATCHDOG_AUG = "https://avlwatchdog.org/top-climate-scientists-departure-is-sign-of-brain-drain-at-noaa-hub-in-asheville-and-of-deep-cuts-to-research-across-the-country/"
CT_YAHOO = "https://www.yahoo.com/news/articles/asheville-federal-workers-bare-minimum-090818131.html"
OSUPG = "https://www.ncei.noaa.gov/operating-system-upgrade-outage"
GSTATUS = "https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-status.txt"
SUPER_WB = "https://web.archive.org/web/20251111202310id_/https://www.ncei.noaa.gov/pub/data/ghcn/daily/superghcnd/"
CLOUD = "https://www.ncei.noaa.gov/news/cloud-migration"
CLOUD_FAQ = "https://www.ncei.noaa.gov/news/cloud-migration-FAQ"
ALERTS = "https://www.ncei.noaa.gov/alerts"
AWS = "https://registry.opendata.aws/noaa-ghcn/"
BQ = "https://console.cloud.google.com/marketplace/details/noaa-public/ghcn-d"
ASOS_FAQ = "https://www.weather.gov/asos/faq.html"
FR_COOP = "https://public-inspection.federalregister.gov/2026-09099.pdf"
CISESS_AW = "https://api.usaspending.gov/api/v2/awards/ASST_NON_NA24NESX432C0001_1330/"
S3923 = "https://www.govinfo.gov/content/pkg/BILLS-119s3923es/html/BILLS-119s3923es.htm"
SRPT44 = "https://www.govinfo.gov/content/pkg/CRPT-119srpt44/html/CRPT-119srpt44.htm"
BE_SEP25 = "https://berkeleyearth.org/september-2025-temperature-update/"
BE_MAR26 = "https://berkeleyearth.org/march-2026-temperature-update/"
UCS = "https://blog.ucs.org/carlos-martinez/the-trump-administration-threatens-noaa-again-as-extreme-weather-looms/"
SSOD = "https://www.ncei.noaa.gov/products/global-historical-climatology-network-hourly/synoptic-summary-of-the-day"
INVENTORY = "https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-inventory.txt"
ECCC = "https://climate.weather.gc.ca/archived_messages_e.html"
FRANKFORT = "https://www.weather.gov/lmk/FrankfortASOSRetiringasOfficialNWSClimateSite"
HELENE = "https://fedscoop.com/ncei-working-to-recoup-data-after-helene-outage/"
DSMR = "https://repository.library.noaa.gov/view/noaa/34330/noaa_34330_DS1.pdf"
DRP = "https://portal.datarescueproject.org/datasets/global-historical-climatology-network-daily-ghcnd/"
PR292 = "https://github.com/rhiza-research/weather-skills/pull/292"
WMO_WIS2 = "https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/wmo-information-system-wis/guidance-transition-from-gtswis1-wis2"

# ---------------------------------------------------------------- People risk
P1 = [
    (L, PT1, "No written succession plan or knowledge-transfer plan for any GHCN-Daily role was found. None of the research runs searched for one, so this is an absence of evidence, not evidence of absence."),
    (H, PT1, f"The point of contact is a team, the \"GHCNd Operations Team\" (ncdc.ghcnd@noaa.gov), with Matthew Menne and Imke Durre as principal investigators ([NCEI ISO record C00861]({ISO})). The dataset citation credits 11 people for Version 3 (2012): Menne, Durre, Korzeniewski, McNeill, Thomas, Yin, Anthony, Ray, Vose, Gleason and Houston ([readme]({README}))."),
    (M, FUND, f"Where the team sits is inferred, not stated: NCEI's February 2023 org chart has a Dataset Section and a Products Section under the Climatic Science & Development Branch (Climatic Science & Services Division). Durre heads the Products Section; a 2023 NWS seminar bio places Menne, GHCN's \"technical and scientific lead\", in the Dataset Section ([NCEI org chart, 2023]({ORG23})). No chart newer than 2023 was found."),
    (H, PT1, "The GHCN-Daily team's size is not published anywhere the research looked. NCEI-wide figures conflict: 175 NOAA staff in Asheville, most at NCEI (BPR, Feb 2025); 177 NCEI staff before the March 2025 departures (Asheville Watchdog); a union local's \"30-person staff\" (Citizen Times, Oct 2025)."),
    (H, PT1, f"The dataset has run a long time with versioned releases: Version 3.00 was released September 24, 2012, and releases have continued to v3.35 (October 1, 2026) ([status.txt]({STATUS})). Its international part descends from the earlier Global Daily Climatology Network."),
    (H, PT2, f"Written documentation that would support a handover exists: peer-reviewed descriptions of integration ([Menne et al. 2012]({MENNE12})) and of the QC system ([Durre et al. 2010]({DURRE10})); a readme with every flag and the source priority order; a version file; a change log ([status.txt]({STATUS})); `mingle-list.txt`, which ranks each station's sources; and superghcnd diff files that list value-level changes between versions."),
    (M, PT2, f"Menne et al. (2012) say each version is archived \"along with the latest processing source code\", so the code is kept internally, though it is not published ([Menne et al. 2012]({MENNE12}))."),
    (M, FUND, "People outside the core team also know parts of the system: CISESS staff (NC State's NCICS in Asheville) built a cloud processing prototype for GHCN-D (2019–20) and a GHCN-D graph database (2021–23). The CISESS agreement runs to June 30, 2029."),
    (M, NCEI, f"The pool of possible successors at NCEI shrank in 2025: NCEI FTE fell from 184 (FY2024) to 140 (FY2026 enacted column), and a former NCEI science chief put 2025 departures at 58, \"about one third of the workforce\" ([Asheville Watchdog, Aug 2025]({WATCHDOG_AUG})). No source ties these departures to the GHCN-Daily team."),
]
P1_GAPS = [
    "No search for a succession plan, workforce plan or knowledge-transfer procedure for GHCN-Daily or NCEI.",
    "GHCN-Daily team size and a current (post-2023) NCEI org chart.",
]

P2 = [
    (L, PT1, "No ages, retirement eligibility, hire dates or ORCID records were collected for anyone on the GHCN-Daily team. None of the runs searched for them."),
    (H, PT1, f"The people named as critical are Matthew Menne and Imke Durre (principal investigators, [ISO record]({ISO})). The 2012 overview paper's authors were Menne, Durre, Vose, Gleason and Houston, then at NCDC in Asheville ([Menne et al. 2012]({MENNE12}))."),
    (L, PT2, f"Inference: Durre and Menne have published on GHCN-Daily since at least 2008–2010 (Durre et al. 2008; [Durre et al. 2010]({DURRE10})), so both have worked on the dataset for at least 16 years. That is a lower bound on career length, not an age."),
    (M, PT4, "Russ Vose was still quoted as \"NOAA climate monitoring chief\" in January 2026 (AP), and a NOAA media advisory listed him in October 2026 (search result only). No 2025–2026 news names Menne, Durre, Vose, Rennie, Korzeniewski, Yin or Stevens in connection with retirements, departures or cuts."),
    (M, PT3C, f"Retirement is already thinning NCEI's senior staff: NCEI said in March 2025 that \"the loss of a significant number of staff resulting from the recent release of probationary employees, the Deferred Resignation Program and employees retiring\" ended its monthly climate calls. David Easterling, NCEI's chief of scientific services, left in April 2025, \"one of 58 employees who have retired or resigned\"; the same article quotes a former NCEI science chief who retired early partly because he was on a list of staff \"eligible for reclassification as political employees\" ([Asheville Watchdog, Aug 2025]({WATCHDOG_AUG}))."),
    (M, PT4, f"Nearly 60 NCEI Asheville staff took the deferred-resignation offer by October 2025 ([Citizen Times via Yahoo]({CT_YAHOO})). Whether any were GHCN-Daily staff is not reported."),
]
P2_GAPS = [
    "ORCID IDs and earliest publication years for Menne, Durre, Vose and the other credited people (a proxy for age).",
    "Who currently does GHCN-Daily production and QC, beyond the two PIs, and when each started on the dataset.",
]

P3 = [
    (H, PT2, f"The QC system is documented in detail: about 20 fully automated tests (19 in 2010), each with its thresholds, are described in [Durre et al. 2010]({DURRE10}) and listed on the [NCEI product page]({PRODUCT}); the [readme]({README}) defines each quality flag. Integration (screening, matching, mingling by a fixed source priority) is described in [Menne et al. 2012]({MENNE12})."),
    (M, PT2, "The processing and QC code is not published. The QC programs are \"written in FORTRAN 95 on a Linux platform\" and users are pointed to a contact. No public code was found for integration, mingling, format checking or file production, in NCEI's GHCN-Daily folders or its GitHub organizations (NCEI-NOAAGov, 11 repositories, none on GHCN; `ncei`, none public). code.noaa.gov could not be checked."),
    (H, PT2, "NCEI does publish code for related products: GHCN-Monthly v4 source, \"provided for inspection, but without any support\" from NCEI's \"internal Git\", and the PHA homogenization code. So the GHCN-Daily code likely sits in the same internal Git, but that is not confirmed."),
    (M, PT2, "QC runs \"unsupervised\": manual checking is called \"impractical\", and the tests were \"manually validated\" only to set thresholds. Most QC knowledge is therefore in code and papers, not in daily human judgement."),
    (M, PT2, "The one human QC channel is undocumented: the \"Datzilla Gatekeeper\" investigates values raised by tickets and sets flag Z, but how Datzilla works (who decides, whether values are corrected) is not public. An NWS directive that mentions it returned HTTP 403."),
    (H, PT2, "Documentation has small holes: the product page doesn't map each check to its flag letter (several checks' flags are \"not stated\"); `GHCND_sample.csv` returns 404; `superghcnd/readme.txt` is missing; the readme still names the retired ftp.ncdc.noaa.gov."),
    (H, PT2, "Third-party readers exist (for example rOpenSci rnoaa, MIT, being archived; a Zenodo converter, CC BY 4.0; many GitHub readers). They help users read the files but not reproduce the dataset."),
    (M, PT5, f"The rules for integrating each new source are not all documented: v3.33 (January 2026) added SSODv2 \"initially … only to provide updates to stations from 2025 onwards\" and promised the full period of record \"several weeks later\"; no later log entry says this was done ([ghcnd-status.txt]({GSTATUS}))."),
]
P3_GAPS = [
    "Whether NCEI shares the GHCN-Daily code on request, or holds internal runbooks for integration and file production.",
    "The Datzilla procedure and who staffs it.",
]

P4 = [
    (H, PT1, f"The listed point of contact is a team (\"GHCNd Operations Team\") with two principal investigators, not one person ([ISO record]({ISO}))."),
    (M, PT2, "QC and the regular build are fully automated, which lowers the chance that one absent person stops production. The one human step, Datzilla ticket review, has a single role title (\"Datzilla Gatekeeper\"); how many people fill it is not known."),
    (M, PT3C, f"Production kept going without most staff: daily update files were posted every day through the October–November 2025 shutdown ([superghcnd listing, Wayback]({SUPER_WB})), when about 95% of NCEI's Asheville staff were furloughed ([Citizen Times via Yahoo]({CT_YAHOO}))."),
    (M, PT2, "Some QC happens before data reach NCEI, at the source networks: CoCoRaHS headquarters staff and volunteer coordinators review reports daily; COOP summaries (DSI-3210) are quality controlled by NCEI personnel. Production work is therefore spread over several groups."),
    (M, FUND, "Extra hands sit outside the federal team: CISESS development staff, and NCEI support contracts (science support 1332KP24F0017 and data stewardship 1332KP24F0001, both to February 2028). The contracts don't name GHCN, so their role is unknown."),
    (L, PT5, "Inference: restoring lost source feeds is slow (Canada's feed took 2.5 years, April 2024 to October 2026; SSODv2's full period of record is still not confirmed), which may point to few people able to integrate new sources. No source says why."),
    (M, PT4, "No source ties any 2025–2026 layoff, firing, buyout, furlough or reorganization to a GHCN-Daily team member."),
]
P4_GAPS = [
    "How many people can run integration of a new source, and whether anyone covers the PIs' roles.",
]

# ---------------------------------------------------------------- Data risk
D1 = [
    (H, PT3C, f"GHCN-Daily has no budget line of its own. It is paid for inside the NESDIS Operations, Research and Facilities subactivity \"National Centers for Environmental Information\"; no budget justification, House or Senate report or CRS report names GHCN ([NOAA FY2027 CJ]({CJ27}))."),
    (H, NCEI, f"FY2026: the President asked for $52.0M for NCEI, $18.0M and 16 positions below FY2024, to \"reduce engagement services, tailored products, and eliminate the Regional Climate Services program\" ([FY2026 CJ]({CJ26})). Congress enacted $69.0M (P.L. 119-74, January 2026; [joint explanatory statement]({JES26}))."),
    (H, PT4, f"FY2027: NOAA again asks for $52.0M, a cut of $17.8M (about 25%) from a $69.8M base, again eliminating Regional Climate Services while it \"will continue the core mission of preserving, hosting, and providing access to its extensive environmental data archives\" ([FY2027 CJ]({CJ27})). The House recommends $60.0M ([H. Rept. 119-652]({HR652})) and the Senate committee $70.0M ([Senate statement]({SEN27})). Nothing is enacted; a continuing resolution runs to December 11, 2026."),
    (M, PT4, f"No source proposes to end or retire GHCN-Daily. It is not on NESDIS's 2025 Notice of Changes or the Bulletin of the Atomic Scientists' list of retired products. The Senate says NOAA \"decommissioned at least 20 datasets, products and catalogs\" without notice but names none ([Senate statement]({SEN27}))."),
    (H, PT4, f"NCEI's cloud-migration FAQ says \"No datasets will be retired as part of the cloud migration\", while noting that \"several NCEI datasets were retired over the last 18 months\" ([NCEI FAQ]({CLOUD_FAQ}))."),
    (H, PT3C, f"The product is active: v3.32 (March 2025), v3.33 and v3.34 (January 2026) and v3.35 (October 1, 2026) added or restored sources ([status.txt]({STATUS}))."),
    (H, FUND, "Positions on the NCEI line are falling even where dollars hold: enacted positions went from 225 (FY2020) to 185 (FY2026) and FTE from 222 to 140; FY2025 actual was 126 positions."),
    (M, PT4, f"The CISESS cooperative agreement (some GHCN-Daily development work) runs July 2024 – June 2029, $77.5M obligated, last modified September 30, 2026, with no termination ([USAspending]({CISESS_AW})). The April 2025 budget plan proposed \"terminating funding for NOAA's cooperative institutes\", but the FY2027 cooperative-institute cuts are OAR lines, not NESDIS."),
    (M, FUND, "A second, smaller route: NOAA's Climate Program Office (Climate Observations and Monitoring, in OAR) called GHCN-D \"The COM funded\" dataset (2019) and \"supported by COM and NCEI\" (2021). No amount or post-2021 evidence was found, so whether it continues is unknown."),
    (L, PT4, "A FY2025 NOAA spend plan was reported as \"$239 million less overall than the current enacted budget for NOAA's six line offices\" (Bloomberg Law, snippet only; NESDIS's share not seen)."),
    (M, FUND, "Context before 2025: the NCEI line rose from $61.6M (FY2020) to $71.4M (FY2023), then held at $69–70M; the run rated the structure \"narrow but steady\"."),
]
D1_GAPS = [
    "GHCN-Daily's own share of the NCEI line, of CPO COM and of CISESS is not published.",
    "The FY2027 outcome after the December 11, 2026 continuing resolution.",
    "Funding for the cloud hosts (NOAA Open Data Dissemination program, which places the AWS and Google copies) was not searched.",
]

D2 = [
    (H, PT1, f"NCEI is the holding archive; each daily update gets a version number and is archived at NCEI, and every version is kept \"in perpetuity\" ([Menne et al. 2012]({MENNE12}))."),
    (H, NCEI, f"NCEI is moving all its data from servers in Asheville and Boulder to Amazon Web Services through Spring 2027 ([NCEI cloud migration]({CLOUD})). An NCEI alert for November 16–30, 2026 warns of \"delayed data archival and slower update cycles\" ([NCEI Alerts]({ALERTS}))."),
    (H, PT4, f"During the migration, a user reported that \"Every path under … /pub/data/ghcn/ returns 404\" (November 18, 2026; [GitHub PR]({PR292})); the folder loaded again on November 21, but the version file showed an update about six days old for a daily product."),
    (H, PT1, f"Copies are served outside NCEI: AWS S3 bucket `noaa-ghcn-pds` (us-east-1, updated daily, [AWS registry]({AWS})) and Google BigQuery `bigquery-public-data.ghcn_d` (daily, [Google Cloud]({BQ})). No Microsoft Planetary Computer copy was found (low confidence: two searches)."),
    (M, PT4, f"The Data Rescue Project archived a copy on March 23, 2025 (141.0 GB) ([Data Rescue Project]({DRP})). It is a static snapshot."),
    (M, PT1, "Inference: the dataset is produced only at NCEI. The AWS and Google copies are fed from NCEI's daily output, so if NCEI's processing stops, every copy stops updating, though existing data stay readable."),
    (H, PT3C, f"Hurricane Helene (September 2024) disrupted all of NCEI's ingest streams ([FedScoop, 2024]({HELENE})); GHCN-Daily's update files show a 19-day gap, September 27 – October 16, 2024. Two shorter gaps followed in early 2025 (January 14–18, February 3–9), with no cause given."),
    (H, NCEI, f"NCEI's August 2025 operating-system upgrade ended ISD, LCDv1 and GSOD and decommissioned the Image and Publications System on August 29, 2025 ([NCEI]({OSUPG}))."),
    (M, NCEI, "GSA listed NCEI's Asheville headquarters building for disposal in March 2025 and then pulled the list; its current status was not found."),
]
D2_GAPS = [
    "Storage hardware age, backup sites and failover for NCEI's Asheville and Boulder systems were not searched.",
    "Whether GHCN-Daily processing (not only storage) moves to AWS, and what runs it after Spring 2027.",
]

D3 = [
    (H, PT2, "Users reach the data through six routes: NCEI HTTPS folders (/pub/data/ghcn/daily/ and /data/…-daily/), the NCEI Access Data Service, CDO web services v2 (token required; 5 requests a second, 10,000 a day), CDO search and order (delivered by email), AWS S3, and Google BigQuery (Google Cloud account; free up to 1 TB a month)."),
    (M, PT3C, "Inference: NCEI's access services are paid from the same NCEI line as production, so the FY2026 and FY2027 proposed cuts apply to them too. The FY2027 request's cut falls mostly on contracted services (advisory services −$11.04M, non-federal services −$6.77M)."),
    (H, PT4, f"Access is interrupted now: NCEI's cloud move (November 16–30, 2026) brought 404s across /pub/data/ghcn/ on November 18 ([GitHub PR]({PR292})), and one user tool switched to the AWS S3 copy as a fallback."),
    (H, PT3C, f"Past interruptions: a 19-day update gap after Hurricane Helene (2024; [FedScoop]({HELENE})); short gaps in January and February 2025; the August 2025 operating-system upgrade outage ([NCEI]({OSUPG}))."),
    (M, PT4, "During the October–November 2025 shutdown, about 95% of NCEI's Asheville staff were furloughed, and state climatologists lost \"quality-controlled climatological observations from the National Centers for Environmental Information\" (Farms.com). GHCN-Daily's own daily files kept being posted."),
    (M, PT4, "NCEI's support contracts (data stewardship 1332KP24F0001 and science support 1332KP24F0017) run to February 3, 2028; their potential values were cut slightly by undated changes. They don't name GHCN."),
    (M, NCEI, "Staff shortages have already taken other NCEI services offline: Sen. Cantwell's office says shortages took data sources offline, including the billion-dollar disaster report, and NCEI ended its monthly climate briefings after February 2025."),
    (L, PT4, "A Federal Register rule set a new NCEI fee schedule effective May 14, 2026; whether it touches GHCN-Daily routes was not checked."),
]
D3_GAPS = [
    "Staffing and funding of the access systems themselves (CDO, Access Data Service), and of NOAA's Open Data Dissemination agreements with AWS and Google.",
]

D4 = [
    (H, PT2, "Formats: fixed-width ASCII `.dly` per-station files, CSV (by_year, by_station), superghcnd full and diff CSV, tar.gz bundles; the Access Data Service offers CSV, SSV, JSON, PDF and NetCDF; AWS offers CSV, CSV.gz and Parquet; Google offers BigQuery tables."),
    (H, PT2, "All formats are open and documented in NCEI readmes. No proprietary software is needed except on the BigQuery route (a Google Cloud account and SQL)."),
    (H, PT2, f"No route passes all four FAIR tests. Variables use NCEI element codes in scaled units (\"PRCP = Precipitation (tenths of mm)\") rather than CF standard names ([readme]({README})); NCEI's routes state no licence; CDO needs a token or delivers by email."),
    (M, PT2, f"Licence conflict: AWS and data.gov say CC0-1.0, but NCEI's own ISO record, the DataCite record and the readme state no licence ([AWS registry]({AWS}))."),
    (H, PT2, "Metadata faults: the DataCite record's formats, subjects and rights fields are empty; data.gov shows accessLevel \"non-public\" and a 2012 modified date."),
    (M, PT2, "The AWS Parquet schema and units are not documented in the bucket or NODD readmes, and a NetCDF request to the Access Data Service came back empty in one test."),
    (H, PT2, "Many third-party readers exist (rnoaa, MIT, being archived; a Zenodo converter, CC BY 4.0; many GitHub readers), so users don't depend on one tool."),
]
D4_GAPS = [
    "The AWS Parquet and BigQuery schemas, and NetCDF output with CF names, were not read.",
]

D5 = [
    (M, PT4, "No source shows GHCN-Daily records being removed, altered or restricted for political reasons, and no news names its team in connection with politics."),
    (M, PT4, f"A Union of Concerned Scientists blog (May 21, 2026) ties GHCN's \"severe disruptions\" to the administration's actions against NOAA ([UCS]({UCS})). Berkeley Earth reports GHCN-Daily \"broken or in a degraded state\" since late August 2025 ([Berkeley Earth, Mar 2026]({BE_MAR26})). NOAA has given no cause."),
    (L, PT4, "Interpretation by the research run: the degradation began the day ISD and GSOD reached end of life (August 29, 2025), which points to a product transition rather than political interference. No source says so."),
    (H, NCEI, f"Congress objected to unannounced removals: the Senate says NOAA \"has decommissioned at least 20 datasets, products and catalogs\" without notice and directs NOAA to restart them ([S. Rept. 119-44]({SRPT44})); in November 2026 it still \"awaits the update\"."),
    (M, NCEI, "NOAA's notice retiring the billion-dollar disaster product cited \"evolving priorities, statutory mandates, and staffing changes\" (E&E News). E&E News's \"Here's where the Trump team is scrubbing climate data\" (August 2025) names NCEI but not GHCN."),
    (M, NCEI, f"S. 3923 passed the Senate November 10, 2026 and would require NOAA to \"maintain the National Centers for Environmental Information, or a successor entity\" as the long-term archive ([S. 3923]({S3923})). It protects the archive role in law but allows it to move."),
    (M, NCEI, f"Some NCEI staff were reportedly on a list \"eligible for reclassification as political employees\", who could then be fired without cause ([Asheville Watchdog, Aug 2025]({WATCHDOG_AUG}))."),
    (L, NCEI, "Context: Project 2025 said NOAA \"should be broken up and downsized\" and that its information services \"could be provided commercially\", without naming NCEI. No executive order or Commerce directive aimed at NCEI was found."),
    (M, NCEI, "Counterevidence: Commerce's Gold Standard Science plan (August 2025) says NOAA \"will leverage\" NCEI for public access."),
    (M, PT3C, "International politics: the US withdrawal memo of January 7, 2026 lists the IPCC and UNFCCC but not WMO, through which much of GHCN-Daily's foreign data are exchanged."),
    (M, PT4, f"The Data Rescue Project archived a copy in March 2025 ([Data Rescue Project]({DRP})), a sign that outside groups saw a risk of loss."),
]
D5_GAPS = []

# ---------------------------------------------------------------- Dependent infrastructure resilience
DIRS1 = [
    (L, PT1, "No research run asked about calibration: which labs or reference standards calibrate the gauges and thermometers in the contributing networks, or whether any inter-comparison program supports them."),
    (H, PT1, f"NCEI does not own or calibrate any instruments; they belong to the contributing networks (COOP, ASOS, SNOTEL, CoCoRaHS and national services), and no NCEI document maps instruments to GHCN-Daily elements ([Menne et al. 2012]({MENNE12}))."),
    (H, PT2, f"NCEI does all GHCN-Daily QC itself, with its own automated tests ([Durre et al. 2010]({DURRE10})). The tests check values against world records, the station's own climatology and neighbouring stations, so they rely on internal comparison rather than an external calibration service."),
    (M, PT2, f"GHCN-Daily is not homogenized: no adjustments are made for changes in instruments or observing practice ([product page]({PRODUCT})). Inference: any calibration drift or instrument change in a source network passes straight into the dataset."),
    (M, PT2, "Some source networks QC their own data first: CoCoRaHS uses automated and manual checks; COOP summaries are checked by NCEI personnel. What QC foreign national services do was not found."),
    (M, GAUGE, "ASOS sensor maintenance is under strain: a March 2025 memo reorganized maintenance into \"pods\" \"to mitigate critical staffing shortages\"; a NOAA staffer told CNN of \"more than 90 vacancies\" among technicians who repair radars and automated surface stations (May 2025). The Commerce OIG counted 564 NWS departures (about 13%) from January to April 2025."),
    (H, GAUGE, "COOP \"relies on equipment that is no longer supported by manufacturers\", and the budget plans only to \"initiate refresh\" (FY2026 and FY2027 CJs)."),
    (M, GAUGE, "USCRN, a reference-quality network (GHCN-Daily source R, near the top of the source priority), is maintained by NOAA's Air Resources Laboratory (ATDD, Oak Ridge). Both the FY2026 and FY2027 requests would close ARL; Congress rejected this for FY2026."),
    (M, PT5, "Australia's audit office found the Bureau of Meteorology only \"partly effective in managing assets in its observing network\", with 52–79% of target preventative maintenance done in 2023–24."),
]
DIRS1_GAPS = [
    "Calibration services and reference standards for COOP, ASOS, CoCoRaHS, SNOTEL and foreign networks were never searched.",
]

DIRS2 = [
    (H, PT1, f"GHCN-Daily depends on many station networks. By station entries: CoCoRaHS 40.0%, national met/hydro service numbers 23.1%, COOP 17.4%, unspecified 9.9%, ECA&D 3.8%, WMO 2.3%, WBAN 1.7%, RAWS 1.1%, SNOTEL 0.6% (the run's own count of [ghcnd-stations.txt](https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt), closed stations included; ID codes, not value sources)."),
    (H, PT1, "Instruments: COOP uses liquid-in-glass thermometers, MMTS, standard 8-inch, plastic 4-inch and Fisher-Porter gauges; ASOS uses heated tipping-bucket or all-weather accumulation gauges with manual snow; SNOTEL uses snow pillows and storage gauges; CoCoRaHS uses a manual 4-inch gauge. Most US values are read once a day by volunteers."),
    (H, GAUGE, "NOAA's FY2027 request says \"Over half of NWS major observing systems and capabilities are beyond or reaching end-of-life\". NWS's procurement line for equipment refresh fell from $36.2M (FY2025 actual) to $16.2M (FY2026 enacted), while the Observations operations line stayed about flat ($266.8M, $262.5M, $262.5M requested)."),
    (H, GAUGE, f"COOP (emerging): NWS's May 7, 2026 Federal Register notice proposes \"Right-sizing and optimizing the scope and coverage of the existing ~6,700-site COOP network\" and asks whether mesonet data could replace COOP stations ([Federal Register 2026-09099]({FR_COOP})). A sources-sought notice prices \"up to 3,000\" sites. No decision has been published."),
    (H, GAUGE, f"ASOS (imminent): FAA funding is \"insufficient to recondition all 570 FAA ASOS locations\", so 206–207 sites move to AWOS-C from 2025 to 2029 ([NWS ASOS FAQ]({ASOS_FAQ})). Frankfort, KY was retired as an official climate site after being offline since June 2025 ([NWS Louisville]({FRANKFORT})). Which of the converted sites are climate sites is not published."),
    (M, GAUGE, "USCRN (emerging, rejected so far): the FY2026 and FY2027 requests would close the Air Resources Laboratory that maintains it; Congress funded Climate Labs at $104.1M for FY2026. ARL finished a 139-tower transmitter upgrade on April 25, 2026. A 2025 NOAA report assessed downsizing only its soil-moisture sensors, which aren't GHCN-Daily elements."),
    (M, PT3C, "CoCoRaHS (40% of station entries): no threat found; its current NOAA funding route is not public."),
    (M, PT3C, "SNOTEL/SCAN (emerging): the NRCS Portland snow office shrank from 12 to 5 staff, \"The NRCS Snow Program is only about 50 people\", and senators reported staff cuts threatening manual snow surveys (December 2025). Active SNOTEL stations rose from 909 to 919."),
    (M, PT3C, "RAWS: no threat found (\"nearly 2,200\" stations; the latest notice is a 2024 sensor end-of-life)."),
    (M, PT5, "National weather services abroad (emerging): WMO says records \"rest on short-term grants\" and the basic network is \"less than 40 per cent in place\" (2026); WMO cut staff funding and abolished 68 posts; USAID, a funder of African station projects, was dissolved in July 2025. Argentina's SMN dismissed 140 staff on April 15, 2026, with reduced night observations reported."),
    (M, PT5, "Australia's Bureau of Meteorology: staff steady (1,711 to 1,722), and 3,457 Australian stations have 2026 data; no network cut found. Other services (Met Office, INMET) had no cuts found in a thin search."),
]
DIRS2_GAPS = [
    "Which ASOS-to-AWOS sites are GHCN-Daily climate sites, and the outcome of the COOP right-sizing.",
    "Instruments and network health outside the US, Canada, Europe and Australia.",
]

DIRS3 = [
    (H, PT1, f"GHCN-Daily is a compilation: NCEI merges \"more than 25\" (product page) or \"approximately 30\" (ISO record) source datasets from US networks, national weather services, bilateral exchanges and the Global Summary of the Day, combined day by day under a fixed source priority ([readme]({README}))."),
    (H, PT5, f"The synoptic stream was lost: NCEI's ISD and GSOD (GHCN-Daily sources S and W) reached end of life on August 29, 2025 ([NCEI]({OSUPG})). By the run's count from NCEI's inventory, 1,371 of the 1,907 WMO-ID stations reporting in mid-2025 have no 2026 data, mostly in Russia (539), China (92), Indonesia (85), Argentina (47) and Algeria (45) ([inventory]({INVENTORY}))."),
    (M, PT5, f"The replacement is partial: SSODv2, derived from GHCNh, was added in v3.33 (January 5, 2026) for 2025 onward; the full period of record was promised \"several weeks later\" but no entry confirms it ([ghcnd-status.txt]({GSTATUS})). Only 590 WMO-ID stations report in 2026. NCEI warns that SSOD precipitation \"may be underreported\" ([SSOD page]({SSOD}))."),
    (M, PT4, f"Users saw the loss: Berkeley Earth reported GHCN-Daily \"broken or incomplete\" from late August 2025 ([Berkeley Earth, Sept 2025]({BE_SEP25})) and still degraded in April 2026."),
    (H, PT5, f"Environment Canada's daily feed was \"unexpectedly discontinued on April 28, 2024\" and restored on October 1, 2026 by re-integrating weekly from ECCC's web database; no cause was found. The run also reports earlier Canadian feed failures in 2016 and 2018 ([ghcnd-status.txt]({GSTATUS}))."),
    (H, PT5, f"The Canadian source is itself changing: in March 2026 ECCC moved its URLs to Climate Identifiers, and in August 2026 said the historical data of 174 Government of Alberta climate stations \"will be permanently removed\" ([ECCC]({ECCC}))."),
    (H, PT5, "ECA&D (Europe) was static from September 20, 2024 to January 20, 2025, then resumed monthly updates."),
    (M, PT5, "Regional Climate Centers (the High Plains RCC supplies airport Daily Summary Messages, v3.32): four of six RCCs went dark April 17, 2025 when funding lapsed, and were restored within days. All six contracts end October 16, 2026; the Southeast RCC announced a $5M five-year NOAA grant (September 2026). The FY2026 and FY2027 requests would eliminate Regional Climate Services; the House FY2027 report gives the RCCs $6.1M."),
    (M, PT3C, f"WMO exchange (emerging): the GTS \"is planned to be decommissioned by 2033\" as WIS2 takes over ([WMO]({WMO_WIS2})); 59% of WMO's 2026 assessment was unpaid on April 30, 2026; the GCOS secretariat \"will cease to operate after 2027\" without new funding. No source ties these to lost station data yet."),
    (M, FUND, "Foreign station data come in kind \"through official bi-lateral agreements\" with national services; US inputs are paid for by their own programs (COOP by NWS, CoCoRaHS and SNOTEL by their funders). GHCN-Daily controls none of these budgets."),
    (H, PT2, "Real-time US streams are replaced by archive-quality sources (such as COOP summaries) 45 to 60 days after month end, so the final record depends on those archive streams continuing."),
    (M, GAUGE, "The COOP right-sizing plan leans on state and private mesonets, whose NOAA purchase line (National Mesonet Program) faced a proposed cut of about 1,200 platforms in FY2026 that Congress rejected ($30.0M enacted; House FY2027 $40.0M)."),
]
DIRS3_GAPS = [
    "Whether SSODv2's full period of record was integrated, and which lost stations it will restore.",
    "Why Canada's feed stopped in 2024, and whether the Alberta removals reach GHCN-Daily.",
    "The RCC contract after October 16, 2026.",
]

DIRS4 = [
    (H, PT1, "GHCN-Daily uses no satellite data and no reanalysis: it is station observations only, so it needs no external satellite or model processing."),
    (M, PT2, "Production runs at NCEI on NCEI's own software (Fortran 95 QC on Linux, plus unnamed integration and file-writing programs). No outside processing facility is named."),
    (M, NCEI, f"NCEI's own infrastructure is moving to a commercial vendor: all NCEI data leave the Asheville and Boulder servers for Amazon Web Services by Spring 2027 ([NCEI cloud migration]({CLOUD})). Inference: after that, archiving (and perhaps processing) of GHCN-Daily depends on AWS."),
    (M, FUND, "CISESS (NC State's NCICS) built a cloud processing prototype for GHCN-D in 2019–20 under task NC-SON-02-NCICS-BB, so a cloud processing path has been developed by a partner, not by NCEI alone."),
    (M, FUND, "NCEI support contractors (Consolidated Safety Services, science support; Alpha Omega Integration, data stewardship, $19.1M obligated, to 2028) may do part of the work; the contracts don't name GHCN."),
    (M, PT2, "Upstream processing is done outside NCEI by the source networks: CoCoRaHS QC at Colorado State University, High Plains RCC processing of airport summaries, NWS WxCoder3 for COOP reports, KNMI for ECA&D, and WMO's GTS for synoptic reports."),
    (H, PT3C, f"Physical facilities matter: Hurricane Helene disrupted all of NCEI's ingest in 2024 ([FedScoop]({HELENE})), and the August 2025 operating-system upgrade ended ISD and GSOD ([NCEI]({OSUPG}))."),
]
DIRS4_GAPS = [
    "Where GHCN-Daily processing will run after the AWS migration, and who operates it.",
]

DIRS5 = [
    (H, PT1, f"The source priority gives some built-in fallback: values are mingled from several sources per station, and GSOD (now SSODv2) is used only when nothing else exists ([readme]({README})). For many foreign WMO stations, though, the synoptic stream was the only source."),
    (M, PT5, f"When GSOD ended there was no full substitute: SSODv2 restores only part of the stations, its precipitation \"may be underreported\", and NCEI points users to national met service summaries instead ([SSOD page]({SSOD}))."),
    (H, PT5, "Canada's stations had no replacement feed for 2.5 years (April 2024 – October 2026); the fix was a new route from ECCC's web database, not an alternative supplier."),
    (H, PT5, f"Airport sites gained a second route: NWS CF6 summaries were added in v3.34 (January 2026). But NWS says an AWOS \"cannot serve as a direct replacement for official NWS climate archiving\" ([NWS Louisville]({FRANKFORT}))."),
    (M, GAUGE, "For COOP, NWS itself names mesonets as possible \"suitable alternatives to federally managed COOP stations\"; no decision has been made."),
    (L, GAUGE, "Interpretation by the research run: radar and satellite can fill spatial gaps for real-time warnings but cannot replace gauges for snow, terrain or the long, uniform records that climate normals need."),
    (M, PT1, "No other organization produces GHCN-Daily. The AWS and Google copies are mirrors of NCEI's output, not independent producers."),
    (M, PT5, "Foreign stations depend on their national services, through WMO exchange, as sole suppliers; WMO says the basic network is \"less than 40 per cent in place\"."),
]
DIRS5_GAPS = [
    "Alternative datasets that could stand in for GHCN-Daily (for example national archives or other compilations) were not searched.",
]

# ---------------------------------------------------------------- Repository resilience
RRS1 = [
    (H, PT1, f"At least three organizations serve the data: NCEI (HTTPS folders, Access Data Service, CDO), AWS S3 `noaa-ghcn-pds` in us-east-1 ([AWS registry]({AWS})), and Google BigQuery `ghcn_d` ([Google Cloud]({BQ})). NCEI's ISO record links both cloud copies; both update daily."),
    (M, NCEI, f"NCEI has held data on servers in two places, Asheville and Boulder ([NCEI cloud migration]({CLOUD})). Whether GHCN-Daily is copied at both was not found."),
    (M, PT4, f"A static copy (March 23, 2025, 141.0 GB) is held by the Data Rescue Project ([Data Rescue Project]({DRP}))."),
    (L, NCEI, "Inference: once NCEI's own data move to AWS (by Spring 2027), NCEI's copy and the AWS Open Data copy will both be on AWS, so the number of independent vendors may shrink. The AWS region of NCEI's new storage is not stated."),
    (M, PT4, f"The mirrors work as failover in practice: during NCEI's November 2026 404s, a user tool switched to the AWS S3 copy ([GitHub PR]({PR292}))."),
    (L, PT1, "No Microsoft Planetary Computer copy was found (two searches)."),
]
RRS1_GAPS = [
    "No evidence that the copies are verified against each other (\"verified copies\").",
]

RRS2 = [
    (L, PT1, "No checksum policy, fixity checks or CoreTrustSeal certification for NCEI or the cloud copies was found. No run searched for them."),
    (M, FUND, f"A 2021 NESDIS data stewardship maturity review of GHCN-Daily exists (DSMR-00227) and calls it \"operational and supported by NCEI\" ([DSMR-00227]({DSMR})). Whether it covers integrity checks was not read."),
    (L, PT2, "The superghcnd diff files list value-level updates, inserts and deletes between versions. They track data changes, not storage integrity."),
]
RRS2_GAPS = [
    "NCEI's archive fixity and checksum practice, CoreTrustSeal or ISO 16363 status, and the content of DSMR-00227.",
]

RRS3 = [
    (L, PT1, "No NCEI disaster recovery or continuity-of-operations plan, or test of one, was found. No run searched for one."),
    (H, PT3C, f"A real disaster tested NCEI: Hurricane Helene (September 2024) disrupted all its ingest streams at the Asheville headquarters ([FedScoop]({HELENE})). GHCN-Daily updates stopped for 19 days (September 27 – October 16, 2024) and then resumed. This is a record of recovery, not a documented plan."),
    (M, PT3C, f"During the October–November 2025 shutdown, daily GHCN-Daily files were still posted with about 95% of Asheville staff furloughed ([superghcnd listing, Wayback]({SUPER_WB}))."),
    (H, PT4, f"The November 2026 cloud migration is causing outages and delays now ([NCEI Alerts]({ALERTS}))."),
    (M, FUND, "Commerce OIG reports OIG-24-034-A (NESDIS cloud) and OIG-16-043-A (NESDIS cyber incident) were found but not opened; they may describe recovery planning."),
]
RRS3_GAPS = [
    "NCEI's continuity-of-operations or disaster recovery plan and when it was last tested; the two OIG reports.",
]

RRS4 = [
    (H, NCEI, f"NCEI funding: FY2026 request $52.0M, enacted $69.0M ([joint explanatory statement]({JES26})); FY2027 request $52.0M (about −25%), House $60.0M, Senate committee $70.0M, not enacted; a continuing resolution runs to December 11, 2026 ([FY2027 CJ]({CJ27}))."),
    (M, NCEI, "NCEI staffing (in effect): FTE fell from 184 (FY2024) to 140 (FY2026 enacted column); press counts give 20 departures by February 28, 2025 and 58 by August 2025."),
    (H, NCEI, "NCEI retired or cut back about 27 products from April 2025 (NESDIS 2025 Notice of Changes); the Senate says at least 20 were decommissioned without notice. GHCN-Daily is not among those named."),
    (M, NCEI, f"S. 3923 (passed the Senate November 10, 2026) would write the archive role into law for \"the National Centers for Environmental Information, or a successor entity\" ([S. 3923]({S3923}))."),
    (L, NCEI, "The FY2027 request cuts NESDIS by 5.4% ($162M), including a shift of satellite operations to contractors; NCEI is not named. A 2026 NOAA reorganization is mentioned but its content was not found. NCEI's director, Deke Arndt, is still listed."),
    (M, PT4, "NCEI's support contracts run to February 3, 2028; the CISESS agreement runs to June 30, 2029 with no termination."),
    (L, PT1, "The AWS and Google copies are placed through NOAA's Open Data Dissemination program; that program's funding and the cloud vendors' commitments were not searched."),
]
RRS4_GAPS = [
    "Funding and terms of NOAA's Open Data Dissemination agreements with AWS and Google.",
    "Whether NCEI actually received its FY2026 $69.0M (the spend plan is not public).",
]

RRS5 = [
    (H, PT3C, f"NCEI recovered from Hurricane Helene (2024): ingest was disrupted, GHCN-Daily updates stopped for 19 days, and the archive resumed ([FedScoop]({HELENE})). No loss of archived data was reported."),
    (M, PT3C, "NCEI lost about a third of its workforce in 2025 (58 departures) and went through the October–November 2025 shutdown; GHCN-Daily kept daily updates and added sources (v3.33, v3.34, v3.35)."),
    (H, FUND, "Every fiscal year from FY2020 to FY2024 began on continuing resolutions of 81 to 166 days, and FY2025 ran on a full-year CR, while enacted NCEI dollars stayed at $61.6M–$71.4M."),
    (H, PT1, "GHCN-Daily has had continuous versioned releases since Version 3.00 (2012), and every version is kept \"in perpetuity\"."),
    (M, PT5, "Lost source feeds have been restored more than once (Canada in 2016, 2018 and 2024–2026; ECA&D in 2025), though restoration took months to 2.5 years."),
    (M, PT3C, "The 2025 losses were of incoming data (the GSOD stream), not of archived records; NOAA has published no figure for the station loss."),
    (H, NCEI, "Other NCEI products did not survive the 2025 disruptions intact: about 27 were retired or cut back, and the billion-dollar disaster database stopped updating after 2024 (its 1980–2024 archive is kept)."),
]
RRS5_GAPS = [
    "Holdings before and after a disruption (dataset counts, ingest delays) were not searched.",
]

data = {
    "people_risk": {
        "P-1": div("P-1", P1, P1_GAPS),
        "P-2": div("P-2", P2, P2_GAPS),
        "P-3": div("P-3", P3, P3_GAPS),
        "P-4": div("P-4", P4, P4_GAPS),
    },
    "data_risk": {
        "D-1": div("D-1", D1, D1_GAPS),
        "D-2": div("D-2", D2, D2_GAPS),
        "D-3": div("D-3", D3, D3_GAPS),
        "D-4": div("D-4", D4, D4_GAPS),
        "D-5": div("D-5", D5, D5_GAPS),
    },
    "dep_infra_resilience": {
        "DIRS-1": div("DIRS-1", DIRS1, DIRS1_GAPS),
        "DIRS-2": div("DIRS-2", DIRS2, DIRS2_GAPS),
        "DIRS-3": div("DIRS-3", DIRS3, DIRS3_GAPS),
        "DIRS-4": div("DIRS-4", DIRS4, DIRS4_GAPS),
        "DIRS-5": div("DIRS-5", DIRS5, DIRS5_GAPS),
    },
    "repo_resilience": {
        "RRS-1": div("RRS-1", RRS1, RRS1_GAPS),
        "RRS-2": div("RRS-2", RRS2, RRS2_GAPS),
        "RRS-3": div("RRS-3", RRS3, RRS3_GAPS),
        "RRS-4": div("RRS-4", RRS4, RRS4_GAPS),
        "RRS-5": div("RRS-5", RRS5, RRS5_GAPS),
    },
}

OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
counts = {k: len(v) for k, v in {
    "P-1": P1, "P-2": P2, "P-3": P3, "P-4": P4, "D-1": D1, "D-2": D2, "D-3": D3, "D-4": D4, "D-5": D5,
    "DIRS-1": DIRS1, "DIRS-2": DIRS2, "DIRS-3": DIRS3, "DIRS-4": DIRS4, "DIRS-5": DIRS5,
    "RRS-1": RRS1, "RRS-2": RRS2, "RRS-3": RRS3, "RRS-4": RRS4, "RRS-5": RRS5}.items()}
print(OUT.relative_to(ROOT), counts)
