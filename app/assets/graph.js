/* R* score graph: a weighted network graph of one dataset's R* scores.
   A central R* node joins the four category nodes, and each category node joins its subcategory nodes.
   Line width carries the score; an NA score is a black node with a dashed line.
   app.js calls window.RSTAR_GRAPH.render(ctx) on graph.html and passes its helpers in ctx. */
(function () {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";

  // Where each category sits around R* (degrees, 0 = right, clockwise) and its colour token in styles.css.
  // People risk (blue) and repository resilience (violet) are opposite each other: those two are the only
  // pair of the four colours that is hard to tell apart side by side.
  const LAYOUT = {
    people_risk: { angle: -135, color: "--cat-p" },
    data_risk: { angle: -45, color: "--cat-d" },
    repo_resilience: { angle: 45, color: "--cat-rrs" },
    dep_infra_resilience: { angle: 135, color: "--cat-dirs" },
  };
  const CENTER = { x: 0, y: 0, r: 58 };
  const CAT_DIST = 190; // R* to a category node
  const CAT_R = 48;
  const SUB_DIST = 168; // category node to a subcategory node
  const SUB_R = 31;
  const SPREAD = 30; // degrees between neighbouring subcategory nodes
  const PAD = 14;

  // Line widths. A subcategory line is its score ÷ 5 (35 → 7 px, from the user's notes). A category line
  // is its weighted share of R* ÷ 4 (the user's choice, 2026-11-24): the most each can add is D 40 → 10 px,
  // P 30 → 7.5 px, RRS 20 → 5 px, DIRS 10 → 2.5 px. RRS's share is 0.20 × (100 − total). A 0 is a 1 px
  // line; NA is dashed.
  const SUB_STEP = 5;
  const CAT_STEP = 4;

  // How the repository resilience subcategory lines are drawn: "risk" (points − score, so a resilient
  // repository is a thin line, matching how RRS enters R* as 100 − total) or "score" (the score itself).
  // The RRS line to R* is always its share of R*.
  let rrsMode = "risk";
  let tableOpen = false; // kept when the page re-renders

  function s(tag, attrs, children) {
    const node = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "text") node.textContent = v;
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children || [])) if (c) node.append(c);
    return node;
  }

  const polar = (cx, cy, dist, deg) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a) };
  };

  const fmt = (v) => (typeof v === "number" ? String(Math.round(v * 10) / 10) : v);

  function render(ctx) {
    const { DATA, dataset, el, isNA, main } = ctx;

    const intro = [
      el("nav", { class: "breadcrumb", "aria-label": "Breadcrumb" }, [
        el("a", { href: ctx.withDataset("index.html"), text: "All categories" }),
        " / Score graph",
      ]),
      el("h1", { text: "R* score graph" }),
    ];

    const scores = ctx.currentScores();
    if (!scores) {
      main.replaceChildren(
        ...intro,
        el("p", { class: "notice", text: `${dataset.name} has no categorization file yet, so it has no scores to graph.` })
      );
      document.title = "Score graph · R* Scores";
      return;
    }

    const isRisk = (cat) => cat.key === "repo_resilience" && rrsMode === "risk";
    // The value a line is drawn with: the score, or for RRS in risk mode, the risk (max − score).
    const lineValue = (cat, value, max) => (isNA(value) ? "NA" : isRisk(cat) ? max - value : value);
    const width = (v, step) => (isNA(v) || v === 0 ? 1 : v / step);

    function lineText(cat, value, max, step) {
      if (isNA(value)) return "dashed (NA)";
      const v = lineValue(cat, value, max);
      const w = `${fmt(width(v, step))} px`;
      return isRisk(cat) ? `${w} (risk ${fmt(v)} = ${max} − ${fmt(value)})` : `${w}${v === 0 ? " (score 0)" : ""}`;
    }

    function catLineText(share) {
      if (isNA(share)) return "dashed (NA)";
      return `${fmt(width(share, CAT_STEP))} px (adds ${fmt(share)} to R*)`;
    }

    function contribution(cat, total) {
      if (isNA(total)) return "NA";
      return Math.round(cat.weight * (cat.key === "repo_resilience" ? 100 - total : total) * 10) / 10;
    }

    // ------------------------------------------------------------ the graph
    const edges = s("g", { class: "g-edges", "aria-hidden": "true" });
    const nodes = s("g", { class: "g-nodes" });
    const bounds = { minX: -CENTER.r, maxX: CENTER.r, minY: -CENTER.r, maxY: CENTER.r };
    const grow = (p, r) => {
      bounds.minX = Math.min(bounds.minX, p.x - r);
      bounds.maxX = Math.max(bounds.maxX, p.x + r);
      bounds.minY = Math.min(bounds.minY, p.y - r);
      bounds.maxY = Math.max(bounds.maxY, p.y + r);
    };

    const tip = el("div", { class: "g-tip", "aria-hidden": "true", hidden: true });

    function nodeLink(href, label, tipLines, children) {
      const a = s("a", { href, class: "g-node", "aria-label": label }, children);
      const show = () => showTip(a, tipLines);
      a.addEventListener("mouseenter", show);
      a.addEventListener("focus", show);
      a.addEventListener("mouseleave", hideTip);
      a.addEventListener("blur", hideTip);
      return a;
    }

    function circleText(p, lines, na) {
      // lines: [[text, class], ...] stacked around the node centre.
      const gap = 15;
      const top = p.y - ((lines.length - 1) * gap) / 2;
      return lines.map(([t, cls], i) =>
        s("text", { x: p.x, y: top + i * gap, class: `${cls}${na ? " on-na" : ""}`, "text-anchor": "middle", "dominant-baseline": "central", text: t })
      );
    }

    const tableRows = [];

    for (const cat of DATA.categories) {
      const lay = LAYOUT[cat.key] || { angle: 0, color: "--muted" };
      const g = scores.groups[cat.key];
      const cp = polar(CENTER.x, CENTER.y, CAT_DIST, lay.angle);
      const catEdges = s("g", { style: `--c: var(${lay.color})` });
      const catNodes = s("g", { style: `--c: var(${lay.color})` });
      edges.append(catEdges);
      nodes.append(catNodes);

      // Category → R*
      const catLine = contribution(cat, g.total); // its weighted share of R*
      catEdges.append(
        s("line", {
          x1: cp.x, y1: cp.y, x2: CENTER.x, y2: CENTER.y,
          class: `g-edge${isNA(catLine) ? " na" : ""}`,
          "stroke-width": width(catLine, CAT_STEP),
        })
      );

      // Subcategories fan out from the category, away from R*.
      const n = cat.subcategories.length;
      cat.subcategories.forEach((sub, i) => {
        const angle = lay.angle + (i - (n - 1) / 2) * SPREAD;
        const p = polar(cp.x, cp.y, SUB_DIST, angle);
        grow(p, SUB_R + 3);
        const v = scores.subcategories[sub.id];
        const lv = lineValue(cat, v, sub.points);
        const na = isNA(v);
        catEdges.append(
          s("line", { x1: p.x, y1: p.y, x2: cp.x, y2: cp.y, class: `g-edge${na ? " na" : ""}`, "stroke-width": width(lv, SUB_STEP) })
        );
        const research = ctx.subScore(sub.id);
        const why = research ? ctx.basisText(research.basis, sub.points) : "";
        const cov = ctx.coverage(ctx.subHtml(cat.key, sub.id));
        const scoreWords = `score ${fmt(v)} of ${sub.points}`;
        catNodes.append(
          nodeLink(
            ctx.withDataset(`${cat.page}#${sub.id}`),
            `${sub.id} ${sub.title}: ${scoreWords}. Opens its card on the ${cat.title} page.`,
            [
              [`${sub.id} ${sub.title}`, "strong"],
              [`Your score: ${fmt(v)} of ${sub.points}`],
              isRisk(cat) && !na ? [`Risk drawn: ${fmt(lv)} (${sub.points} − ${fmt(v)})`] : null,
              why ? [`Web evidence: ${why}`] : null,
              [ctx.coverageText(cov)],
            ],
            [
              s("circle", { cx: p.x, cy: p.y, r: SUB_R, class: `g-circle sub${na ? " na" : ""}` }),
              ...circleText(p, [[sub.id, "g-id"], [fmt(v), "g-val"]], na),
            ]
          )
        );
        tableRows.push([sub.id, sub.title, cat.title, fmt(v), String(sub.points), lineText(cat, v, sub.points, SUB_STEP)]);
      });

      // The category node, drawn after its subcategory lines so they end at its edge.
      grow(cp, CAT_R + 3);
      const na = isNA(g.total);
      const third = `adds ${fmt(catLine)}`;
      catNodes.append(
        nodeLink(
          ctx.withDataset(cat.page),
          `${cat.title}: total ${fmt(g.total)} of ${g.max_points}, ${g.scored} of ${g.of} subcategories scored, adds ${fmt(contribution(cat, g.total))} to R*. Opens the ${cat.title} page.`,
          [
            [cat.title, "strong"],
            [`Total: ${fmt(g.total)} of ${g.max_points} · ${g.scored} of ${g.of} subcategories scored`],
            [`${ctx.weightLabel(cat)} · adds ${fmt(contribution(cat, g.total))} to R*`],
            na ? ["The total is NA because a subcategory is NA."] : null,
          ],
          [
            s("circle", { cx: cp.x, cy: cp.y, r: CAT_R, class: `g-circle cat${na ? " na" : ""}` }),
            ...circleText(cp, [[cat.prefix, "g-id big"], [fmt(g.total), "g-val big"], [third, "g-small"]], na),
          ]
        )
      );
      tableRows.push([cat.prefix, cat.title, "R*", fmt(g.total), String(g.max_points), catLineText(catLine), true]);
    }

    // R* in the middle (not a link: the summary above the graph says the same).
    const rNA = isNA(scores.rstar);
    nodes.append(
      // Black when R* is NA; red once every subcategory has a score and R* has a value.
      s("g", { class: `g-center${rNA ? "" : " scored"}`, "aria-hidden": "true" }, [
        s("circle", { cx: CENTER.x, cy: CENTER.y, r: CENTER.r, class: `g-circle center${rNA ? " na" : ""}` }),
        ...circleText(CENTER, [["R*", "g-id big"], [fmt(scores.rstar), "g-val bigger"]], rNA),
      ])
    );

    const vb = [bounds.minX - PAD, bounds.minY - PAD, bounds.maxX - bounds.minX + 2 * PAD, bounds.maxY - bounds.minY + 2 * PAD]
      .map((x) => Math.round(x))
      .join(" ");
    const graph = s(
      "svg",
      { viewBox: vb, class: "g-svg", role: "group", "aria-labelledby": "graph-caption", "aria-describedby": "graph-summary" },
      [edges, nodes]
    );

    function showTip(a, lines) {
      tip.replaceChildren(
        ...lines.filter(Boolean).map(([t, cls]) => el(cls === "strong" ? "strong" : "span", { text: t }))
      );
      tip.hidden = false;
      const wrap = tip.parentElement.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      const tw = tip.offsetWidth;
      let left = r.left - wrap.left + r.width / 2 - tw / 2;
      left = Math.max(4, Math.min(left, wrap.width - tw - 4));
      let top = r.bottom - wrap.top + 6;
      if (top + tip.offsetHeight > wrap.height) top = r.top - wrap.top - tip.offsetHeight - 6;
      tip.style.left = `${left}px`;
      tip.style.top = `${Math.max(0, top)}px`;
    }
    function hideTip() {
      tip.hidden = true;
    }

    // ------------------------------------------------------------ around it
    const naSubs = Object.values(scores.subcategories).filter(isNA).length;
    const allSubs = Object.keys(scores.subcategories).length;
    const tier = ctx.triageTier(scores.rstar);
    const one = naSubs === 1;
    const summary = el("p", { class: "graph-summary", id: "graph-summary" }, [
      "R* is ",
      el("strong", { text: fmt(scores.rstar) }),
      rNA
        ? `: ${naSubs} of ${allSubs} subcategories ${one ? "is" : "are"} NA, so ${one ? "its category" : "their categories"} ` +
          "and R* are NA too. Choose scores on the category pages to fill in the graph."
        : `${tier ? ` (triage: ${tier})` : ""}. Every subcategory has a score.`,
    ]);

    const modeField = el("fieldset", { class: "graph-options" }, [
      el("legend", { text: "Repository resilience subcategory lines show" }),
      ...[
        ["risk", "The risk it adds (points − score)"],
        ["score", "Its score"],
      ].map(([value, label]) => {
        const input = el("input", { type: "radio", name: "rrs-mode", value, checked: rrsMode === value });
        input.addEventListener("change", () => {
          if (!input.checked) return;
          rrsMode = value;
          render(ctx);
          const again = document.querySelector(`input[name="rrs-mode"][value="${value}"]`);
          if (again) again.focus();
        });
        return el("label", { class: "choice" }, [input, el("span", { text: label })]);
      }),
    ]);

    const swatch = (cls) =>
      el("span", { class: "g-key-mark", "aria-hidden": "true" }, [
        (() => {
          const k = s("svg", { viewBox: "0 0 36 14", width: "36", height: "14" });
          k.innerHTML = cls;
          return k;
        })(),
      ]);
    const legend = el("ul", { class: "graph-legend", "aria-label": "Graph key" }, [
      ...DATA.categories.map((cat) =>
        el("li", { style: `--c: var(${(LAYOUT[cat.key] || {}).color || "--muted"})` }, [
          el("span", { class: "g-key-dot", "aria-hidden": "true" }),
          `${cat.prefix}: ${cat.title}`,
        ])
      ),
      el("li", {}, [swatch('<line x1="2" y1="7" x2="34" y2="7" class="k-line" stroke-width="7"/>'), "Thicker line: higher score. Subcategory line: score ÷ 5, so 35 is 7 px. Category line: what it adds to R* ÷ 4, so D's most, 40, is 10 px"]),
      el("li", {}, [swatch('<line x1="2" y1="7" x2="34" y2="7" class="k-line" stroke-width="1"/>'), "Thin line: score 0"]),
      el("li", {}, [swatch('<line x1="2" y1="7" x2="34" y2="7" class="k-line na" stroke-width="1.5"/>'), "Dashed line and black node: NA, a score still to decide"]),
      el("li", {}, [el("span", { class: "g-key-dot rstar", "aria-hidden": "true" }), "Red R*: every subcategory has a score"]),
    ]);

    const tableId = "graph-table";
    const table = el("table", { class: "score-table graph-table" }, [
      el("caption", { class: "sr-only", text: `R* score graph for ${dataset.name} as a table` }),
      el("thead", {}, el("tr", {}, ["Node", "Name", "Joins", "Score", "Points", "Line drawn"].map((h) => el("th", { scope: "col", text: h })))),
      el(
        "tbody",
        {},
        tableRows.map(([id, name, joins, score, pts, line, isCat]) =>
          el("tr", { class: isCat ? "is-cat" : null }, [
            el("th", { scope: "row", text: id }),
            el("td", { text: name }),
            el("td", { text: joins }),
            el("td", {}, ctx.scoreValue(score === "NA" ? "NA" : Number(score), "small")),
            el("td", { text: pts }),
            el("td", { text: line }),
          ])
        )
      ),
    ]);
    const tableBox = el("div", { class: "graph-table-box", id: tableId, role: "region", "aria-labelledby": "graph-table-btn", hidden: !tableOpen }, [
      el("p", { class: "score-intro", text: `R* = ${fmt(scores.rstar)} (0.40 D + 0.30 P + 0.20 (100 − RRS) + 0.10 DIRS).` }),
      table,
    ]);
    const tableBtn = el("button", { class: "details-toggle", id: "graph-table-btn", type: "button", "aria-expanded": String(tableOpen), "aria-controls": tableId });
    tableBtn.innerHTML = ctx.CHEVRON;
    tableBtn.append(el("span", { text: "The graph as a table" }));
    tableBtn.addEventListener("click", () => {
      tableOpen = tableBtn.getAttribute("aria-expanded") !== "true";
      tableBtn.setAttribute("aria-expanded", String(tableOpen));
      tableBox.hidden = !tableOpen;
    });

    main.replaceChildren(
      ...intro,
      el("p", {
        class: "lede",
        text:
          `A weighted network graph of ${dataset.name}'s R* scores. R* sits in the middle, joined to its four ` +
          "categories, and each category is joined to its subcategories. The scores are the ones chosen on the " +
          "category pages (they start as the web evidence scores). Hover over or focus a node for its details, " +
          "and select it to open its page.",
      }),
      summary,
      el("figure", { class: "graph-panel" }, [
        el("figcaption", { id: "graph-caption", class: "sr-only", text: `R* score graph for ${dataset.name}` }),
        modeField,
        el("p", { class: "graph-scroll-hint", text: "Scroll sideways to see the whole graph." }),
        el("div", { class: "graph-wrap" }, [graph, tip]),
        legend,
      ]),
      el("div", { class: "score-actions" }, [tableBtn]),
      tableBox
    );
    document.title = "Score graph · R* Scores";
  }

  window.RSTAR_GRAPH = { render };
})();
