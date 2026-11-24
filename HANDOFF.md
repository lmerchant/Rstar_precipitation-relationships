# Handoff

Notes for the next session: what the project is for, where things stand, and what to do next.
Last updated 2026-11-24. Update this file before compacting a session and at the end of every session
(see CLAUDE.md).

## Goal

Score precipitation datasets on the R* framework and show how risky each one is. There are four groups:
People risk (P), Data risk (D), Dependent infrastructure resilience (DIRS) and Repository resilience (RRS),
with 19 subcategories in all.

1. Web research on each dataset, its repositories and its instruments is saved in `data-rstar-query-results/`.
2. That research is sorted into the 19 subcategories as evidence (`data-rstar-categories/`).
3. Each subcategory gets a score from its evidence (full points, 0 or NA); a person decides the NA ones.
4. The final app in `app/` shows a weighted network graph and/or knowledge graph of R* scores and dataset
   relationships. Ideas are in `docs/ideas/rstar_relationship_graph/rstar_graphs.md` and `docs/ideas/R Precip dashboard.md` (the user's notes, kept out of git); the scoring formula and point values are in
   `docs/scoring/how_to_score_rstar.md` (which `app/scripts/build_data.py` reads):
   - R* = 0.40 D + 0.30 P + 0.20 (100 − RRS) + 0.10 DIRS;
   - each subcategory is worth 0 or a fixed number of points, or NA when the evidence doesn't settle it (then the
     category total and R* are NA too, and a person decides).

The user is still deciding what the final app will be. GHCN-Daily is categorized; GPCP Daily, IMERG Late Run and
PERSIANN-CDR Daily are waiting on supplemental research, and CoCoRaHS is a new dataset not yet researched.

## Where things stand

