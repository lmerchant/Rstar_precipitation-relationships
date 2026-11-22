# Categorizing web searches into R* subcategories

This guide shows how to turn web research on a precipitation dataset into R* evidence, show it on the website, and write
new queries for what the research missed. It follows what was done for GHCN-Daily on 2026-11-22, so the same steps work
for GPCP Daily, PERSIANN-CDR Daily, IMERG Late Run and future datasets.

Each step has a prompt to paste into a Claude Code session in this project. Replace the `<…>` parts.

## The cycle

1. **Research.** Run `/my:broad-web-research` queries about the dataset (in their own sessions). Copy each run folder
   into `data-rstar-query-results/`.
2. **Categorize and publish** (Prompt 1). Claude sorts the research into the 19 subcategories as evidence. It tags each
   item For, Against or Neutral, writes the JSON, adds it to the website and writes a gaps note.
3. **Write gap queries** (Prompt 2). Claude turns the gaps note into one draft query per R* category, plus a run sheet.
4. **Rewrite the queries** (Prompt 3), all in one session with `/my:rewrite-research-query`.
5. **Run each query** in its own session (Prompt 4), then copy the results back.
6. **Add the new research** (Prompt 5). Claude adds the evidence, re-tags, rebuilds the website and updates the gaps
   note. Repeat from step 3 while gaps remain.
7. **End the session** (Prompt 7). Claude updates the docs and commits.

## Where things go

| What | Where | Example (GHCN-Daily) |
|---|---|---|
| Subcategory definitions | `rstar_definitions/` | `p-rstar_people_risk_queries.md` |
| Categorizing rules (format) | `docs/create_rstar_node_files.md` | — |
| Dataset metadata (name shown on the website) | `datasets_metadata/json/<id>_dataset-metadata.json` | `ghcn-daily_dataset-metadata.json` |
| Research about the dataset | `data-rstar-query-results/about-datasets/<id>/<date>_<id>-<topic>-pt<N>/` | `2026-11-21_ghcn-daily-sources-pt5/` |
| Research about repositories | `data-rstar-query-results/archives/<repository>/` | `noaa-ncei/2026-11-17_noaa-ncei-threats/` |
| Research about instruments | `data-rstar-query-results/instruments/<instrument>/` | `noaa-rain-gauges/…`, `nasa-satellites/…` |
| Category JSON (one per dataset) | `data-rstar-categories/datasets/<id>/<id>_rstar-categories.json` | `ghcn-daily_rstar-categories.json` |
| Script that writes the JSON | `scripts/categorize/build_<id>.py` | `build_ghcn-daily.py` |
| Gaps note | `datasets-gap-queries/<id>_categorization-gaps.md` | `ghcn-daily_categorization-gaps.md` |
| Gap query files | `datasets-gap-queries/<id>_gap-queries/` | `ghcn-d-gaps_Rstar_query_pt6_people.md` |
| Gap query run sheet | `datasets-gap-queries/` | `Rstar Precipitation Queries.md` |
| Website data (generated) | `app/data/rstar-data.js` | built by `app/scripts/build_data.py` |

**Naming rules that matter:**
- **Dataset id:** use the same `<id>` everywhere. The ids are `ghcn-daily`, `gpcp-daily`, `persiann-cdr-daily` and
  `imerg-late-run`.
- **Run folders:** name them `<date>_<id>-<topic>-pt<N>`. The website shortens a run folder name to `<topic>-pt<N>` on
  each evidence item, so this pattern keeps the labels short.
- **Which datasets show:** a dataset appears on the website once it has a folder in `data-rstar-categories/datasets/`.
  Until that folder has a JSON file, it shows as "not categorized yet".

## Prompt 1: categorize a dataset and add it to the website

Use this when the research for a dataset is in `data-rstar-query-results/` and you want its categories made, or remade
from scratch.

