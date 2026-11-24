# Instructions for Claude: categorizing a dataset's web research into R* evidence

Written 2026-11-24 from how GHCN-Daily was categorized (four passes, 2026-11-22 to 2026-11-23, commits `965c884`,
`98e4d45`, `56dfffc`, `c56e91e`). Follow these steps for each new dataset (GPCP Daily was the first after GHCN-Daily).
The user's own how-to with prompts is `docs/categorizing-web-searches_README.md`; this note is the working detail behind
its Prompt 1 and Prompt 5.

## 0. Read first (every time)

1. `HANDOFF.md`, if you have it: what's done and any open questions that change the rules. It is kept on the
   project owner's computer only (git-ignored), so a fresh clone won't have it; every rule this doc relies on is in
   the files below.
2. `docs/claude_feedback/rstar-categorization-decisions.md`: **the filing rules** (master copy, the user edits it).
3. The "Counts / doesn't count" table in `docs/categorizing-web-searches_README.md`: worked examples per subcategory.
4. `rstar_definitions/*.md`: each subcategory's Description, How to find and What counts as evidence, plus each group's
   scope paragraph.
5. `scripts/categorize/rstar_common.py`: the tuple format and scoring.
6. The dataset's coverage note, if any (`datasets-gap-queries/<id>_coverage-gaps.md`): hosts, versions, runs read, and
   what each gap run was meant to fill.
7. `datasets_metadata/json/<id>_dataset-metadata.json`: versions, DOIs, archives, producer.

## 1. Gather the source runs

- Every `answer_*.md` in `data-rstar-query-results/about-datasets/<id>/` (read the whole file, not just the summary).
- The `archives/` runs for each repository that holds the dataset (for NOAA CDRs: both `noaa-ncei` runs, A1 threats
  and A2 resilience).
- The `instruments/` runs for what the dataset is built from: station data → `noaa-rain-gauges`; satellite products →
  `nasa-satellites` and `noaa-satellites`. Leave out runs that don't apply, and say why in the gaps note and the
  script's docstring (GHCN-Daily left out both satellite runs).
- Note conflicts between runs as you read (two runs disagreeing on a date or a status). Keep both items; the
  subcategory goes NA.

## 2. Work out the dataset key first

Before sorting, settle:
- **Producer** (who makes it) and **whether the producer is also the repository** (`producer_is_repository`).
- **Repositories and roles:** archive of record = `parent`; mirrors and copies serving the original format with
  metadata = `child`; the producer's own data site = `producer site`. Volunteer snapshots (Data Rescue Project) and
  third-party reformatted copies (Earth Engine, Zarr stores) are **not** repositories: their facts are context.
- **Its "team", "source list" and "input list"** as named in the dataset's own documentation. This decides what counts:
  a fact counts as for/against only when a source names the dataset, or something on those lists.
- Which versions are in scope (for GPCP: the 1DD V1.3 CDR and V3.x Daily). If versions differ in producer or host, say
  so in the item text.

## 3. Sort the evidence (the main work)

Copy the structure of `scripts/categorize/build_ghcn-daily.py` into `scripts/categorize/build_<id>.py`, but write all
evidence fresh from this dataset's runs. Never reuse GHCN-Daily items, even NCEI facts: re-read the NCEI runs and word
the item for this dataset.

**Script layout:**
- Docstring: which runs were used and left out, the pass number and date, and the run command.
- Constants for each run folder name (`PT1 = "2026-11-19_gpcp-daily-about-pt1"`): these become `data-source`.
- Constants for often-cited URLs.
- One list per subcategory (`P1 = [...]`) and its gaps (`P1_GAPS = [...]`), grouped by category with a comment rule.
- `SUBCATEGORIES` dict for all 19 ids, a `DATASET` dict, then `write_categories("<id>", SUBCATEGORIES, DATASET)`.

**Each evidence item** is `(confidence, run, text, stance)`, and RRS items add a fifth field, the repository name
(matching a `DATASET` repository name, or "AWS, Google BigQuery" style when it covers several).

- **Text:** one to three sentences in plain English, specific (numbers, dates, names), with the source as a markdown
  link `[label](url)` taken from the answer file. Quote short phrases from official pages when the wording matters
  ("cannot be shared outside the US Government"). Say when something is from a search result only or was not read.
  If the fact is about a wider body (NCEI, NASA), say whether any source names this dataset.
- **Confidence:** `H` official documentation or primary record, read; `M` reliable secondary source, or a primary
  source the run flagged as partly read / indirect; `L` search-result-only, single weak source, or **any inference
  of mine** (label it "Inference:" or "Estimate:" in the text). The run's own confidence labels are a good guide.
- **Stance** toward the subcategory's statement:
  - P, D and DIRS statements are risks: `F` = evidence the risk is present, `A` = evidence it isn't.
  - RRS statements are good things: `F` = evidence of resilience, `A` = evidence against it.
  - `C` = context: not tied to the dataset or its source/input list/team (one step removed), a rejected proposal, an
    event before 2025 in D-1 or RRS-4, or a fact that doesn't show the statement true or false.
- **Scoring is automatic** (only H/M for/against count; for only = full points, against only = 0, otherwise NA).
  So the stance and confidence calls are the score. Be deliberate: one moderate "against" item turns a "for" score NA.
- **Repeat a fact in every subcategory it bears on** (no "see D-1"). Typical repeats: a repository budget in D-1,
  D-3 and RRS-4; a repository storage fact in D-2 and RRS-1; a lost source in DIRS-2 and DIRS-5.
