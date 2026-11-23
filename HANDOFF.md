# Handoff

Notes for the next session: what the project is for, where things stand, and what to do next.
Last updated 2026-11-23. Update this file before compacting a session and at the end of every session
(see CLAUDE.md).

## Goal

Score precipitation datasets on the R* framework and show how risky each one is. There are four groups:
People risk (P), Data risk (D), Dependent infrastructure resilience (DIRS) and Repository resilience (RRS),
with 19 subcategories in all.

1. Web research on each dataset, its repositories and its instruments is saved in `data-rstar-query-results/`.
2. That research is sorted into the 19 subcategories as evidence (`data-rstar-categories/`).
3. A person reads the evidence and decides each subcategory: true, false, unknown or partly known.
4. The final app in `app/` shows a weighted network graph and/or knowledge graph of R* scores and dataset
   relationships. Ideas and the scoring formula are in `docs/rstar_relationship_graph/rstar_graphs.md`:
   - R* = 0.40 D + 0.30 P + 0.20 (100 − RRS) + 0.10 DIRS;
   - each subcategory is worth 0 or a fixed number of points, and 0 when the evidence is missing.

The user is still deciding what the final app will be. For now, the categorization is being tested on one
dataset to see whether the subcategory definitions need more context.

## Where things stand

| Piece | State |
|---|---|
| GHCN-Daily categorization | Done (second pass, 2026-11-22; uses the NCEI and rain-gauge runs too): `data-rstar-categories/datasets/ghcn-daily/ghcn-daily_rstar-categories.json`. No subcategory is empty |
| GHCN-Daily research gaps | `datasets-gap-queries/ghcn-daily_categorization-gaps.md`: what was never searched, per subcategory. **The user will write new web queries from it** |
| GPCP Daily, PERSIANN-CDR Daily, IMERG Late Run | Research exists in `data-rstar-query-results/about-datasets/`; not categorized |
| Feedback on the first pass | `docs/claude_feedback/first_pass_to_categorize.md`. **Waiting on the user's answers** (see below) |
| Categorization viewer | Done: static site in `app/` (landing page plus 4 category pages) |
| e2e tests | 34 pass (17 tests × Firefox and WebKit), Python Playwright. The empty-subcategory test now empties RRS-2 by intercepting `rstar-data.js`. Avoid `all_text_contents()`: it crashes this page in Playwright's Firefox |
| Final graph app | Not started |
| Five-part query plan | Written 2026-11-23: `notes/dataset-query-5-part-plan.md`. It gives five research runs per dataset, plus shared runs per repository (A1 threats, A2 resilience) and per instrument family (A4). Templates are in `Rstar_query_results/queries/dataset_queries/about_dataset_queries/templates/`, and the A2 template is in `archive_queries/general_archive_queries/` |
| GHCN-Daily gap runs | Done in `Rstar_query_results/web_search_results/`: pt7 (repository, 2026-11-22) and pt8 (infrastructure, 2026-11-23); IMERG inputs-pt6 also ran. None is copied into `data-rstar-query-results/` yet. Still to run: pt6 (people) and the NCEI A2 run (`Rstar_query_results/queries/archive_queries/archive_specific_queries/A2_Rstar_query-noaa_ncei.md`, written 2026-11-23 and not yet rewritten), which replaces pt9 |
| Supplemental queries for GPCP, IMERG, PERSIANN-CDR | Written 2026-11-23 from coverage checks (not categorizations): `datasets-gap-queries/supplemental-queries-run-sheet.md`, three `<id>_coverage-gaps.md` notes, one `pt7_people-production` query per dataset, plus repository runs `A2_Rstar_query-nasa_gesdisc_pps.md` and `A2_Rstar_query-uci_chrs.md` in `Rstar_query_results/queries/archive_queries/archive_specific_queries/`. Not rewritten or run yet. Categorize each dataset once, after these come back |
| Archive plan and CoCoRaHS | `notes/archive-query-plan.md`: three kinds of repository (shared archive: A1 + A2; producer's own data site: A2 only; copy: no run), a register of repositories, and CoCoRaHS worked through (5 dataset parts + A2; the user chose to research it as a dataset and its archive). Repository questions stay in separate A1/A2 runs. A general A1 template is in `archive_queries/general_archive_queries/`. CoCoRaHS's six queries are written (2026-11-23): Parts 1–5 and a run sheet in `Rstar_query_results/queries/dataset_queries/about_dataset_queries/cocorahs/`, and `A2_Rstar_query-cocorahs.md`. Dataset id `cocorahs`; it needs a `datasets_metadata/json/` file before categorizing |

## Categorization format

Follows `docs/create_rstar_node_files.md`:

- **One JSON file per dataset**, in `data-rstar-categories/datasets/<dataset>/`.
- **Top keys:** `people_risk`, `data_risk`, `dep_infra_resilience`, `repo_resilience`, each holding its
  subcategory keys (`P-1` … `RRS-5`).
- **Each value** is HTML: `<div class="p-1">` containing:
  - `<h4>Evidence</h4><ul class="evidence">`, where each `<li>` has `data-confidence` (high, moderate or
    low), `data-source` (the research run folder) and `data-stance` (`for`, `against` or `neutral`: how the
    item bears on the subcategory description; items are sorted in that order, and the viewer shows a tag and
    re-sorts them);
  - then `<h4>Gaps</h4><ul class="gaps">`.
- **Empty subcategory:** a bare `<div class="rrs-2"></div>`.
- **Inferences** made during categorization are labelled "inference" and given low confidence.
- **Source material:** any `answer_*.md` file in `data-rstar-query-results/` that bears on the dataset (CLAUDE.md
  allows all of it): the dataset's own runs in `about-datasets/<dataset>/`, plus the relevant `archives/` and
  `instruments/` runs.
- **How the GHCN-Daily file was made:** hand-sorted evidence in `scripts/categorize/build_ghcn-daily.py`
  (tracked in git; moved from `.work/` on 2026-11-22); run it to rewrite the JSON. For a new dataset, copy that script, read all the answer files and
  write a gaps note in `datasets-gap-queries/`.

## Open questions for the user

From `docs/claude_feedback/first_pass_to_categorize.md`. Check whether the user has answered them before
categorizing another dataset.

1. ~~Should RRS and DIRS also use `archives/` and `instruments/`?~~ Answered yes (CLAUDE.md, 2026-11-22).
   They didn't fill RRS-2, RRS-3 or DIRS-1: those topics were never searched (see the gaps note).
2. Should `repo_resilience` be split by repository (NCEI, AWS, Google), or stay pooled?
3. Should there be a data-quality subcategory? QC and processing evidence has no home in D-1 to D-5 now.
4. Should evidence shared between subcategories be repeated, or cross-referenced ("see D-1")?
5. Is the JSON and HTML format right? That covers the file name, the Evidence and Gaps lists, the
   attributes, and keeping labelled inferences.
6. Should the 2025-to-present window in D-1 and RRS-4 be enforced strictly?

Other issues raised in the feedback:

- **Unknown scores unevenly.** Missing evidence scores 0, which reads as "no risk" for P, D and DIRS but
  "no resilience" for RRS.
- **DIRS-1's "How to find" text** is about who does processing, not calibration.
- **The research never asked some questions:** succession plans, ages or ORCID, calibration, checksums,
  disaster recovery plans. Listed per subcategory, with suggested searches, in the GHCN-Daily gaps note.
- **Research file mix-ups:** two GHCN-Daily runs are both named "pt3", and the answers' cross-links point
  to `answer.md` files that don't exist.

## The viewer (`app/`)

Plan: `notes/app-categorization-viewer-plan.md`. Details: `app/README.md`.

- **How it's built:** plain HTML, CSS and JavaScript, with no dependencies. `app/scripts/build_data.py`
  reads the definitions, the point values and weights, the dataset metadata and the categorization JSON,
  and writes `app/data/rstar-data.js`.
  - **Re-run it after changing any of those inputs:**
    `python3 app/scripts/build_data.py`.
  - The pages load the data with a `<script>` tag, so they also work opened from disk.
- **Pages:** `index.html` (dataset selector, dataset details, 4 category cards with coverage chips), plus
  one page per category. On a category page each subcategory card shows its Description and "How to find"
  text and opens to show the evidence.
  - Deep links work: `people-risk.html?dataset=ghcn-daily#P-3`.
- **Viewing:** after each big change, give the user this command (CLAUDE.md):
  `cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && python3 -m http.server 3000 --bind 127.0.0.1`,
  then http://127.0.0.1:3000/.
- **Claude's own preview:** `.claude/launch.json` defines `rstar-viewer` on port 8765 for the built-in
  browser. The built-in browser can't load the CSS and JS of a page opened from disk, so serve it.
- **Accessibility:** follows the frontend-ui-engineering skill.
  - Each card's arrow is a `<button aria-expanded>` that controls a `role="region"` panel.
  - Headings go h1, then h2 (subcategory), then h3.
  - Coverage dots have screen-reader text.

## Tests

- **Tool:** Python Playwright, not npm. It lives in `.work/venv`, with versions pinned in
  `app/requirements-dev.txt`. The tests are in `app/e2e/`, and `pytest.ini` runs Firefox and WebKit only.
- **Run them in the Terminal panel,** not the Bash tool. In the sandbox, pip can't reach PyPI and servers
  can't bind ports:
  `cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && ../.work/venv/bin/pytest`
- **Rebuild the venv** if its Python disappears (Anaconda was uninstalled on 2026-11-22): the command is in
  `app/README.md`. It uses `/opt/homebrew/bin/python3` (3.15).
- **Don't remove the DYLD fix.** `~/.zshrc` sets `DYLD_LIBRARY_PATH=/opt/homebrew/lib`, which made
  Playwright's Firefox load Homebrew's libnss3 and crash. `app/e2e/conftest.py` removes the variable.
  - The user may switch the shell line to `DYLD_FALLBACK_LIBRARY_PATH`.
  - `/usr/bin/env` hides `DYLD_*` variables, so check with `echo $DYLD_LIBRARY_PATH` instead.
- **Node** (v26, Homebrew) is now installed. The tests stay on Python unless the user asks to switch.

## Repository and working conventions

- Work on `develop`; `main` has only the first commit ("add .gitignore"). Commit only when the user asks.
- `.work/` holds the venv, logs and debug scripts, and is git-ignored. `notes/` is for Claude's plans.
  `docs/` is the user's.
- Use `trash`, never `rm`.

## Next steps

**How-to for the user:** `docs/categorizing-web-searches_README.md` has the prompts for categorizing a dataset,
adding it to the website, writing gap queries and adding new research. Follow it for the other datasets.

1. **When the user's new GHCN-Daily queries come back,** add their evidence to
   `scripts/categorize/build_ghcn-daily.py`, re-run it and `app/scripts/build_data.py`, and update the gaps note.
   Open questions 2–6 still need answers (for example, splitting RRS by repository).
2. **Categorize the next datasets:** GPCP Daily, PERSIANN-CDR Daily, IMERG Late Run. Each needs a folder in
   `data-rstar-categories/datasets/`; `imerg-late-run/` doesn't exist yet. Re-run `build_data.py`
   afterwards.
3. **Maybe add a scoring step:** the user picks 0 or the point value for each subcategory, and the app
   computes R*. The viewer plan lists this, plus confidence filters and a side-by-side dataset view, as
   later ideas.
4. **Design the network graph and knowledge graph app** from `docs/rstar_relationship_graph/rstar_graphs.md`.
5. **Keep the e2e tests passing in both browsers** as the viewer changes.