```text
Categorize the <DATASET NAME> dataset (id <id>) following docs/create_rstar_node_files.md and docs/categorizing-web-searches_README.md, and add it to the website.

Research to use: every answer_*.md in data-rstar-query-results/about-datasets/<id>/, plus the runs in data-rstar-query-results/archives/ and data-rstar-query-results/instruments/ that bear on this dataset's repositories, instruments and platforms (say which you used and which you left out, and why).

Follow the GHCN-Daily pattern (scripts/categorize/build_ghcn-daily.py and data-rstar-categories/datasets/ghcn-daily/):
- Copy the GHCN-Daily script to scripts/categorize/build_<id>.py and write the evidence by hand into it. Don't reuse the GHCN-Daily evidence.
- One JSON file: data-rstar-categories/datasets/<id>/<id>_rstar-categories.json, with the four top keys and 19 subcategory keys. Each value is a <div class="p-1"> holding an Evidence list and a Gaps list.
- Each evidence item has data-confidence (high, moderate or low), data-source (the run folder name) and data-stance: "for" if it supports the subcategory description, "against" if it contradicts it, "neutral" for context or mixed evidence. Remember the RRS descriptions are worded as good things, so "for" there means evidence of resilience. Sort each list for, against, neutral.
- Keep links to the sources. Label your own inferences as inferences, with low confidence. Include low-confidence evidence if it is relevant; leave out text that fits no subcategory.

Then:
- Write datasets-gap-queries/<id>_categorization-gaps.md, following the GHCN-Daily gaps note: what was used, a coverage table, and for each subcategory what the research never searched, with possible searches.
- Run python3 app/scripts/build_data.py, check the dataset's pages in the browser preview, and run the e2e tests in the Terminal panel. If a test depends on GHCN-Daily data that changed, fix the test, not the data.
- Tell me the for/against/neutral calls I should double-check, and give me the command to start the server.
```

**What you get:**
- the JSON;
- the dataset on the website, with stance tags and evidence sorted For, then Against, then Neutral;
- a gaps note;
- a list of judgment calls to review.

**Notes:**
- **Research that doesn't apply:** for GHCN-Daily, the satellite runs were left out because it uses station data only.
  For satellite datasets (GPCP, PERSIANN-CDR, IMERG), `instruments/nasa-satellites/` and `noaa-satellites/` apply.
- **Missing repository research:** if no run in `archives/` covers the dataset's repository (for example NASA GES DISC
  for IMERG), the gaps note should say so. That becomes a gap query.
- **New datasets:** a brand-new dataset needs a metadata file in `datasets_metadata/json/` for its full name to show.
  Without one, the website shows its id.

## Prompt 2: create gap queries from the gaps note

Use this after Prompt 1 (or Prompt 5), when you want new searches for what's missing.

```text
Using datasets-gap-queries/<id>_categorization-gaps.md, create one draft web research query per R* category (people risk, data risk, dependent infrastructure resilience, repository resilience) to fill the gaps, following the GHCN-Daily gap queries in datasets-gap-queries/ghcn-daily_gap-queries/.

- Put each query in its own file in datasets-gap-queries/<id>_gap-queries/, named <short-id>-gaps_Rstar_query_pt<N>_<people|data|infrastructure|repository>.md, numbering on from the dataset's last research part (pt<N>).
- Use the sections of my earlier query files: "## Query to refine" (the draft, a "Context for the rewrite" subsection on how to search, and a "What the answer should give" subsection), then "## Claude web research skill query" and "## Claude comments about the rewritten query", each holding "(not written yet)".
- Each draft names the earlier runs it builds on (as "in web_search_results/") and asks the run to add to them, not repeat them. It asks whether each finding supports or contradicts each subcategory statement, rates threats as imminent, emerging or no current threat found, and ends with a time limit and token ceiling like my other runs.
- Give context on how to search wherever the method defines the answer. For people risk, that means ORCID iDs and earliest publication years for the lead and credited people (a proxy for age), estimated age, and federal (FERS) retirement eligibility within 2 years. Use names from the research; mark any name or fact you add yourself as one to confirm.
- Add a run sheet for this dataset in datasets-gap-queries/ (like "Rstar Precipitation Queries.md"): a table of the files, one /my:rewrite-research-query prompt that rewrites all of them in one session, steps for running each in its own session (with run folder names), and how to bring the results back.
```

**What you get:** four query files ready for the rewrite skill, and a run sheet. The run sheet holds the exact prompt for
Prompt 3.

## Prompt 3: rewrite all the queries in one session

Copy the rewrite prompt from the dataset's run sheet. Its general form is:

```text
/my:rewrite-research-query <path to query file 1> <path to query file 2> <path to query file 3> <path to query file 4>

Rewrite all four files in one go. In each file, read the draft from "## Query to refine", including its "Context for the rewrite" and "What the answer should give" subsections. Write the rewritten question into "## Claude web research skill query", starting with the line "/my:broad-web-research", and write your notes into "## Claude comments about the rewritten query". Each of those sections replaces "(not written yet)"; leave the rest of the file as it is.

Keep these in the questions, because they define the answer: in the people query, the age proxy (ORCID iD, earliest publication year, estimated age and likely FERS retirement eligibility within 2 years); in every query, the request to say whether each finding supports or contradicts the subcategory statements.

The earlier runs the drafts name will be in web_search_results/ where the research runs. If a question should be split into two runs, put both in the same section, labelled "Run A" and "Run B", and say why in the notes.
```