- **Within a list, put items in reading order** (by run); the writer sorts them for, against, context.
- **Leave out** text that fits no subcategory (version histories with no risk bearing, grid details). QC methods are
  context unless they show a risk (P-3/P-4 if only one person can run it; DIRS-4 if it runs on outside systems).

**Per-subcategory reminders (from GHCN-Daily):**
- P-1: a found succession plan or handover documentation is "against"; a targeted search that found no plan is "for".
- P-2: age estimates (earliest publication year minus 25–30, FERS rules: MRA 56–57 + 30 years, 60 + 20, 62 + 5) are
  always low; a named person's departure is context for P-2 (they can't retire again) but counts in P-1/P-4.
- P-3: published code or a full algorithm paper is "against"; code not published is "for".
- P-4: one named person doing a step with no backup is "for"; a team or automation statement for this dataset is
  "against".
- D-1: pending cuts count like enacted ones; rejected proposals and pre-2025 budgets are context.
- D-4: open formats (NetCDF, CSV, text) with standard readers are "against"; reformatted third-party copies are context.
- D-5: needs a source naming the dataset (or the program); general politics is context.
- DIRS-2/3: any source or input that stops counts as "for", whatever its share.
- DIRS-5: a backup for a dependency or a substitute dataset is "against"; "no substitute" is "for".
- RRS-1: each copy sits in one region / both copies in one city is "against"; two independent sites is "for".
- RRS-2/3: checksums only at ingest/order, or a plan that "cannot be shared", give "against" or a "not public" gap.
- RRS-5: pre-2025 events count here.

**Gaps:** `(status, text)` with `S` searched and none found, `P` not public (exists but withheld, or personnel
records), `U` not searched. Keep each gap one line; the full list with possible searches goes in the gaps note.
A withheld fact is both a found context item and a `P` gap.

## 4. Build and check

```bash
python3 scripts/categorize/build_<id>.py      # writes data-rstar-categories/datasets/<id>/<id>_rstar-categories.json
python3 app/scripts/build_data.py             # rebuilds app/data/rstar-data.js
```

- The script prints each subcategory's counts and score. Look over the scores: is any score set by one item you are
  unsure of? Note it for the user.
- Keep one JSON file in the dataset folder (the site loads only the first).
- Check the dataset's pages in a browser: serve `app/` (`cd app && python3 -m http.server 3000 --bind 127.0.0.1`; on the
  owner's computer the built-in browser also has `rstar-viewer` on port 8765 in the local-only `.claude/launch.json`) and open `scores.html?dataset=<id>`, each category page, and `graph.html?dataset=<id>`. Check the console
  for errors.
- The e2e tests run in the Terminal panel, not in Bash:
  `cd app && ../.work/venv/bin/pytest` (setup in `app/README.md`).
  If a test depends on a dataset's data that changed, fix the test, not the data.
- The dashboard card's "R* scores →" link picks the dataset up from `rstar-data.js`; check it no longer says
  "Not categorized yet".

## 5. Write the gaps note

`datasets-gap-queries/<id>_categorization-gaps.md`, following `ghcn-daily_categorization-gaps.md`:
- header bullets: dataset, date and pass, output file, script, research used, research left out and why;
- a summary table (subcategory, coverage, what's missing);
- per subcategory: what was not searched, and possible searches;
- conflicts between runs, and things to check by hand (no new web search);
- evidence counts and the resulting scores.
If a coverage note exists (`<id>_coverage-gaps.md`), say in it that the categorization is done and point to the
gaps note; don't delete it.

## 6. Report to the user

- The scores per subcategory, each category total and R*.
- **The judgment calls to double-check:** items whose stance or confidence alone sets or blocks a score, items moved
  to context under the "one step removed" rule, repository roles, and conflicts between runs.
- Names or facts that came from me and not the research.
- The server command: `cd app && python3 -m http.server 3000 --bind 127.0.0.1`, then http://127.0.0.1:3000/.
- Update `HANDOFF.md` (if you have it) ("Where things stand", research queue, next steps) and the top-level `README.md` dataset table.

## Adding new research later (Prompt 5)

Add the new run constants, add items from the new answer files, and **remove items the new research makes wrong or
out of date** (and placeholders that only said "not searched"). Rewrite the Gaps lists to what is still open. Add a
"Changes from the <n>th pass" section to the gaps note with the counts added and dropped. Bump the pass number in the
script's docstring.

## Pitfalls seen

- **e2e tests use an uncategorized dataset as an example.** When a dataset gets categorized, the "not categorized yet"
  tests break (GPCP Daily, 2026-11-24: 6 tests × 2 browsers). Point them at a dataset that is still uncategorized
  (`grep -n '<id>' app/e2e/*.py`).
- **Point values:** `rstar_common.py` reads `docs/scoring/how_to_score_rstar.md`, not the decisions doc's table; the
  two disagreed on 2026-11-24 (DIRS-2, P-3, DIRS-4).
- **Satellite products (GPCP, 2026-11-24):** facts about satellites inside an input product (IMERG's microwave
  constellation, GPM as IMERG's calibrator) were counted as "for" in DIRS at moderate confidence, since the dataset's
  own documents list them. Facts about a repository that serves only an old version or a stale copy go in RRS-1 as
  "against" (copies not current).

- Two runs with the same part number (GHCN-Daily had two "pt3" runs): give each its own constant.
- Answer files cross-link to `../<run>/answer.md`, which doesn't exist here (the files are `answer_<query>.md`).
- The `guard_bash` hook blocks Bash text containing `cat.key`; use the Edit tool for `app.js`/`graph.js`.
- After a rebuild the browser may cache `rstar-data.js`: hard-refresh.
