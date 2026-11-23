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
    return el("section", { class: "dataset-strip", "aria-label": "Dataset details" }, [
      el("h2", { text: dataset.name }),
      dataset.categorizations
        ? null
        : el("p", { class: "notice", text: "This dataset has no categorization file yet." }),
      fields.length
        ? el("dl", {}, fields.map(([k, v]) => el("div", {}, [el("dt", { text: k }), el("dd", { text: v })])))
        : null,
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
      datasetStrip(),
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
    neutral: { label: "Neutral", title: "Context, or points both ways" },
  };
  const STANCE_ORDER = ["for", "against", "neutral"];

  // Sort items for, against, neutral (keeping their order within a group) and say so above the list.
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
        text: `Each item is tagged for, against or neutral toward the description above, and sorted in that order: ${counts.join(" · ")}.`,
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
      li.append(meta);
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
        el("p", { class: "coverage" }, [el("span", { class: `dot ${cov.status}`, "aria-hidden": "true" }), coverageText(cov)]),
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