Read the notes the rewrite adds, especially any suggested split or change of limits.

## Prompt 4: run one query (one session per query)

1. Open a new session in the project where you run research. That project saves results to `web_search_results/`.
2. Check that the earlier runs the question names are in that project's `web_search_results/`.
3. Paste the file's `## Claude web research skill query` section, starting with `/my:broad-web-research`.

The runs don't depend on each other, so they can go in parallel sessions.

When a run finishes:
1. Copy its folder into `data-rstar-query-results/about-datasets/<id>/`, named `<date>_<id>-gaps-<category>-pt<N>`.
2. Put the matching query file in that folder.

## Prompt 5: add new research to a dataset's categories

Use this when new runs (gap queries or anything else) are in `data-rstar-query-results/`.

```text
New research for <DATASET NAME> (id <id>) is in <run folder(s)>. Add it to the categories following docs/categorizing-web-searches_README.md:
- Read each new answer_*.md, add its evidence to scripts/categorize/build_<id>.py with data-confidence, data-source and data-stance (for, against or neutral toward each subcategory description), and remove evidence the new research shows is wrong or out of date.
- Re-run the script and python3 app/scripts/build_data.py, check the pages in the browser preview, and run the e2e tests in the Terminal panel.
- Update datasets-gap-queries/<id>_categorization-gaps.md: which gaps are now filled, what is still missing, and the new evidence counts.
- Tell me which subcategories changed and the stance calls to double-check, and give me the command to start the server.
```

## Prompt 6 (optional): first research queries for a new dataset

Use this before Prompt 1, for a dataset with no research yet. GHCN-Daily's first five runs covered these topics:

1. **About:** what the dataset is, where it is archived and served, and who makes it.
2. **QC, processing, software and formats.**
3. **Funding route:** how it is funded and how stable that is.
4. **Threats and news:** funding threats, workforce changes and news, from 2025 to now.
5. **Sources and inputs:** cuts and disruptions at the networks, instruments or satellites it depends on.

```text
Write draft web research queries for a new dataset, <DATASET NAME> (id <id>, produced by <organization>, hosted at <repositories>), so its research covers every R* subcategory in rstar_definitions/. Follow the topics of the GHCN-Daily runs in data-rstar-query-results/about-datasets/ghcn-daily/ (about, QC/processing/formats, funding route, threats and news, sources and inputs), and add queries for anything those runs never covered (see datasets-gap-queries/ghcn-daily_categorization-gaps.md: succession and ages, calibration, checksums and certification, disaster recovery).
- One file per query in data-rstar-query-results/about-datasets/<id>/queries-to-run/, named <short-id>-about_Rstar_query_pt<N>.md, with the sections "## Query to refine", "## Claude web research skill query" and "## Claude comments about the rewritten query" (the last two holding "(not written yet)").
- Check data-rstar-query-results/archives/ and instruments/ first, and add a query for any repository or instrument family not yet researched.
- Give me one /my:rewrite-research-query prompt that rewrites all of them in one session.
```

## Prompt 7: end of session

```text
I'm starting a new session. Update HANDOFF.md and any docs that changed, then commit on the develop branch.
```

## Lessons from GHCN-Daily

- **Use all the research,** not only the dataset's own folder. The archive and instrument runs fill the repository and
  infrastructure subcategories.
- **Expect some subcategories to stay unknown until asked about directly.** No GHCN-Daily run searched these:
  - succession plans;
  - ages or ORCID;
  - calibration;
  - checksums or certification;
  - disaster recovery plans.

  Prompt 6 asks for them up front.
- **Stance depends on wording.** P, D and DIRS are risks, so "For" points to risk. RRS is resilience, so "For" points to
  resilience. A subcategory with only "not searched" evidence ends up all Neutral, which is correct.
- **Check names and facts Claude adds.** Ask Claude to mark anything that didn't come from the research. For example, the
  research named Rennie and Stevens by surname only.
- **Website checks:** after a rebuild, the browser may serve the old script; do a hard refresh (Cmd-Shift-R). Run the
  e2e tests in the Terminal panel, not through Claude's Bash tool.
- **One JSON file per dataset folder:** the website loads only the first JSON file in each dataset folder, so keep one.
- **Keep the build scripts in git.** Each dataset's evidence is written by hand into `scripts/categorize/build_<id>.py`,
  which is the editable source of its JSON. Commit the script with the JSON, and don't put new scripts in `.work/`
  (git-ignored).