| Piece | State |
|---|---|
| GHCN-Daily categorization | Done (fourth pass, 2026-11-23: 210 items, re-sorted under the decisions doc's rules, with scores): `data-rstar-categories/datasets/ghcn-daily/ghcn-daily_rstar-categories.json`. 17 subcategories NA, RRS-2 and RRS-3 at 0, R* NA |
| GHCN-Daily research gaps | `datasets-gap-queries/ghcn-daily_categorization-gaps.md`. All four gap runs (pt6–pt9) and the NCEI A2 run are back and copied; the note's "After the gap runs" section says what each filled and what is left (mostly unpublished, so by hand or FOIA) |
| GPCP Daily, PERSIANN-CDR Daily, IMERG Late Run | Research exists; not categorized. Coverage notes and supplemental queries written 2026-11-23 (see Research queue) |
| CoCoRaHS (new dataset, id `cocorahs`) | Six queries written 2026-11-23, none run. Needs a `datasets_metadata/json/` file before categorizing |
| Feedback on the first pass | `docs/claude_feedback/first_pass_to_categorize.md`. All answered (see Open questions) |
| Categorization rules | `docs/claude_feedback/rstar-categorization-decisions.md`, the master copy the user edits (2026-11-23). All its changes are applied. No Word copies are kept in the repo (they went out of sync); the user makes one with pandoc when needed |
| Categorization viewer | Done: static site in `app/` (landing page with R* scores and key, plus 4 category pages with card scores, "Your score" radios and a category score panel) |
| e2e tests | 112 pass (56 tests × Firefox and WebKit, 2026-11-24; score choices in `app/e2e/test_scores.py`, saving in `app/e2e/test_save.py`, the score graph in `app/e2e/test_graph.py`), Python Playwright. The empty-subcategory test now empties RRS-2 by intercepting `rstar-data.js`. Avoid `all_text_contents()`: it crashes this page in Playwright's Firefox |
| Score graph (weighted network graph) | Built 2026-11-24: `app/graph.html` + `app/assets/graph.js` (see "The viewer"), with evidence nodes behind an on/off switch. Knowledge graph not started |
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

Follows `docs/create_rstar_node_files.md` (its last section lists the attributes added 2026-11-23). The filing rules
are in `docs/claude_feedback/rstar-categorization-decisions.md`; worked examples per subcategory are in the
"Counts / doesn't count" section of `docs/categorizing-web-searches_README.md`.

- **One JSON file per dataset**, in `data-rstar-categories/datasets/<dataset>/`.
- **Top keys:** `people_risk`, `data_risk`, `dep_infra_resilience`, `repo_resilience`, each holding its
  subcategory keys (`P-1` … `RRS-5`), plus `dataset` (producer, `producer_is_repository`, repositories with roles).
- **Each subcategory value** is HTML: `<div class="p-1" data-score data-score-basis data-status>` (RRS divs also
  `data-repositories`) containing:
  - `<h4>Evidence</h4><ul class="evidence">`: each `<li>` has `data-confidence` (high, moderate, low),
    `data-source` (the research run folder) and `data-stance` (`for`, `against` or `context`), sorted in that order;
    RRS items also `data-repository`;
  - then `<h4>Gaps</h4><ul class="gaps">`: each `<li>` has `data-status` (`searched-none-found`, `not-public`,
    `not-searched`).
- **Scores:** only high and moderate for/against items count. For only = full points, against only = 0, otherwise NA.
- **Inferences** are labelled "inference" and given low confidence (so they never set a score).
- **Source material:** any `answer_*.md` file in `data-rstar-query-results/` that bears on the dataset (CLAUDE.md
  allows all of it): the dataset's own runs in `about-datasets/<dataset>/`, plus the relevant `archives/` and
  `instruments/` runs.
- **How the file is made:** hand-sorted evidence in `scripts/categorize/build_<id>.py`, which calls
  `write_categories()` in `scripts/categorize/rstar_common.py` (writing, sorting and scoring). Evidence tuples are
  `(confidence, run, text, stance[, repository])` with stance `"F"`, `"A"` or `"C"`; gaps are `(status, text)` with
  `"S"`, `"P"` or `"U"`. For a new dataset, copy the GHCN-Daily script, read all the answer files and write a gaps
  note in `datasets-gap-queries/`.

## Open questions for the user

**Discussion doc (2026-11-23):** `docs/claude_feedback/why-rstar-categories-are-hard-to-apply.md` (copy of the Claude
Doc at https://claude.ai/artifact/Q5rmmJHnFzAtNLHsubpZKW) sets out what makes the categories hard to apply, with
suggestions and questions the user plans to take to a colleague. It overlaps questions 2–6 below.

**Answered and applied (2026-11-23).** The user replied under `<reply>` tags in that doc and its follow-up,
`docs/claude_feedback/why-rstar-categories-are-hard-to-apply_follow-up.md`; both are records only.

**The current rules are in `docs/claude_feedback/rstar-categorization-decisions.md`.** That local file is the master
copy: the user edits only it (the Claude Doc https://claude.ai/artifact/ESJV1iYjXaoWyHjgEyZ6X6 is no longer updated)
and makes Word or other copies with pandoc when needed (no .docx files are kept in the repo, so nothing goes out of
sync). Read it before categorizing. All its changes were made on 2026-11-23:
scope sentences in the P, D and RRS definitions; the NA scoring rule in `docs/scoring/how_to_score_rstar.md`;
"neutral" renamed "context"; gap statuses; repositories on RRS items; scores in the JSON; GHCN-Daily re-sorted; the
website's score section, key, producer sentence, card scores and repository labels; the "Counts / doesn't count" guide.

**Still open (for colleagues):** whether one station closing or only a whole network counts as a "source"; whether the
scoring decision table changes once users see mostly NA; repeating NCEI facts across subcategories; per-repository RRS.
First-pass questions 2 to 6 below are all answered.

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
- **Title:** the site is titled "R* Scores" (header, landing h1 and page titles; renamed from "R* categorizations"
  2026-11-24). The "Score details" tables show only the person's chosen scores.
- **Pages:** `index.html` (dataset selector, dataset details with the producer-is-repository sentence, the R* score
  section with a "Score details" panel, then the key to the tags and scoring, and 4 category cards with coverage
  chips), plus one page per category. On a category page each subcategory card shows its Description,
  "What counts as evidence", why the research gives its score, "Your score" radios (starting on the research score;
  no research-score badge), its status (RRS cards: the
  repositories), and opens to show the evidence. A panel beside the category description lists the chosen scores
  and the category total.
  - **Chosen scores (2026-11-23):** the radios offer full points, 0 or NA and start on the research score. The
    sentence above them states the implied score, for example "Both “for” and “against” web evidence (high or
    moderate): score = NA" (was "needs a decision"; the user's colleague is reviewing whether "score = NA" reads as
    the score implied by the web evidence). The panel's button is "Reset scores" and resets only that
    category; a second "Reset scores" beside "Score details" on the landing page resets all categories (it asks
    first). Notes are never reset. On-screen text says "web evidence
    score" for the research score. Each person's browser keeps their choices between visits (the user chose this over
    starting fresh each visit; the site will be on GitHub Pages, one form per person). Choices
    are kept in `localStorage` (`rstar-chosen-scores-v1`, shaped `{"<dataset id>": {"P-1": 35, ...}}`) and the
    category panel, landing totals and R* are worked out from them in `app.js` (`currentScores()`, same rule as
    `build_data.py`). Details in `app/README.md`.
  - **Notes and saving (2026-11-23):** each card has a "Your notes" box. The landing page's "Save your scores" panel
    (name, email, role) downloads one JSON file per save in the colleague's form format
    (`docs/json_output/example_rstar_json.json`) plus an `assessor` block; NA is `null`, notes go in
    `justification`, `scoringMethod` is `""`. Plan and the user's answers: `notes/rstar-score-json-save-plan.md`;
    changes to pass to the colleague: `notes/rstar-json-format-changes.md`; schema:
    `app/schema/rstar-assessment.schema.json`.
  - Deep links work: `people-risk.html?dataset=ghcn-daily#P-3`.
  - **"What counts as evidence" (2026-11-23):** each subcategory in `rstar_definitions/` now has a
    `#### What counts as evidence` section, a reader's version of `#### How to find`. The site shows it in place of
    "How to find", which stays as the search instructions for queries and categorizing. Edit both together when a
    definition changes.
  - **No research run names (2026-11-23):** evidence items no longer show the run folder ("repository-pt7"); readers
    don't know the files. It is still in each item's `data-source` in the JSON.
