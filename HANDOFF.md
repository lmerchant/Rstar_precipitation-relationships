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
   relationships. Ideas are in `docs/rstar_relationship_graph/rstar_graphs.md`; the scoring formula and point values are in
   `docs/scoring/how_to_score_rstar.md` (which `app/scripts/build_data.py` reads):
   - R* = 0.40 D + 0.30 P + 0.20 (100 − RRS) + 0.10 DIRS;
   - each subcategory is worth 0 or a fixed number of points, and 0 when the evidence is missing.

The user is still deciding what the final app will be. GHCN-Daily is categorized; GPCP Daily, IMERG Late Run and
PERSIANN-CDR Daily are waiting on supplemental research, and CoCoRaHS is a new dataset not yet researched.

## Where things stand

| Piece | State |
|---|---|
| GHCN-Daily categorization | Done (third pass, 2026-11-23: 210 items; adds gap runs pt6–pt9 and the NCEI A2 run): `data-rstar-categories/datasets/ghcn-daily/ghcn-daily_rstar-categories.json`. No subcategory is empty |
| GHCN-Daily research gaps | `datasets-gap-queries/ghcn-daily_categorization-gaps.md`. All four gap runs (pt6–pt9) and the NCEI A2 run are back and copied; the note's "After the gap runs" section says what each filled and what is left (mostly unpublished, so by hand or FOIA) |
| GPCP Daily, PERSIANN-CDR Daily, IMERG Late Run | Research exists; not categorized. Coverage notes and supplemental queries written 2026-11-23 (see Research queue) |
| CoCoRaHS (new dataset, id `cocorahs`) | Six queries written 2026-11-23, none run. Needs a `datasets_metadata/json/` file before categorizing |
| Feedback on the first pass | `docs/claude_feedback/first_pass_to_categorize.md`. **Waiting on the user's answers** (see below) |
| Categorization viewer | Done: static site in `app/` (landing page plus 4 category pages) |
| e2e tests | 34 pass (17 tests × Firefox and WebKit), Python Playwright. The empty-subcategory test now empties RRS-2 by intercepting `rstar-data.js`. Avoid `all_text_contents()`: it crashes this page in Playwright's Firefox |
| Final graph app | Not started |
| Query plans and templates | `notes/dataset-query-5-part-plan.md` (five parts per dataset) and `notes/archive-query-plan.md` (three kinds of repository, and a register of repositories). Templates in `Rstar_query_results/queries/` (see Research queries) |
| Guide for sharing | `docs/rstar-query-templates-guide.md` (2026-11-23): the query design, files, how to adapt it to other climate data, and starter prompts. Written for a friend of the user who will get the files in a new GitHub repo the user is making |


## Research queries

**Two projects.** Queries and research runs live in `/Users/claude/SIDE_WORK/NYCE_project/Rstar_query_results`
(its own git repo, also on `develop`). Runs save to its `web_search_results/`; the user copies finished runs into this
project's `data-rstar-query-results/`.

**The design** (details in the two notes):
- **Five parts per dataset:** 1 overview, 2 QC/calibration/code/formats, 3 people and funding route (standard tier);
  4 threats and news, 5 threats to inputs (deep tier). Parts 1–3 keep threat words out so they stay standard.
- **Repositories:** shared archive gets A1 threats + A2 resilience, once; a producer's own data site gets A2 only (its
  threats are in the dataset's Part 4); copies get no run.
- **Runs stop at the token ceiling** (about 80% of it), not the time limit.
- **Each query tags findings** with subcategory codes and a supports/contradicts stance.

**Templates** (in `Rstar_query_results/queries/`):
- `dataset_queries/about_dataset_queries/templates/template-dataset-about_Rstar_query_pt1_overview.md` … `pt5_inputs.md`;
- `archive_queries/general_archive_queries/A1_Rstar_query_template-repository-threats.md` and
  `A2_Rstar_query_template-repository-resilience.md`.

**Research queue** (none of these is rewritten unless noted; the user runs them):

