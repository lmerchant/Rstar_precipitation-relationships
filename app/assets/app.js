/* R* categorization viewer: renders the landing page and the category pages
   from window.RSTAR_DATA (built by app/scripts/build_data.py). */
(function () {
  "use strict";

  const DATA = window.RSTAR_DATA;
  const body = document.body;
  const main = document.getElementById("main");
  const header = document.getElementById("site-header");

  if (!DATA) {
    main.innerHTML =
      '<p class="notice">No data found. Run <code>python3 app/scripts/build_data.py</code> ' +
      "from the project folder, then reload this page.</p>";
    return;
  }

  // ------------------------------------------------------------ helpers
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children || [])) {
      if (c === null || c === undefined) continue;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  const params = new URLSearchParams(location.search);
  const categorized = DATA.datasets.filter((d) => d.categorizations);
  let dataset =
    DATA.datasets.find((d) => d.id === params.get("dataset")) || categorized[0] || DATA.datasets[0];

  function withDataset(href) {
    const [path, hash] = href.split("#");
    return `${path}?dataset=${encodeURIComponent(dataset.id)}${hash ? "#" + hash : ""}`;
  }

  function weightLabel(cat) {
    if (cat.weight == null) return "";
    const pct = Math.round(cat.weight * 100) + "% of R*";
    return cat.key === "repo_resilience" ? pct + " (scored as 100 − total)" : pct;
  }

  function subHtml(catKey, subId) {
    const c = dataset.categorizations;
    if (!c || !c[catKey]) return null;
    return c[catKey][subId] ?? null;
  }

  // Count evidence items and gaps in a subcategory's HTML.
  function coverage(html) {
    if (html === null) return { status: "none", evidence: 0, gaps: 0 };
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    const evidence = tpl.content.querySelectorAll("ul.evidence > li").length;
    const gaps = tpl.content.querySelectorAll("ul.gaps > li").length;
    const status = evidence === 0 ? "empty" : evidence <= 3 ? "thin" : "filled";
    return { status, evidence, gaps };
  }

  function coverageText(cov) {
    if (cov.status === "none") return "Not categorized yet for this dataset";
    if (cov.status === "empty")
      return cov.gaps ? `No evidence found · ${cov.gaps} gap${cov.gaps === 1 ? "" : "s"}` : "No evidence found";
    const e = `${cov.evidence} evidence item${cov.evidence === 1 ? "" : "s"}`;
    return cov.gaps ? `${e} · ${cov.gaps} gap${cov.gaps === 1 ? "" : "s"}` : e;
  }

  // Short label for a research run folder, e.g. 2026-11-19_ghcn-daily-about-pt1 -> about-pt1.
  function shortSource(folder) {
    return folder.replace(/^\d{4}-\d{2}-\d{2}_/, "").replace(new RegExp("^" + dataset.id + "-"), "");
  }

  // ------------------------------------------------------------- scores
  // Scores come from data-score on each subcategory's div (docs/scoring/how_to_score_rstar.md);
  // build_data.py adds the group totals and R*. "NA" means a person has to decide.
  const STATUS_LABELS = {
    found: "Found",
    "searched-none-found": "Searched, none found",
    "not-public": "Not public",
    "not-searched": "Not searched",
  };
  const BASIS_TEXT = {
    "for-only": "High or moderate “for” evidence and no “against” evidence: full points.",
    "against-only": "High or moderate “against” evidence and no “for” evidence: 0.",
    both: "Both “for” and “against” evidence (high or moderate): needs a decision.",
    none: "No high or moderate “for” or “against” evidence: needs a decision.",
  };

  function isNA(v) {
    return v === "NA" || v === null || v === undefined;
  }

  function scoreValue(v, extraClass) {
    return el("span", { class: `score-value ${isNA(v) ? "na" : "num"} ${extraClass || ""}`.trim(), text: isNA(v) ? "NA" : String(v) });
  }

  function subScore(subId) {
    return dataset.scores ? dataset.scores.subcategories[subId] : null;
  }

  function datasetInfo() {
    return (dataset.categorizations && dataset.categorizations.dataset) || null;
  }

  // ------------------------------------------------------------- header
  function renderHeader() {
    const current = body.dataset.category;
    const nav = el(
      "nav",
      { class: "cat-nav", "aria-label": "Categories" },
      DATA.categories.map((c) =>
        el("a", { href: withDataset(c.page), "aria-current": c.key === current ? "page" : null, text: c.title })
      )
    );
    const select = el(
      "select",
      { id: "dataset-select" },
      DATA.datasets.map((d) =>
        el(
          "option",
          { value: d.id, selected: d.id === dataset.id },
          d.categorizations ? d.name : `${d.name} (not categorized yet)`
        )
      )
    );
    select.addEventListener("change", () => {
      dataset = DATA.datasets.find((d) => d.id === select.value);
      const url = new URL(location.href);
      url.searchParams.set("dataset", dataset.id);
      history.replaceState(null, "", url);
      render();
    });
    header.replaceChildren(
      el("div", { class: "container" }, [
        el("a", { class: "brand", href: withDataset("index.html") }, [el("span", { text: "R*" }), " categorizations"]),
        nav,
        el("div", { class: "dataset-picker" }, [el("label", { for: "dataset-select", text: "Dataset" }), select]),
      ])
    );
  }

  // ------------------------------------------------------------ landing
  function datasetStrip() {
    const m = dataset.meta || {};
    const fields = [
      ["Archive", m.data_archive],
      ["Curator", m.curator],
      ["DOI", m.doi],
      ["Period", m.period_of_record],
      ["Updates", m.update_status],
    ].filter(([, v]) => v);
    const info = datasetInfo();
    return el("section", { class: "dataset-strip", "aria-label": "Dataset details" }, [
      el("h2", { text: dataset.name }),
      dataset.categorizations
        ? null
        : el("p", { class: "notice", text: "This dataset has no categorization file yet." }),
      fields.length
        ? el("dl", {}, fields.map(([k, v]) => el("div", {}, [el("dt", { text: k }), el("dd", { text: v })])))
        : null,
      info && info.producer_is_repository
        ? el("p", { class: "same-org" }, [
            el("strong", { text: "The producer and repository are the same organization" }),
            `: ${info.producer}. Its funding and staff facts appear in several subcategories.`,
          ])
        : null,
    ]);
  }

  // The key: what the tags mean and how scores are set.
  function keySection() {
    const table = (caption, head, rows) =>
      el("table", { class: "key-table" }, [
        el("caption", { text: caption }),
        el("thead", {}, el("tr", {}, head.map((h) => el("th", { scope: "col", text: h })))),
        el("tbody", {}, rows.map((r) => el("tr", {}, r.map((c, i) => el(i === 0 ? "th" : "td", i === 0 ? { scope: "row", text: c } : { text: c }))))),
      ]);
    return el("section", { class: "key", "aria-labelledby": "key-title" }, [
      el("h2", { id: "key-title", text: "How to read the tags and scores" }),
      el("div", { class: "key-grid" }, [
        table("Tags on each evidence item", ["Tag", "Values", "Meaning"], [
          ["Stance", "For, Against, Context", "How the item bears on the subcategory description. Context is background that is not directly tied to the dataset, or doesn't show the description true or false."],
          ["Confidence", "High, moderate, low", "How well the source supports the item. Inferences are always low."],
          ["Status", "Found; searched, none found; not public; not searched", "Every evidence item is found. Each gap gets one of the other three."],
          ["Repository", "Repository name", "Repository resilience items only: which repository the item is about."],
        ]),
        table("How a subcategory is scored", ["High or moderate evidence", "Score"], [
          ["“For” items and no “against” items", "Full points"],
          ["“Against” items and no “for” items", "0"],
          ["Both “for” and “against” items", "NA"],
          ["None: only context, only low confidence, or no evidence", "NA"],
        ]),
      ]),
      el("p", {
        class: "key-note",
        text:
          "Low-confidence and context items stay in the evidence but don't set a score. NA means there isn't enough " +
          "information and a person has to decide. A category total is NA if any of its subcategories is NA, and R* is " +
          "NA if any category total is NA. For repository resilience, “for” means resilient, so a higher score lowers R*.",
      }),
    ]);
  }

  // R* and the four category totals, with a panel listing every subcategory score.
  function scoreSection() {
    const s = dataset.scores;
    if (!s) return null;
    const tiles = [
      el("div", { class: "score-tile total" }, [
        el("span", { class: "score-label", text: "R*" }),
        scoreValue(s.rstar, "big"),
        el("span", { class: "score-note", text: "0.40 D + 0.30 P + 0.20 (100 − RRS) + 0.10 DIRS" }),
      ]),
      ...DATA.categories.map((cat) => {
        const g = s.groups[cat.key];
        return el("div", { class: "score-tile" }, [
          el("span", { class: "score-label", text: cat.title }),
          scoreValue(g.total),
          el("span", {
            class: "score-note",
            text: `${g.scored} of ${g.of} subcategories scored · out of ${g.max_points} points`,
          }),
        ]);
      }),
    ];

    const tables = DATA.categories.map((cat) =>
      el("table", { class: "score-table" }, [
        el("caption", {}, [cat.title, " · total ", scoreValue(s.groups[cat.key].total, "small")]),
        el("thead", {}, el("tr", {}, ["Subcategory", "Statement", "Points", "Score"].map((h) => el("th", { scope: "col", text: h })))),
        el(
          "tbody",
          {},
          cat.subcategories.map((sub) => {
            const e = s.subcategories[sub.id] || {};
            return el("tr", {}, [
              el("th", { scope: "row" }, el("a", { href: withDataset(`${cat.page}#${sub.id}`), text: sub.id })),
              el("td", { text: sub.title }),
              el("td", { text: sub.points != null ? String(sub.points) : "—" }),
              el("td", { title: BASIS_TEXT[e.basis] || "" }, scoreValue(e.score, "small")),
            ]);
          })
        ),
      ])
    );

    const details = el("div", { class: "score-details", id: "score-details", role: "region", "aria-labelledby": "score-details-btn", hidden: true }, tables);
    const btn = el("button", {
      class: "details-toggle",
      id: "score-details-btn",
      type: "button",
      "aria-expanded": "false",
      "aria-controls": "score-details",
    });
    btn.innerHTML = CHEVRON;
    btn.append(el("span", { text: "Score details" }));
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      details.hidden = !open;
    });

    return el("section", { class: "score-panel", "aria-labelledby": "score-title" }, [
      el("h2", { id: "score-title", text: `R* score for ${dataset.name}` }),
      el("p", {
        class: "score-intro",
        text: "Scores worked out from the web research evidence. NA marks a score a person still has to decide.",
      }),
      el("div", { class: "score-row" }, tiles),
      btn,
      details,
    ]);
  }

  function renderLanding() {
    const cards = DATA.categories.map((cat) => {
      const chips = cat.subcategories.map((s) => {
        const cov = coverage(subHtml(cat.key, s.id));
        return el("li", {}, [
          el(
            "a",
            {
              class: "chip",
              href: withDataset(`${cat.page}#${s.id}`),
              title: `${s.id}: ${s.title} — ${coverageText(cov)}`,
            },
            [
              el("span", { class: `dot ${cov.status}`, "aria-hidden": "true" }),
              s.id,
              el("span", { class: "sr-only", text: `(${coverageText(cov)})` }),
            ]
          ),
        ]);
      });
      return el("article", { class: "cat-card" }, [
        el("h2", {}, el("a", { href: withDataset(cat.page), text: cat.heading })),
        el("span", { class: "weight", text: weightLabel(cat) }),
        el("p", { text: cat.definition }),
        el("ul", { class: "chips", "aria-label": `${cat.title} subcategories` }, chips),
        el("a", { class: "cat-link", href: withDataset(cat.page) }, `Open ${cat.title} →`),
      ]);
    });

    main.replaceChildren(
      el("h1", { text: "R* categorizations" }),
      el("p", {
        class: "lede",
        text:
          "Web research on each dataset, sorted into the R* subcategories. Pick a category to read " +
          "the evidence behind each subcategory, or click a subcategory chip to jump straight to it.",
      }),
      keySection(),
      datasetStrip(),
      scoreSection(),
      el("div", { class: "cat-grid" }, cards),
      el("p", { class: "legend" }, [
        el("span", {}, [el("span", { class: "dot filled" }), "4+ evidence items"]),
        el("span", {}, [el("span", { class: "dot thin" }), "1–3 items"]),
        el("span", {}, [el("span", { class: "dot empty" }), "no evidence"]),
        el("span", {}, [el("span", { class: "dot none" }), "not categorized"]),
      ])
    );
    document.title = "R* categorizations";
  }

  // ----------------------------------------------------------- category
  const CHEVRON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  // Each evidence item may carry data-stance: how it bears on the subcategory's description.
  const STANCES = {
    for: { label: "For", title: "Supports the subcategory description" },
    against: { label: "Against", title: "Contradicts the subcategory description" },
    context: { label: "Context", title: "Background: not directly tied to the dataset, or doesn't show the description true or false" },
  };
  const STANCE_ORDER = ["for", "against", "context"];

  // Sort items for, against, context (keeping their order within a group) and say so above the list.
  function sortAndSummarizeByStance(ul) {
    const items = [...ul.children];
    if (!items.some((li) => STANCES[li.dataset.stance])) return;
    const rank = (li) => {
      const i = STANCE_ORDER.indexOf(li.dataset.stance);
      return i === -1 ? STANCE_ORDER.length : i;
    };
    items
      .map((li, i) => ({ li, i }))
      .sort((a, b) => rank(a.li) - rank(b.li) || a.i - b.i)
      .forEach(({ li }) => ul.append(li));
    const counts = STANCE_ORDER.map((s) => `${items.filter((li) => li.dataset.stance === s).length} ${s}`);
    ul.before(
      el("p", {
        class: "stance-summary",
        text: `Each item is tagged for, against or context toward the description above, and sorted in that order: ${counts.join(" · ")}.`,
      })
    );
  }

  function decoratePanel(panel) {
    // The JSON uses h4 for Evidence and Gaps; on this page they sit under an h2 card title.
    panel.querySelectorAll("h4").forEach((h) => {
      const h3 = el("h3", { text: h.textContent });
      h.replaceWith(h3);
    });
    panel.querySelectorAll("a[href]").forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
    panel.querySelectorAll("ul.evidence").forEach(sortAndSummarizeByStance);
    panel.querySelectorAll("ul.evidence > li").forEach((li) => {
      const conf = li.dataset.confidence;
      const stance = li.dataset.stance;
      const old = li.querySelector(":scope > span.confidence");
      if (old) old.remove();
      const meta = el("span", { class: "item-meta" });
      if (STANCES[stance])
        meta.append(el("span", { class: `stance ${stance}`, title: STANCES[stance].title, text: STANCES[stance].label }));
      if (conf) meta.append(el("span", { class: `badge ${conf}`, text: `${conf} confidence` }));
      if (li.dataset.source)
        meta.append(el("span", { class: "src-tag", title: li.dataset.source, text: shortSource(li.dataset.source) }));
      if (li.dataset.repository)
        meta.append(el("span", { class: "repo-tag", text: `Repository: ${li.dataset.repository}` }));
      li.append(meta);
    });
    panel.querySelectorAll("ul.gaps > li").forEach((li) => {
      const label = STATUS_LABELS[li.dataset.status];
      if (label) li.append(" ", el("span", { class: `gap-status ${li.dataset.status}`, text: label }));
    });
  }

  function setOpen(card, open) {
    const btn = card.querySelector(".toggle");
    const panel = card.querySelector(".sub-panel");
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", `${open ? "Hide" : "Show"} categorization for ${card.id}`);
    panel.hidden = !open;
    card.classList.toggle("is-open", open);
  }

  function scoreLine(s) {
    const e = subScore(s.id);
    if (!e) return null;
    const max = s.points != null ? ` of ${s.points}` : "";
    return el("p", { class: "score-line" }, [
      el("span", { class: `score-badge ${isNA(e.score) ? "na" : "num"}` }, [
        "Score ",
        el("strong", { text: isNA(e.score) ? "NA" : `${e.score}${max}` }),
      ]),
      el("span", { class: "score-why", text: BASIS_TEXT[e.basis] || "" }),
    ]);
  }

  function repositoryLine() {
    const info = datasetInfo();
    if (!info || !info.repositories || !info.repositories.length) return null;
    const n = info.repositories.length;
    return el("p", { class: "repo-line" }, [
      el("strong", { text: n === 1 ? "One repository" : `${n} repositories` }),
      `: ${info.repositories.map((r) => `${r.name} (${r.role})`).join("; ")}.`,
      n > 1 ? " The score is pooled across them." : "",
    ]);
  }

  function subCard(cat, s) {
    const html = subHtml(cat.key, s.id);
    const cov = coverage(html);
    const panelId = `panel-${s.id}`;
    const titleId = `title-${s.id}`;

    const toggle = el("button", {
      class: "toggle",
      type: "button",
      "aria-expanded": "false",
      "aria-controls": panelId,
      "aria-label": `Show categorization for ${s.id}`,
    });
    toggle.innerHTML = CHEVRON;

    const head = el("div", { class: "sub-head" }, [
      el("div", {}, [
        el("h2", { class: "sub-titleline", id: titleId }, [
          // The spaces keep the accessible name readable ("P-1 No documented ..."); flex ignores them.
          el("span", { class: "sub-id", text: s.id }),
          " ",
          el("span", { class: "sub-title", text: s.title }),
          s.points != null ? " " : null,
          s.points != null ? el("span", { class: "points", text: `${s.points} points` }) : null,
        ]),
        el("div", { class: "sub-text" }, [
          el("div", {}, [el("h3", { text: "Description" }), el("p", { text: s.description || "—" })]),
          el("div", {}, [el("h3", { text: "How to find" }), el("p", { text: s.how_to_find || "—" })]),
        ]),
        scoreLine(s),
        el("p", { class: "coverage" }, [
          el("span", { class: `dot ${cov.status}`, "aria-hidden": "true" }),
          coverageText(cov),
          subScore(s.id) && STATUS_LABELS[subScore(s.id).status] ? ` · Status: ${STATUS_LABELS[subScore(s.id).status]}` : null,
        ]),
        cat.key === "repo_resilience" ? repositoryLine() : null,
      ]),
      toggle,
    ]);

    const panel = el("div", { class: "sub-panel", id: panelId, role: "region", "aria-labelledby": titleId, hidden: true });
    if (cov.status === "none") {
      panel.append(el("p", { class: "panel-empty", text: `${dataset.name} has not been categorized yet.` }));
    } else if (cov.status === "empty" && cov.gaps === 0) {
      panel.append(el("p", { class: "panel-empty", text: "The research had nothing relevant to this subcategory." }));
    } else {
      // Our own generated HTML from data-rstar-categories/; not user input.
      panel.innerHTML = html;
      decoratePanel(panel);
    }

    const card = el("li", { class: "sub-card", id: s.id }, [head, panel]);

    // The button is the accessible control; clicking anywhere on the header also toggles,
    // except when selecting text.
    head.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      if (e.target !== toggle && !toggle.contains(e.target) && String(window.getSelection())) return;
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(card, open);
      if (open) history.replaceState(null, "", `#${s.id}`);
    });
    return card;
  }

  function renderCategory() {
    const cat = DATA.categories.find((c) => c.key === body.dataset.category);
    if (!cat) {
      main.replaceChildren(el("p", { class: "notice", text: "Unknown category." }));
      return;
    }
    const list = el("ol", { class: "sub-list" }, cat.subcategories.map((s) => subCard(cat, s)));
    const setAll = (open) => list.querySelectorAll(".sub-card").forEach((c) => setOpen(c, open));

    main.replaceChildren(
      el("nav", { class: "breadcrumb", "aria-label": "Breadcrumb" }, [
        el("a", { href: withDataset("index.html"), text: "All categories" }),
        " / ",
        cat.title,
      ]),
      el("h1", { text: cat.heading }),
      el("span", { class: "weight", text: weightLabel(cat) }),
      el("p", { class: "lede", text: cat.definition }),
      ...(cat.definition_more || []).map((t) => el("p", { class: "lede", text: t })),
      el("p", { class: "lede" }, [
        "Showing ",
        el("strong", { text: dataset.name }),
        ". Click a card to see the evidence sorted into it.",
      ]),
      el("div", { class: "toolbar" }, [
        el("button", { class: "btn", type: "button", onclick: () => setAll(true), text: "Expand all" }),
        el("button", { class: "btn", type: "button", onclick: () => setAll(false), text: "Collapse all" }),
      ]),
      list
    );
    document.title = `${cat.title} · R* categorizations`;
    openFromHash();
  }

  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const card = document.getElementById(id);
    if (card && card.classList.contains("sub-card")) {
      setOpen(card, true);
      card.scrollIntoView({ block: "start" });
      card.querySelector(".toggle").focus({ preventScroll: true });
    }
  }

  function render() {
    renderHeader();
    if (body.dataset.page === "category") renderCategory();
    else renderLanding();
  }

  window.addEventListener("hashchange", openFromHash);
  render();
})();