- **Score graph (2026-11-24):** `graph.html` ("Score graph" in the header, and "See the score graph →" on the landing
  score panel) draws the chosen scores as a weighted network graph in plain SVG (`assets/graph.js`, no libraries; `app.js`
  passes it its helpers through `window.RSTAR_GRAPH.render(ctx)`). R* in the middle, four category nodes in their own
  colours (`--cat-p`, `--cat-d`, `--cat-dirs`, `--cat-rrs` in `styles.css`, checked with the dataviz palette validator;
  P blue and RRS violet sit opposite because they are the hardest pair to tell apart), subcategory nodes in the parent's
  colour. Line width = score ÷ 5 (subcategory) or the category's weighted share of R* ÷ 4 (category; the user chose the
  weighted share over the total on 2026-11-24, so D's most is 10 px and DIRS's 2.5 px); 0 = 1 px; NA = black node,
  dashed line. The R* node is black while NA and red (`--rstar-bg`) once every subcategory has a score (user's
  request, 2026-11-24). **Evidence nodes (2026-11-24):** a "Show evidence nodes" switch (`role="switch"`, off by default,
  `&evidence=on` in the URL) adds one dot per evidence item (210 for GHCN-Daily, 127 set a score) in a fan outside each
  subcategory node: circle = for, diamond = against, small grey ring = context; filled = sets the score, outline = low
  confidence. Dots have hover tooltips, click through to the card, dim when another subcategory is hovered, aren't tab
  stops, and the table has an Evidence column with the counts. Plan and open questions (gaps as nodes; how to mark
  evidence from another dataset for thick lines): `notes/score-graph-evidence-nodes-plan.md`. A switch draws the RRS subcategory lines as risk (points − score, default) or score. Hover/focus tooltips, nodes link to their cards,
  and "The graph as a table" gives the same data. The header nav's accessible name changed from "Categories" to
  "Pages" (it now holds the graph link too). Choices taken from the user's notes; open design questions are in Next
  steps.
- **Viewing:** after each big change, give the user this command (CLAUDE.md):
  `cd /Users/claude/SIDE_WORK/NYCE_project/Rstar_precipitation-relationships/app && python3 -m http.server 3000 --bind 127.0.0.1`,
  then http://127.0.0.1:3000/.
- **Claude's own preview:** `.claude/launch.json` defines `rstar-viewer` (port 8765) and `rstar-viewer-2` (port 8766,
  for when another chat holds 8765) for the built-in browser. The built-in browser can't load the CSS and JS of a page opened from disk, so serve it.
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
2. **Review GHCN-Daily's fourth-pass stance calls** (listed in the session that made them): 15 items became
   context, including P-2's NCEI-wide retirements (P-2 is now NA), D-1's rejected FY2026 request, five D-5 items with
   no GHCN-Daily tie, and the Data Rescue snapshot. Also P-2's retirement estimates and RRS-1's single-region items.
3. **Categorize GPCP Daily, PERSIANN-CDR Daily and IMERG Late Run** once their pt7 and repository runs are back, using
   their coverage notes. Each needs a folder in `data-rstar-categories/datasets/` (`imerg-late-run/` doesn't exist
   yet) and a `scripts/categorize/build_<id>.py`. Re-run `build_data.py` afterwards.
4. **Research and categorize CoCoRaHS** from its run sheet; add its metadata file first.
5. **Keep the repository register in `notes/archive-query-plan.md` current** when a new dataset names a new host.
6. **Saving scores is built (download to the scorer's computer).** Still to do when wanted: "Load a saved file" to
   carry on scoring, a server that collects files (the user wants to think about this later), and
   `scripts/analyze/collect_rstar_scores.py` to turn a folder of saved files into a CSV. The user is telling the
   colleague about the format changes (`notes/rstar-json-format-changes.md`). The viewer plan also
   lists confidence filters and a side-by-side dataset view as later ideas.
7. **Score graph: review the first version with the user,** then the next pieces from
   `docs/ideas/rstar_relationship_graph/rstar_graphs.md` and `docs/ideas/R Precip dashboard.md`:
   - questions the notes left open (category lines now show their weighted share of R*, decided 2026-11-24): whether
     RRS should default to risk or score; whether lines should be red for risk rather than the category
     colour (the notes say both);
   - evidence nodes are built; still open: gaps as nodes, and an attribute marking evidence from another dataset
     (for thick lines);
   - two datasets side by side, and expert / workshop / participant versions of the same graph;
   - the separate knowledge graph (dataset, repository, people and instrument connections from the metadata files).
8. **Keep the e2e tests passing in both browsers** as the viewer changes.