| Query | Where | State |
|---|---|---|
| GHCN-Daily pt6 (people), pt7 (repository), pt8 (infrastructure), pt9 (repository resilience) | `data-rstar-query-results/about-datasets/ghcn-daily/` | Ran 2026-11-22 to 2026-11-23; copied |
| NCEI A2 | `data-rstar-query-results/archives/noaa-ncei/2026-11-23_A2_Rstar_query-noaa_ncei/` | Ran 2026-11-23; copied. Serves GHCN-Daily, GPCP, PERSIANN-CDR and CoCoRaHS's copy (noted in their coverage notes) |
| GPCP, IMERG, PERSIANN-CDR pt7 (people and production) | `datasets-gap-queries/<id>_gap-queries/`; run sheet `datasets-gap-queries/supplemental-queries-run-sheet.md` | To rewrite and run. PERSIANN-CDR's before IMERG's (shared CHRS people) |
| NASA GES DISC + PPS A2; UC Irvine CHRS A2 | `Rstar_query_results/.../archive_specific_queries/` | To rewrite and run |
| CoCoRaHS Parts 1–5 and its data-site A2 | `Rstar_query_results/queries/dataset_queries/about_dataset_queries/cocorahs/` (with `cocorahs-run-sheet.md`) and `A2_Rstar_query-cocorahs.md` | To rewrite and run. Part 3's names (Doesken, Reges, Schumacher) are from Claude's knowledge, to confirm |
| IMERG inputs-pt6 | `data-rstar-query-results/about-datasets/imerg-late-run/` | Copied 2026-11-23 (answer, query, record only). Rechecked: its leftover gaps were added to IMERG's coverage note and pt7 query |

The coverage notes (`datasets-gap-queries/<id>_coverage-gaps.md`) are not categorizations. Categorize each dataset once,
after its gap runs come back.

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
  (tracked in git; moved from `.work/` on 2026-11-22); run it to rewrite the JSON. Each evidence item is a tuple
  `(confidence, run, text, stance)`, stance `"F"`, `"A"` or `"N"` (since the third pass). For a new dataset, copy that script, read all the answer files and
  write a gaps note in `datasets-gap-queries/`.

## Open questions for the user

**Discussion doc (2026-11-23):** `docs/claude_feedback/why-rstar-categories-are-hard-to-apply.md` (copy of the Claude
Doc at https://claude.ai/artifact/Q5rmmJHnFzAtNLHsubpZKW) sets out what makes the categories hard to apply, with
suggestions and questions the user plans to take to a colleague. It overlaps questions 2–6 below.

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
- ~~**DIRS-1's "How to find" text** is about who does processing, not calibration.~~ Fixed 2026-11-23: the DIRS
  definitions now say DIRS covers only what the dataset needs to be produced (its networks, calibration, input
  feeds and processing), not the repository (that is D-2, D-3 and RRS), and each "How to find" was rewritten to
  match. GHCN-Daily's DIRS-4 lost four NCEI-wide items as a result. The viewer shows extra paragraphs of a
  "... defined" section (`definition_more`) on the category page only.
- **Decided 2026-11-23:** DIRS-5 also counts substitutes for the dataset itself (its "How to find" says so), so
  GHCN-Daily's HadISD, Berkeley Earth and ECA&D/C3S/WIS2 items stay.
- **Still to decide:** whether D-2 and D-3 should be scoped away from the repository the same way as DIRS.
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
- `Rstar_query_results` is a separate git repo (also on `develop`) for queries and research runs. Commit query files
  there and project files here, each in its own commit.

## Next steps

**How-to for the user:** `docs/categorizing-web-searches_README.md` has the prompts for categorizing a dataset,
adding it to the website, writing gap queries and adding new research. Follow it for the other datasets.

1. **Copy finished runs into `data-rstar-query-results/`** as they come back (all runs so far are copied): dataset runs into `about-datasets/<id>/`, repository runs into `archives/<repository>/`.
2. **Review GHCN-Daily's third-pass stance calls** (listed in the session that made them; the main ones are P-2's
   retirement estimates and RRS-1's single-region items). Open questions 2–6 still need answers (for example,
   splitting RRS by repository; the repository runs now make a per-repository split possible).
3. **Categorize GPCP Daily, PERSIANN-CDR Daily and IMERG Late Run** once their pt7 and repository runs are back, using
   their coverage notes. Each needs a folder in `data-rstar-categories/datasets/` (`imerg-late-run/` doesn't exist
   yet) and a `scripts/categorize/build_<id>.py`. Re-run `build_data.py` afterwards.
4. **Research and categorize CoCoRaHS** from its run sheet; add its metadata file first.
5. **Keep the repository register in `notes/archive-query-plan.md` current** when a new dataset names a new host.
6. **Maybe add a scoring step:** the user picks 0 or the point value for each subcategory, and the app
   computes R*. The viewer plan lists this, plus confidence filters and a side-by-side dataset view, as
   later ideas.
7. **Design the network graph and knowledge graph app** from `docs/rstar_relationship_graph/rstar_graphs.md`.
8. **Keep the e2e tests passing in both browsers** as the viewer changes.
