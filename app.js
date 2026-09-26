/* 8U Coach — no dependencies, accounts, or network data services. */
(() => {
  "use strict";
  const KEY = "8u-coach-v1";
  const freshGame = () => ({
    running: false,
    period: 1,
    elapsed: 0,
    last: 0,
    field: [],
    stats: {},
    roles: {},
    finished: false,
  });
  const defaults = () => ({
    version: 1,
    hot: false,
    coach: "head",
    currentPractice: 1,
    completed: [],
    checks: {},
    rules: {},
    roster: [],
    game: freshGame(),
    live: null,
    nextGame: { date: "", time: "", opponent: "", location: "" },
    huddle:
      "Play hard. Help your teammates. Find space. When we lose the ball, win it back. Most importantly — have fun.",
  });
  let state = defaults(),
    storageOK = true,
    loadWarning = "";
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed.version !== 1 ||
        !Array.isArray(parsed.roster) ||
        typeof parsed.rules !== "object"
      )
        throw Error("invalid");
      state = { ...state, ...parsed };
    }
  } catch (e) {
    storageOK = false;
    loadWarning =
      "Saved data could not be read. This session is temporary; your previous saved data has not been overwritten.";
  }
  let route = "practices",
    gameTab = state.gameTab || "arrival",
    rulesTab = "ours",
    editingId = null,
    toastTimer,
    dialogReturn = null;
  const $ = (s) => document.querySelector(s),
    esc = (v) =>
      String(v ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  function save() {
    if (!storageOK) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      storageOK = false;
      showStorageWarning(
        "Device storage is unavailable or full. Changes in this session may be lost.",
      );
    }
  }
  function showStorageWarning(t) {
    $("#storage-warning").hidden = false;
    $("#storage-warning").textContent = t;
  }
  if (!storageOK) showStorageWarning(loadWarning);
  function toast(t) {
    $("#toast").textContent = t;
    $("#toast").style.display = "block";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ($("#toast").style.display = "none"), 3000);
  }
  const fmt = (s) => {
    s = Math.max(0, Math.ceil(s));
    return `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };
  const btn = (label, action, cls = "", extra = "") =>
    `<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
  const go = (label, to, cls = "") =>
    `<button class="${cls}" data-go="${to}">${label}</button>`;
  const list = (items) =>
    `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const pill = (s, cls = "") => `<span class="tag ${cls}">${esc(s)}</span>`;
  const heading = (eyebrow, title, sub = "", action = "") =>
    `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>${action}</div>`;
  const rule = (id) =>
    state.rules[id]
      ? esc(state.rules[id])
      : '<span class="unconfirmed">CONFIRM WITH LEAGUE</span>';
  const hotNotice = () =>
    state.hot
      ? '<div class="notice">HOT DAY • Use shorter play bursts, offer extra water and shade, and watch for fatigue. Follow league heat guidance.</div>'
      : "";
  function checkList(items, key) {
    return `<div class="checks">${items.map((t, i) => `<label class="check"><input type="checkbox" data-check="${key}-${i}" ${state.checks[key + "-" + i] ? "checked" : ""}>${esc(t)}</label>`).join("")}</div>`;
  }
  function icons(name) {
    const paths = {
      today: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
      practices:
        '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 12h6M9 16h6"/>',
      game: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M12 5v14"/><circle cx="12" cy="12" r="3"/>',
      team: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M18 15a4 4 0 0 1 3 4v2"/>',
      rules: '<path d="M4 3h12l4 4v14H4zM15 3v5h5M8 12h8M8 16h8"/>',
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${paths[name]}</svg>`;
  }
  function nav() {
    const active =
      route === "practice" || route === "drill" ? "practices" : route;
    $("#nav").innerHTML = [
      ["practices", "Practices"],
      ["game", "Game day"],
      ["team", "Team"],
      ["rules", "Rules"],
    ]
      .map(
        ([k, n]) =>
          `<button data-go="${k}" class="${active === k ? "active" : ""}" ${active === k ? 'aria-current="page"' : ""}>${icons(k)}${n}</button>`,
      )
      .join("");
  }
  // Functional SVG diagrams. Numbers and shapes distinguish teams without relying on color.
  function pitch(
    kind = "match",
    label = "Practice setup",
    roleNames = null,
    drillId = "",
  ) {
    const player = (x, y, n, opp = false) =>
      `<${opp ? "rect" : "circle"} ${opp ? `x="${x - 10}" y="${y - 10}" width="20" height="20" rx="3"` : `cx="${x}" cy="${y}" r="10"`} fill="${opp ? "#ffcf80" : "#b6f47b"}" stroke="#0a2118" stroke-width="2"/><text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#112616">${n}</text>`;
    const ball = (x, y) =>
      `<circle cx="${x}" cy="${y}" r="4" fill="white" stroke="#112616"/>`;
    const cone = (x, y) => `<path d="M${x} ${y - 5}l-5 9h10z" fill="#ffcf80"/>`;
    const arrow = (x, y, x2, y2) =>
      `<path d="M${x} ${y}L${x2} ${y2}" stroke="white" stroke-width="2" stroke-dasharray="5 4"/><path d="M${x2 - 4} ${y2 + 6}l4-6 4 6" fill="none" stroke="white" stroke-width="2" transform="rotate(${(Math.atan2(y2 - y, x2 - x) * 180) / Math.PI + 90} ${x2} ${y2})"/>`;
    let shapes = "";
    if (["shield", "mirror", "treasure"].includes(drillId)) {
      shapes +=
        player(146, 143, 1) +
        ball(159, 129) +
        player(165, 85, 2, true) +
        arrow(133, 115, 103, 91);
      if (drillId === "treasure") shapes += cone(165, 45);
    } else if (
      ["traffic", "arrival", "knockout", "direction", "corners"].includes(
        drillId,
      )
    ) {
      shapes +=
        player(75, 75, 1) +
        ball(89, 67) +
        player(155, 140, 2) +
        ball(170, 130) +
        player(244, 95, 3) +
        ball(259, 86) +
        arrow(180, 126, 214, 64);
      [
        [28, 28],
        [302, 28],
        [28, 183],
        [302, 183],
      ].forEach(([x, y]) => (shapes += cone(x, y)));
      if (drillId === "corners")
        [
          [45, 40],
          [260, 40],
          [45, 168],
          [260, 168],
        ].forEach(([x, y]) => (shapes += cone(x, y) + cone(x + 22, y)));
      if (drillId === "knockout") shapes += cone(115, 183) + cone(145, 183);
    } else if (["partners", "passgates"].includes(drillId)) {
      shapes +=
        player(70, 105, 1) +
        player(265, 105, 2) +
        ball(87, 104) +
        cone(165, 82) +
        cone(165, 130) +
        arrow(100, 105, 245, 105);
    } else if (drillId === "cone") {
      shapes +=
        player(80, 150, 1) +
        player(245, 150, 2) +
        ball(81, 134) +
        ball(246, 134) +
        cone(80, 50) +
        cone(245, 50) +
        arrow(80, 124, 80, 63) +
        arrow(245, 124, 245, 63);
    } else if (kind === "gates") {
      [
        [75, 60],
        [190, 55],
        [125, 135],
        [240, 140],
        [265, 65],
      ].forEach(([x, y]) => (shapes += cone(x, y) + cone(x + 24, y)));
      shapes +=
        player(65, 125, 1) +
        ball(78, 116) +
        arrow(82, 108, 90, 75) +
        player(180, 105, 2) +
        ball(193, 97) +
        player(260, 175, 3);
    } else if (kind === "passing") {
      shapes +=
        player(70, 150, 1) +
        player(165, 48, 2) +
        player(265, 150, 3) +
        ball(85, 137) +
        arrow(91, 128, 150, 66) +
        arrow(182, 63, 249, 133) +
        cone(153, 92) +
        cone(174, 104);
      if (drillId === "keepaway") shapes += player(165, 111, "D", true);
    } else if (kind === "cross") {
      shapes +=
        '<path d="M28 52h274M28 159h274" stroke="#a9c6b4" stroke-dasharray="6 5"/>';
      shapes +=
        player(65, 175, 1) +
        ball(80, 164) +
        arrow(80, 145, 82, 75) +
        player(161, 175, 2) +
        ball(174, 166) +
        player(253, 175, 3) +
        (drillId === "redlight"
          ? player(176, 40, "C", true)
          : player(176, 101, "D", true));
    } else if (kind === "huddle") {
      shapes +=
        player(100, 90, 1) +
        player(160, 60, 2) +
        player(225, 90, 3) +
        player(125, 147, 4) +
        player(202, 147, 5) +
        player(164, 107, "C", true);
    } else if (kind === "diamond") {
      shapes +=
        '<path d="M165 40 65 105 165 172 265 105Z" fill="none" stroke="#82a78e" stroke-dasharray="5 5"/>';
      [
        [165, 40, "Front"],
        [65, 105, "Left"],
        [265, 105, "Right"],
        [165, 172, "Back"],
      ].forEach(([x, y, n], i) => {
        shapes +=
          player(x, y, i + 1) +
          `<text x="${x}" y="${y + 25}" text-anchor="middle" fill="white" font-size="12">${esc(roleNames?.[i] || n)}</text>`;
      });
    } else if (["duel", "endzone"].includes(kind)) {
      shapes +=
        kind === "endzone"
          ? '<path d="M28 57h274M28 155h274" stroke="#a9c6b4" stroke-dasharray="6 5"/>'
          : '<rect x="140" y="15" width="50" height="12" fill="none" stroke="white"/><rect x="140" y="183" width="50" height="12" fill="none" stroke="white"/>';
      shapes +=
        player(155, 147, 1) +
        ball(169, 132) +
        player(178, 88, 2, true) +
        arrow(128, 132, 109, 62);
    } else if (kind === "shoot") {
      shapes +=
        '<rect x="120" y="16" width="90" height="12" fill="none" stroke="white"/>';
      shapes +=
        player(112, 150, 1) +
        ball(125, 136) +
        arrow(133, 122, 162, 40) +
        player(242, 151, 2) +
        cone(74, 167) +
        cone(260, 167);
    } else if (kind === "wide") {
      [
        [55, 20],
        [231, 20],
        [55, 184],
        [231, 184],
      ].forEach(
        ([x, y]) =>
          (shapes += `<rect x="${x}" y="${y}" width="44" height="9" fill="none" stroke="white"/>`),
      );
      shapes +=
        player(82, 140, 1) +
        ball(90, 124) +
        (drillId === "twogoal" ? "" : player(232, 136, 2)) +
        player(157, 74, 3, true) +
        (["wide", "twogoalgame"].includes(drillId)
          ? player(241, 72, 4, true)
          : "") +
        arrow(97, 110, 90, 43);
    } else {
      shapes +=
        '<path d="M28 105h274" stroke="#82a78e"/><circle cx="165" cy="105" r="28" fill="none" stroke="#82a78e"/><rect x="140" y="15" width="50" height="12" fill="none" stroke="white"/><rect x="140" y="183" width="50" height="12" fill="none" stroke="white"/>';
      shapes +=
        player(80, 146, 1) +
        player(234, 132, 2) +
        (["2v2", "2tournament", "2transition"].includes(drillId)
          ? ""
          : player(164, 165, 3)) +
        ball(93, 131) +
        player(101, 65, 4, true) +
        player(237, 65, 5, true) +
        (["2v2", "2tournament", "2transition"].includes(drillId)
          ? ""
          : player(166, 45, 6, true)) +
        arrow(106, 122, 122, 88);
      if (kind === "restart")
        shapes += cone(30, 30) + ball(36, 43) + arrow(39, 48, 85, 72);
    }
    return `<svg class="pitch" viewBox="0 0 330 215" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><rect x="28" y="28" width="274" height="155" fill="none" stroke="#a9c6b4" stroke-width="1.5"/>${shapes}</svg>`;
  }
  const legend =
    '<p class="legend">● Player · ■ Opponent · △ Cone · small white dot: ball · dashed arrow: movement · outlined box: goal. Layout is schematic.</p>';
  function today() {
    const p =
      PRACTICES.find((x) => x.id === state.currentPractice) || PRACTICES[0];
    return (
      heading(
        "READY FOR THE FIELD",
        "Let’s get them playing.",
        "Your next session, ready to run.",
        pill(
          state.coach === "head" ? "HEAD COACH" : "ASSISTANT COACH",
          "green",
        ),
      ) +
      `<div class="grid"><div class="stack"><section class="card feature"><div class="row">${pill("NEXT PRACTICE", "green")}<span class="small muted">${String(p.id).padStart(2, "0")} / 12</span></div><div class="space"><div class="eyebrow">${esc(p.focus)} · 60 MIN</div><h2>${esc(p.title)}</h2><p>${esc(p.objective)}</p></div>${pitch("gates", "Dribbling through cone gates")}<div class="gap space">${btn(state.live ? "Resume practice" : "Start practice", state.live ? "resumeLive" : "startPractice", "primary", `data-id="${p.id}"`)}${go("View plan", `practice/${p.id}`)}</div></section><section class="card"><div class="row"><h2>Ready bag</h2>${btn("Reset", "resetChecks", "link", 'data-key="bag"')}</div>${checkList(["Balls", "Cones", "Pinnies", "Water", "Roster", "First aid"], "bag")}</section></div><div class="stack"><section class="card"><div class="row"><div class="eyebrow">NEXT GAME</div>${btn("Edit", "editGame", "link")}</div><h2>${esc(state.nextGame.opponent || "Game day starts here")}</h2><p class="muted">${state.nextGame.date ? esc(formatDate(state.nextGame.date)) : "Add your next game"}${state.nextGame.time ? " · " + esc(state.nextGame.time) : ""}<br>${esc(state.nextGame.location || "Date, time, and field all in one place.")}</p>${go("Open game day", "game", "wide")}</section><section class="card"><h2>One voice. Simple cues.</h2><div class="eyebrow">WE HAVE THE BALL</div><p>Find space. Go forward. Look for a teammate or the goal.</p><div class="eyebrow space">THEY HAVE THE BALL</div><p>Get between the ball and our goal. Slow them down. Win it back.</p></section><section class="card"><label class="switch"><input type="checkbox" id="hot" ${state.hot ? "checked" : ""}><span><strong>Hot day mode</strong><br><span class="muted small">More water. Shorter play bursts.</span></span></label>${hotNotice()}</section></div></div><p class="footer-note">${state.completed.length} / 12 practices completed · ${state.roster.length} players on this device · ${storageOK ? "Changes save automatically" : "Temporary session"}</p>`
    );
  }
  function formatDate(d) {
    return new Date(d + "T12:00:00").toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  function practices() {
    const p =
      PRACTICES.find((x) => x.id === state.currentPractice) || PRACTICES[0];
    return (
      heading(
        "READY FOR PRACTICE",
        "Let’s get them playing.",
        "Your next session and the full season, together.",
      ) +
      `<div class="grid"><div class="stack"><section class="card feature"><div class="row">${pill("NEXT PRACTICE", "green")}<span class="small muted">${String(p.id).padStart(2, "0")} / 12</span></div><div class="space"><div class="eyebrow">${esc(p.focus)} · 60 MIN</div><h2>${esc(p.title)}</h2><p>${esc(p.objective)}</p></div>${pitch("gates", "Dribbling through cone gates")}<div class="gap space">${btn(state.live ? "Resume practice" : "Start practice", state.live ? "resumeLive" : "startPractice", "primary", `data-id="${p.id}"`)}${go("View plan", `practice/${p.id}`)}</div></section></div><div class="stack"><section class="card"><div class="row"><h2>Ready bag</h2>${btn("Reset", "resetChecks", "link", 'data-key="bag"')}</div>${checkList(["Balls", "Cones", "Pinnies", "Water", "Roster", "First aid"], "bag")}</section><section class="card"><h2>One voice. Simple cues.</h2><div class="eyebrow">WE HAVE THE BALL</div><p>Find space. Go forward. Look for a teammate or the goal.</p><div class="eyebrow space">THEY HAVE THE BALL</div><p>Get between the ball and our goal. Slow them down. Win it back.</p></section><section class="card"><label class="switch"><input type="checkbox" id="hot" ${state.hot ? "checked" : ""}><span><strong>Hot day mode</strong><br><span class="muted small">More water. Shorter play bursts.</span></span></label>${hotNotice()}</section></div></div><div class="space">${heading("THE SEASON", "Small steps. Big confidence.", "10 core practices + 2 optional sessions. Every plan is 60 minutes.")}<div class="practice-list">${PRACTICES.map((plan) => `<button class="card practice-card" data-go="practice/${plan.id}"><div class="row"><span class="num">${String(plan.id).padStart(2, "0")}</span>${pill(state.completed.includes(plan.id) ? "COMPLETE" : plan.bonus ? "BONUS" : "60 MIN", state.completed.includes(plan.id) ? "green" : "")}</div><h2>${esc(plan.title)}</h2><p class="muted">${esc(plan.focus)}</p><span class="small" style="color:var(--green)">Open practice →</span></button>`).join("")}</div></div><p class="footer-note">${state.completed.length} / 12 practices completed · ${state.roster.length} players on this device · ${storageOK ? "Changes save automatically" : "Temporary session"}</p>`
    );
  }
  function practice(id) {
    const p = PRACTICES.find((x) => x.id === id) || PRACTICES[0];
    let min = 0;
    return (
      heading(
        `PRACTICE ${String(p.id).padStart(2, "0")} · 60 MIN`,
        esc(p.title),
        esc(p.objective),
        go("All plans", "practices"),
      ) +
      `<div class="grid"><section class="card"><div class="row"><h2>The session</h2>${pill(p.bonus ? "OPTIONAL" : "CORE PLAN", "green")}</div><ol class="timeline">${p.activities
        .map((a, i) => {
          const start = min;
          min += a.minutes;
          return `<li><button data-go="drill/${p.id}/${i}"><span class="minute">${start}–${min}<br>min</span><span><strong>${esc(DRILLS[a.drill].name)}</strong><small>${a.minutes} minutes · Setup & coaching →</small></span></button></li>`;
        })
        .join(
          "",
        )}</ol></section><aside class="stack"><section class="card feature"><div class="eyebrow">ONE QUESTION TO KEEP</div><p class="cue">“${esc(p.question)}”</p><p class="muted">Fun, ball contact, and decisions. Keep explanations short and let them play.</p>${btn("Start this practice", "startPractice", "primary wide", `data-id="${p.id}"`)}<div class="gap space">${btn("Set as next practice", "setNext", "", `data-id="${p.id}"`)}${btn(state.completed.includes(p.id) ? "Mark incomplete" : "Mark complete", "toggleComplete", "", `data-id="${p.id}"`)}</div></section><section class="card"><h3>Two coaches, one plan</h3><p><strong>Head:</strong> demonstrate briefly, ask one question, observe.</p><p><strong>Assistant:</strong> organize players, set up the next grid, keep balls and water ready.</p></section>${hotNotice()}</aside></div>`
    );
  }
  function restartRules() {
    return `<div class="notice">Use confirmed local rules. Do not run an unconfirmed restart example.</div><dl class="rules-list">${["kickoff", "touchline", "goalkick", "corner", "freekick", "distance"].map((k) => `<div><dt>${esc(RULE_FIELDS.find((f) => f[0] === k)[1])}</dt><dd>${rule(k)}</dd></div>`).join("")}</dl>${go("Confirm league rules", "league", "space")}`;
  }
  function roleCard(d) {
    return `<section class="role ${state.coach === "assistant" ? "emphasized" : ""}"><h3>Assistant coach</h3><p>${esc(d.assistant)}</p></section>`;
  }
  function drillDetail(pid, index) {
    const p = PRACTICES.find((x) => x.id === pid) || PRACTICES[0],
      a = p.activities[index] || p.activities[0],
      d = DRILLS[a.drill];
    return (
      heading(
        `PRACTICE ${p.id} · ACTIVITY ${index + 1} / 6`,
        esc(d.name),
        `${a.minutes} minutes · ${esc(d.players)}`,
        go("Back to plan", `practice/${p.id}`),
      ) +
      `<div class="grid"><div class="stack"><section class="card">${pitch(d.kind, d.name + " setup", null, d.id)}${legend}<p><strong>Area:</strong> ${esc(d.grid)} <span class="muted small">(adjust for space and ability)</span></p><p><strong>Equipment:</strong> ${esc(d.equipment)}</p><h3>Set up</h3><p>${esc(d.setup)}</p></section><section class="card"><h2>How to play</h2>${a.note ? `<div class="notice green">${esc(a.note)}</div>` : ""}<ol>${d.play.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>${d.kind === "restart" ? restartRules() : ""}</section></div><div class="stack"><section class="card"><div class="eyebrow">THE GOAL</div><p>${esc(d.objective)}</p><p class="cue">${d.cues.map(esc).join("<br>")}</p><h3>Success looks like</h3><p>${esc(d.success)}</p><h3>Watch for</h3><p class="muted">${esc(d.mistakes)}</p></section>${roleCard(d)}<section class="card"><h2>Adjust on the field</h2>${[
        ["Make it easier", d.easier],
        ["Make it harder", d.harder],
        ["Fewer players", d.low],
        ["More players", d.high],
      ]
        .map(
          ([t, v]) =>
            `<details class="accordion"><summary>${t}</summary><p>${esc(v)}</p></details>`,
        )
        .join("")}</section></div></div>`
    );
  }
  function remaining(l = state.live) {
    return l.running
      ? Math.max(0, (l.deadline - Date.now()) / 1000)
      : l.remaining;
  }
  function settleLive() {
    const l = state.live;
    if (!l) return;
    if (l.running && remaining(l) <= 0) {
      l.running = false;
      l.remaining = 0;
      save();
      if (route === "live") render();
    }
  }
  function live() {
    const l = state.live;
    if (!l)
      return `<div class="empty"><h1>Pick a practice to begin.</h1>${go("Browse practices", "practices", "primary")}</div>`;
    const p = PRACTICES[l.practice - 1],
      a = p.activities[l.index],
      d = DRILLS[a.drill];
    return `<div class="live"><div class="row"><div class="eyebrow">PRACTICE ${p.id} · ${esc(p.title)}</div>${go("Exit live", "today")}</div><div class="progress" aria-label="Activity ${l.index + 1} of 6">${p.activities.map((a, i) => `<span class="${i < l.index ? "done" : i === l.index ? "current" : ""}"></span>`).join("")}</div>${l.water ? `<section class="card water"><div class="eyebrow">WATER BREAK · ACTIVITY PAUSED</div><h1>Drink. Shade. Check in.</h1><div class="timer" id="water-clock">${fmt((l.water.end - Date.now()) / 1000)}</div><p>The break ends when you choose. Check everyone is ready.</p>${btn("Resume activity", "waterEnd", "primary wide")}</section>` : `<div class="row"><h1 class="live-title">${esc(d.name)}</h1>${pill(l.index + 1 + " / 6", "green")}</div><div class="timer-box"><div class="timer" id="practice-clock">${fmt(remaining())}</div><p id="practice-status" class="muted">${l.running ? "Activity running" : remaining() === 0 ? "Time is up — choose Next when ready" : "Paused"}</p><span class="small muted">Plan remaining <strong id="plan-clock">${fmt(planRemaining())}</strong> · extra breaks extend the session</span></div><div class="controls">${btn("Previous", "previous", "", l.index === 0 ? "disabled" : "")}${btn(l.running ? "Pause" : "Resume", "pause", "primary")}${btn(l.index === 5 ? "Finish" : "Next", "next")}</div><div class="controls space">${btn("+1 min", "addMinute")}${btn("Water", "water", "water")}${btn("Skip", "skip")}</div>${hotNotice()}<div class="live-grid space"><section class="card">${state.coach === "assistant" ? roleCard(d) : `<div class="eyebrow">HEAD COACH CUES</div><p class="cue">${d.cues.map(esc).join("<br>")}</p>`}<p class="small space"><strong>Equipment:</strong> ${esc(d.equipment)}</p>${a.note ? `<p class="small">${esc(a.note)}</p>` : ""}<p class="small">${esc(state.coach === "assistant" ? d.setup : d.play[0])}</p>${btn("Full activity instructions", "liveDetail", "wide")}</section><section class="card">${pitch(d.kind, d.name + " live setup", null, d.id)}<p class="small muted space">${esc(d.grid)}</p>${state.coach === "assistant" ? `<p class="small"><strong>Head coach:</strong> ${esc(d.cues[0])}</p>` : roleCard(d)}</section></div><p class="small muted space">NEXT: ${l.index < 5 ? esc(DRILLS[p.activities[l.index + 1].drill].name) : "Celebrate effort. Practice complete."}</p>`}</div>`;
  }
  function planRemaining() {
    const l = state.live;
    return (
      remaining() +
      PRACTICES[l.practice - 1].activities
        .slice(l.index + 1)
        .reduce((sum, a) => sum + a.minutes * 60, 0)
    );
  }
  function startPractice(id) {
    if (state.live) {
      confirmDialog(
        "Replace the saved practice?",
        "Your current practice progress will be replaced. Completed practices stay saved.",
        () => initPractice(id),
      );
      return;
    }
    initPractice(id);
  }
  function initPractice(id) {
    if (state.game.running) {
      toast("Pause the game clock before starting practice.");
      return;
    }
    const p = PRACTICES[id - 1];
    state.currentPractice = id;
    state.live = {
      practice: id,
      index: 0,
      running: true,
      remaining: p.activities[0].minutes * 60,
      deadline: Date.now() + p.activities[0].minutes * 60000,
      water: null,
    };
    save();
    navigate("live");
  }
  function stepPractice(dir) {
    const l = state.live;
    if (!l || l.water) return;
    if (l.index + dir > 5) {
      confirmDialog(
        "Finish this practice?",
        "Mark the practice complete and clear the live timer.",
        () => {
          if (!state.completed.includes(l.practice))
            state.completed.push(l.practice);
          state.currentPractice = Math.min(12, l.practice + 1);
          state.live = null;
          save();
          navigate("practices");
          toast("Practice complete. Great work, coach.");
        },
      );
      return;
    }
    l.index = Math.max(0, l.index + dir);
    l.remaining = PRACTICES[l.practice - 1].activities[l.index].minutes * 60;
    l.deadline = Date.now() + l.remaining * 1000;
    l.running = true;
    save();
    render();
  }
  function gameConfig() {
    const n = Number(state.rules.players),
      duration = Number(state.rules.duration),
      periods = Number(state.rules.periods);
    return {
      n,
      duration,
      periods,
      valid:
        Number.isInteger(n) &&
        n >= 1 &&
        n <= 11 &&
        duration > 0 &&
        duration <= 180 &&
        [2, 4].includes(periods) &&
        ["Yes", "No"].includes(state.rules.goalkeeper),
    };
  }
  function syncGame() {
    const g = state.game;
    if (!g.running) return;
    const cfg = gameConfig();
    if (!cfg.valid) {
      g.running = false;
      save();
      return;
    }
    const now = Date.now(),
      delta = Math.min(
        Math.max(0, (now - g.last) / 1000),
        Math.max(0, (cfg.duration * 60) / cfg.periods - g.elapsed),
      );
    g.elapsed += delta;
    g.last = now;
    g.field.forEach((id) => {
      const s =
        g.stats[id] ||
        (g.stats[id] = { seconds: 0, periods: [], positions: [] });
      s.seconds += delta;
      if (delta > 0 && !s.periods.includes(g.period)) s.periods.push(g.period);
      const role = g.roles[id];
      if (delta > 0 && role && !s.positions.includes(role))
        s.positions.push(role);
    });
    if (g.elapsed >= (cfg.duration * 60) / cfg.periods) {
      g.running = false;
      save();
      if (route === "game") render();
    }
  }
  function playerName(p) {
    return p.name + (p.initial ? " " + p.initial + "." : "");
  }
  function roles() {
    const c = gameConfig();
    if (c.n === 4 && state.rules.goalkeeper === "No")
      return ["Front", "Left", "Right", "Back"];
    return state.rules.goalkeeper === "Yes"
      ? ["Goalkeeper", "Field"]
      : ["Field"];
  }
  function playerRow(p, mode = "game") {
    const g = state.game,
      s = g.stats[p.id] || { seconds: 0, periods: [], positions: [] },
      on = g.field.includes(p.id);
    return `<div class="player"><span class="jersey">${esc(p.number || "—")}</span><div class="player-info"><strong>${esc(playerName(p))}</strong><small>${mode === "team" ? (p.present ? "Present today" : "Absent today") : `${on ? "On field" : p.present ? "Resting" : "Absent"} · ${s.periods.length} periods played`}</small>${mode === "game" && s.positions.length ? `<small>Tried: ${s.positions.map(esc).join(", ")}</small>` : ""}</div>${
      mode === "team"
        ? `<div class="player-actions">${btn(p.present ? "Present" : "Absent", "attendance", "", `data-id="${p.id}" aria-pressed="${p.present}"`)}${btn("Edit", "editPlayer", "", `data-id="${p.id}"`)}</div>`
        : `<div class="time" data-playtime="${p.id}">${fmt(s.seconds)}</div><div class="player-actions">${
            on
              ? `<select aria-label="Position for ${esc(playerName(p))}" data-role="${p.id}">${roles()
                  .map(
                    (r) =>
                      `<option ${g.roles[p.id] === r ? "selected" : ""}>${r}</option>`,
                  )
                  .join(
                    "",
                  )}</select>${btn("Rest", "rest", "", `data-id="${p.id}"`)}`
              : p.present
                ? btn(
                    g.field.length < gameConfig().n ? "Put in" : "Sub in",
                    "putIn",
                    "",
                    `data-id="${p.id}"`,
                  )
                : ""
          }</div>`
    }</div>`;
  }
  function game() {
    syncGame();
    const cfg = gameConfig(),
      g = state.game;
    const tabs = [
      "arrival",
      "warm-up",
      "lineup",
      "rotations",
      "coaching",
      "halftime",
      "postgame",
    ];
    let body = "";
    if (gameTab === "arrival")
      body = `<div class="grid"><section class="card"><div class="row"><h2>Before players arrive</h2>${btn("Reset", "resetChecks", "link", 'data-key="arrival"')}</div>${checkList(CUES.arrival, "arrival")}</section><div class="stack"><section class="card"><div class="eyebrow">${state.coach === "assistant" ? "YOUR JOB · ASSISTANT" : "YOUR JOB · HEAD COACH"}</div><h2>${state.coach === "assistant" ? "Keep the sideline ready." : "Watch the game. Encourage."}</h2><p>${state.coach === "assistant" ? "Check attendance, prepare rotations, manage water, and get the next players ready." : "Observe decisions, give occasional short cues, and handle the referee and halftime message."}</p>${go("Check attendance", "team", "wide")}</section><section class="card"><h3>Game details</h3><p>${esc(state.nextGame.opponent || "Opponent not entered")}<br>${esc(state.nextGame.date ? formatDate(state.nextGame.date) : "Date not entered")} ${esc(state.nextGame.time)}<br>${esc(state.nextGame.location || "Location not entered")}</p>${btn("Edit game details", "editGame")}</section></div></div>`;
    if (gameTab === "warm-up")
      body = `<div class="grid"><section class="card"><h2>20 minutes to kickoff</h2><ol class="timeline">${[
        ["20–15", "Ball each", "Dribble, turn, and explore. No lines."],
        [
          "15–10",
          "Familiar dribbling game",
          "Use Red Light / Green Light or Gates.",
        ],
        [
          "10–5",
          "1v1 or short shooting",
          "Many balls, short rounds, quick turns.",
        ],
        [
          "5–0",
          "Water + team talk",
          "Find space. Go toward goal. Win it back.",
        ],
      ]
        .map(
          ([n, t, d]) =>
            `<li><div class="row"><strong>${n} min</strong><span class="tag">BEFORE KICKOFF</span></div><h3 class="space">${t}</h3><p class="muted">${d}</p></li>`,
        )
        .join(
          "",
        )}</ol></section><section class="card"><div class="row"><h2>Our huddle</h2>${btn("Edit", "editHuddle", "link")}</div><p class="cue">${esc(state.huddle)}</p><p class="muted">A few words, then let them play.</p></section></div>`;
    if (["lineup", "rotations"].includes(gameTab)) {
      const present = state.roster.filter((p) => p.present),
        on = state.roster.filter((p) => g.field.includes(p.id)),
        rest = present
          .filter((p) => !g.field.includes(p.id))
          .sort(
            (a, b) =>
              (g.stats[a.id]?.seconds || 0) - (g.stats[b.id]?.seconds || 0),
          );
      body = `${!cfg.valid ? `<div class="notice">Confirm players per side, goalkeeper, total minutes, and halves/quarters before using the game clock. ${go("League setup", "league")}</div>` : ""}<section class="card"><div class="row wrap"><div><div class="eyebrow">${g.finished ? "GAME FINISHED" : `${cfg.periods === 4 ? "QUARTER" : "PERIOD"} ${g.period}${cfg.valid ? " / " + cfg.periods : ""}`}</div><div class="stat" id="game-clock">${fmt(g.elapsed)}</div><span class="small muted">${g.running ? "Playing time is counting" : g.finished ? "Final approximate playing time" : "Clock paused"}${cfg.valid ? " · " + cfg.duration / cfg.periods + " min per period" : ""}</span></div><div class="gap">${btn(g.running ? "Pause game" : g.finished ? "Game finished" : "Start / resume", "gameClock", "primary", !cfg.valid || g.finished ? "disabled" : "")}${btn(cfg.valid && g.period >= cfg.periods ? "Finish game" : "Next period", "nextPeriod", "", !cfg.valid || g.finished ? "disabled" : "")}${btn("New game", "newGame")}</div></div><p class="summary-line space">Substitutions: ${rule("subs")}<br>Minimum playing requirement: ${rule("minimum")}</p><p class="small muted">Clock continues when the phone locks. Pause at stoppages and period ends. Times are approximate.</p></section><div class="grid space"><section class="card"><div class="row"><h2>On field</h2>${pill(on.length + " / " + (cfg.valid ? cfg.n : "?"), "green")}</div>${on.length ? on.map((p) => playerRow(p)).join("") : '<p class="muted">Choose present players below to build your lineup.</p>'}${cfg.n === 4 && state.rules.goalkeeper === "No" ? `<details class="accordion space"><summary>The 1–2–1 diamond</summary>${pitch("diamond", "Four-player diamond: front, left, right, back")}${legend}<p>Width, depth, and height. Everyone attacks and defends. Rotate roles; this is a teaching tool, not a fixed formation.</p></details>` : ""}</section><section class="card"><div class="row"><h2>Next in / resting</h2>${btn("Suggest rotation", "suggest", "", !cfg.valid || !rest.length ? "disabled" : "")}</div><p class="small muted">Least playing time first. Every substitution needs your choice.</p>${rest.length ? rest.map((p) => playerRow(p)).join("") : '<p class="muted">No resting players. Add your roster and check attendance.</p>'}${go("Manage team", "team", "space")}</section></div>`;
      if (!present.length)
        body += `<section class="card empty space"><h2>Build your team first.</h2><p>Add first names and jersey numbers on this device.</p>${go("Add players", "team", "primary")}</section>`;
    }
    if (gameTab === "coaching")
      body = `<div class="grid"><section class="card"><h2>Watch the decisions.</h2><h3>Attacking</h3>${list(["Looks up and finds open space", "Tries to go forward or beat a player", "Recognizes an open teammate", "Teammates offer space instead of crowding"])}<h3>Defending</h3>${list(["Nearest player slows the ball carrier", "Teammates recover toward their own goal", "Everyone tries to win it back and help"])}<h3>Development</h3><p>Bravery, both feet, new ideas, recovery after mistakes, effort, and teamwork.</p></section><div class="stack"><section class="card"><h2>One voice at a time.</h2><p><strong>Head:</strong> watch play, encourage, speak to referee when needed, lead halftime.</p><p><strong>Assistant:</strong> substitutions, time, next players, water, and engaged resting players.</p><p class="muted">Avoid competing tactical instructions.</p></section><section class="card"><h3>Give a cue, then space.</h3>${list(CUES.general)}<p class="muted">Avoid constant “PASS!”, “SHOOT!”, “GO LEFT!”, or “NO!”</p></section></div></div>`;
    if (gameTab === "halftime")
      body = `<section class="card"><div class="eyebrow">WATER FIRST · THREE SHORT POINTS</div><ol class="timeline"><li><h2>01 / Praise one thing</h2><p>“I love how we’re trying to dribble forward.”</p></li><li><h2>02 / Fix one thing</h2><p>“When they have the ball, get between them and our goal.”</p></li><li><h2>03 / Give one challenge</h2><p>“Let’s see if everyone can try to beat a player.”</p></li></ol></section>`;
    if (gameTab === "postgame")
      body = `<div class="grid"><section class="card"><div class="eyebrow">60–90 SECOND HUDDLE</div><h2>Finish positive.</h2><h3>Celebrate</h3><p>Name something the team did well.</p><h3>Effort</h3><p>Praise bravery, persistence, or teamwork.</p><h3>Next step</h3><p>Connect one thing to ${esc(PRACTICES[state.currentPractice - 1].title)}.</p>${g.running ? btn("Pause the game clock", "gameClock", "primary") : ""}</section><section class="card"><h2>Playing-time check</h2><p class="small muted">Approximate minutes from this game. Lowest first.</p>${
        [...state.roster]
          .sort(
            (a, b) =>
              (g.stats[a.id]?.seconds || 0) - (g.stats[b.id]?.seconds || 0),
          )
          .map(
            (p) =>
              `<div class="row space"><strong>${esc(playerName(p))}</strong><span data-playtime="${p.id}">${fmt(g.stats[p.id]?.seconds || 0)}</span></div>`,
          )
          .join("") || '<p class="muted">No roster yet.</p>'
      }<p class="space small">Minimum requirement: ${rule("minimum")}</p></section></div>`;
    return (
      heading(
        "THE SIDELINE",
        "Game day. One step at a time.",
        "Simple jobs. Balanced opportunities.",
      ) +
      hotNotice() +
      `<div class="subnav" role="tablist" aria-label="Game day stages">${tabs.map((t) => `<button role="tab" aria-selected="${gameTab === t}" class="${gameTab === t ? "active" : ""}" data-game-tab="${t}">${t.replace(/^./, (c) => c.toUpperCase())}</button>`).join("")}</div><section role="tabpanel" aria-label="${gameTab}">${body}</section>`
    );
  }
  function team() {
    return (
      heading(
        "YOUR PLAYERS",
        "Everyone gets a turn.",
        "First names only. Your roster stays on this device.",
        btn("Add player", "addPlayer", "primary"),
      ) +
      `<div class="grid"><section class="card"><div class="row"><h2>Team roster</h2>${pill(state.roster.filter((p) => p.present).length + " PRESENT", "green")}</div>${state.roster.length ? state.roster.map((p) => playerRow(p, "team")).join("") : `<div class="empty"><h2>Ready for your first player.</h2><p>Add a first name and jersey number. No account needed.</p>${btn("Add player", "addPlayer", "primary")}</div>`}</section><aside class="stack"><section class="card"><h2>Equal chances to grow.</h2><p>Check who is here before kickoff. Use Game Day to build a lineup and see who has played less.</p><p>Rotate roles. Let everyone attack, defend, and try something new.</p>${btn("Open rotations", "openRotations", "wide")}</section><section class="card"><h3>Two coaches, separate devices</h3><p class="muted">This version does not sync rosters, settings, or clocks. Pick one device to track official sideline rotations.</p></section></aside></div>`
    );
  }
  function rules() {
    return (
      heading(
        "KNOW THE LOCAL GAME",
        "Clear rules. Confident coaches.",
        "Our League controls your game-day guidance.",
        go("League setup", "league"),
      ) +
      `<div class="subnav">${btn("Our League", "ours", rulesTab === "ours" ? "primary" : "")}${btn("Reference only", "reference", rulesTab === "reference" ? "primary" : "")}</div>${
        rulesTab === "ours"
          ? `<section class="card"><h2>${esc(state.rules.name || "Set up your league")}</h2><p class="muted">Only enter rules confirmed by your league. Blank means unconfirmed.</p><dl class="rules-list">${RULE_FIELDS.filter(
              (f) => f[0] !== "name",
            )
              .map(
                ([k, t]) =>
                  `<div><dt>${t}</dt><dd>${k === "periods" && state.rules[k] ? (state.rules[k] === "2" ? "Halves" : "Quarters") : rule(k)}</dd></div>`,
              )
              .join("")}</dl></section>`
          : `<div class="notice">REFERENCE ONLY • Your local league rules may differ. Our League controls what coaches follow. These values are never copied into your settings automatically.</div><div class="grid"><section class="card"><h2>Common AYSO 8U reference</h2><dl class="rules-list">${Object.entries(
              REFERENCE,
            )
              .map(
                ([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`,
              )
              .join(
                "",
              )}</dl><p class="small space">Based on <a href="https://wiki.ayso.org/wiki/8U_Official" target="_blank" rel="noopener">AYSO 8U guidance</a>. Reviewed September 25, 2026. Not a substitute for your league’s current rules.</p></section><section class="card"><h2>A simple 4v4 shape</h2>${pitch("diamond", "Reference 1–2–1 diamond")}${legend}<p>One gives depth, two give width, one gives height. All four attack and defend. Rotate roles.</p><p class="muted">Applies to four field players without a goalkeeper. Do not force children to hold exact spots.</p></section></div>`
      }`
    );
  }
  function league() {
    return (
      heading(
        "LEAGUE SETUP",
        "Your rules, confirmed.",
        "Leave anything unknown blank. It will say “Confirm with league”.",
        go("Back", "rules"),
      ) +
      `<form id="league-form" class="card"><div class="form-grid">${RULE_FIELDS.map(([k, t, type]) => `<label class="field">${t}${type === "yesno" ? `<select name="${k}"><option value="">Confirm with league</option>${["Yes", "No"].map((v) => `<option ${state.rules[k] === v ? "selected" : ""}>${v}</option>`).join("")}</select>` : type === "periods" ? `<select name="${k}"><option value="">Confirm with league</option><option value="2" ${state.rules[k] === "2" ? "selected" : ""}>Halves (2)</option><option value="4" ${state.rules[k] === "4" ? "selected" : ""}>Quarters (4)</option></select>` : `<input name="${k}" type="${type}" value="${esc(state.rules[k] || "")}" ${type === "number" ? `min="1" max="${k === "players" ? 11 : 180}" step="1"` : 'maxlength="300"'} placeholder="Confirm with league">`}</label>`).join("")}</div><div class="notice">Do not teach heading for this age group. If entered league guidance conflicts with safety guidance, clarify with your league before play.</div><button class="primary" type="submit">Save league rules</button></form>`
    );
  }
  function safety() {
    return (
      heading(
        "ALWAYS WITHIN REACH",
        "Safety comes first.",
        "Coaching reminders, not medical diagnosis.",
        go("Back to practices", "practices"),
      ) +
      `<div class="grid"><section class="card"><div class="eyebrow">HEAD INJURY</div><h2>No heading for this age group.</h2><p>If a concussion is suspected, stop participation immediately, notify the parent or guardian, and follow league procedure.</p><div class="notice danger">Keep the player out for the rest of the day and until cleared by a healthcare professional. Never ask them to play through it.</div><p>Emergency signs such as repeated vomiting, seizures, worsening headache, or trouble staying awake need emergency care. Call 911 for an emergency.</p><a href="https://www.cdc.gov/heads-up/response/index.html" target="_blank" rel="noopener">CDC HEADS UP guidance ↗</a></section><section class="card"><div class="eyebrow">HEAT & HYDRATION</div><h2>Check the players, not just the clock.</h2><p>Consider heat, sun, air quality, fatigue, and behavior. Offer extra water and shade; use shorter rounds. Follow league weather policy.</p><p>Stop activity if a child seems unwell. Get urgent help for collapse, confusion, or other emergency signs.</p><label class="switch"><input id="hot" type="checkbox" ${state.hot ? "checked" : ""}><strong>Hot day mode</strong></label><p class="small muted space">This toggle does not decide whether conditions are safe to play.</p><a href="https://www.ussoccer.com/soccer-forward/resource-hub/managing-extreme-weather-conditions" target="_blank" rel="noopener">U.S. Soccer weather resources ↗</a></section><section class="card full"><h2>Field & equipment</h2>${list(["Secure goals; never allow climbing.", "Check holes, debris, and unsafe surfaces.", "Shin guards with socks covering them; appropriate shoes.", "Remove prohibited jewelry and unsafe equipment per league rules.", "Check ball inflation and keep first aid, water, and emergency contacts accessible to the responsible adult."])}</section></div>`
    );
  }
  function toolsPage() {
    return (
      heading(
        "COACH TOOLS",
        "Less talking. More playing.",
        "Short cues and a ready equipment bag.",
      ) +
      `<div class="grid"><section class="card"><div class="row"><h2>Equipment</h2>${btn("Reset", "resetChecks", "link", 'data-key="equipment"')}</div>${checkList(CUES.equipment, "equipment")}</section><section class="card"><h2>Quick coaching phrases</h2><h3>Attack</h3>${list(CUES.attack)}<h3>Defend</h3>${list(CUES.defend)}<h3>Encourage</h3>${list(CUES.general)}</section><section class="card full"><h2>How we coach</h2><p>Fun, lots of touches, both feet, short instructions, small games, and choices. No laps, long lines, long lectures, or elimination that leaves children sitting out.</p><p class="muted">The season and activity plans are original coaching adaptations of the handoff. They are not official AYSO or U.S. Soccer session plans.</p><details class="accordion"><summary>Research & source links</summary>${SOURCES.map(([t, url]) => `<p><a href="${url}" target="_blank" rel="noopener">${t} ↗</a></p>`).join("")}<p class="small muted">Source review: September 25, 2026. Linked resources require internet access.</p></details></section></div>`
    );
  }
  function settings() {
    return (
      heading(
        "MAKE IT YOURS",
        "Ready for your sideline.",
        "Saved on this device. No account or cloud sync.",
      ) +
      `<div class="grid"><section class="card"><h2>Your coaching role</h2><label class="field">Emphasize my responsibilities<select id="coach"><option value="head" ${state.coach === "head" ? "selected" : ""}>Head coach</option><option value="assistant" ${state.coach === "assistant" ? "selected" : ""}>Assistant coach</option></select></label><p class="muted space">Assistant mode puts setup, equipment, and player organization first in live practice.</p><label class="switch"><input id="hot" type="checkbox" ${state.hot ? "checked" : ""}><strong>Hot day mode</strong></label></section><section class="card"><h2>On your iPhone</h2><p>Open the hosted app in Safari. Tap Share, then Add to Home Screen and Open as Web App if shown.</p><p>Load it once online and wait for offline readiness below before going to the field.</p><p id="offline-status" class="notice green">${offlineText()}</p><p class="small muted">The single-file download opens without hosting; Home Screen installation and service-worker caching require the hosted version. Private browsing or clearing website data can remove saved rosters.</p></section><section class="card"><h2>League & game</h2><div class="gap">${go("League rules setup", "league")}${btn("Edit next game", "editGame")}${btn("Edit huddle", "editHuddle")}</div></section><section class="card"><h2>Your data</h2><p>Each device has a separate roster, timer, and settings. Share the app link; use one device to track game minutes.</p>${btn("Reset all local data", "resetAll", "danger")}<p class="small muted space">Reset is permanent after confirmation.</p></section></div>`
    );
  }
  let offlineReady = false,
    offlineError = "";
  function offlineText() {
    return window.SINGLE_FILE || location.protocol === "file:"
      ? "Single-file mode • content is included in this file."
      : offlineReady
        ? "Offline ready • core content saved on this device."
        : offlineError || "Preparing offline content…";
  }
  function navigate(path) {
    if (location.hash.slice(1) === path) {
      render();
      return;
    }
    location.hash = path;
  }
  function render() {
    const parts = (location.hash.slice(1) || "practices").split("/");
    route = parts[0] === "today" ? "practices" : parts[0];
    document.body.classList.toggle("live-mode", route === "live");
    const views = {
      practices,
      practice: () => practice(Number(parts[1])),
      drill: () => drillDetail(Number(parts[1]), Number(parts[2])),
      live,
      game,
      team,
      rules,
      league,
      safety,
      tools: toolsPage,
      settings,
    };
    $("#main").innerHTML = (views[route] || practices)();
    nav();
    const selectedTab = $('[data-game-tab][aria-selected="true"]');
    if (selectedTab) selectedTab.parentElement.scrollLeft = Math.max(0, selectedTab.offsetLeft - selectedTab.parentElement.offsetLeft - 80);
  }
  function openDialog(html) {
    dialogReturn = document.activeElement;
    $("#dialog").innerHTML =
      `<button class="dialog-close quiet" data-action="closeDialog" aria-label="Close dialog">✕</button>${html}`;
    $("#dialog").showModal();
  }
  function closeDialog() {
    $("#dialog").close();
    if (dialogReturn?.isConnected) dialogReturn.focus();
  }
  let confirmAction = null;
  function confirmDialog(title, message, fn) {
    confirmAction = fn;
    openDialog(
      `<h2>${esc(title)}</h2><p>${esc(message)}</p><div class="gap space">${btn("Cancel", "closeDialog")}${btn("Confirm", "confirm", "primary")}</div>`,
    );
  }
  function playerForm(id = null) {
    editingId = id;
    const p = state.roster.find((p) => p.id === id) || {
      name: "",
      number: "",
      initial: "",
    };
    openDialog(
      `<h2>${id ? "Edit player" : "Add a player"}</h2><form id="player-form"><div class="form-grid"><label class="field">First name<input name="name" value="${esc(p.name)}" required maxlength="30" autocomplete="off"></label><label class="field">Jersey number<input name="number" inputmode="numeric" pattern="[0-9]{0,3}" value="${esc(p.number)}" maxlength="3"></label><label class="field">Last initial (optional)<input name="initial" value="${esc(p.initial)}" maxlength="1" autocomplete="off"></label></div><div class="gap space"><button type="submit" class="primary">Save player</button>${id ? btn("Remove player", "deletePlayer", "danger", `data-id="${id}"`) : ""}</div></form>`,
    );
  }
  function swapPlayer(inId, outId) {
    syncGame();
    const g = state.game,
      player = state.roster.find((p) => p.id === inId);
    if (!player?.present || g.field.includes(inId)) return;
    if (outId) {
      g.field = g.field.filter((id) => id !== outId);
      const r = g.roles[outId];
      delete g.roles[outId];
      g.roles[inId] = r || roles()[0];
    }
    if (g.field.length >= gameConfig().n) {
      toast("Field is full. Choose a player to replace.");
      return;
    }
    g.field.push(inId);
    if (!g.roles[inId])
      g.roles[inId] =
        roles().find((r) => !Object.values(g.roles).includes(r)) || roles()[0];
    save();
    render();
  }
  function putIn(id) {
    const cfg = gameConfig();
    if (!cfg.valid) {
      toast("Confirm your league format first.");
      return;
    }
    const g = state.game;
    if (g.finished) {
      toast("Start a new game to change the lineup.");
      return;
    }
    if (g.field.length < cfg.n) {
      swapPlayer(id);
      return;
    }
    openDialog(
      `<h2>Who comes off?</h2><p>Replace one player with ${esc(playerName(state.roster.find((p) => p.id === id)))}. Use an allowed substitution opportunity.</p><p class="small">Procedure: ${rule("subs")}</p><div class="stack">${g.field.map((out) => btn("Replace " + esc(playerName(state.roster.find((p) => p.id === out))), "swap", "", `data-in="${id}" data-out="${out}"`)).join("")}</div>`,
    );
  }
  function suggest() {
    syncGame();
    const g = state.game,
      bench = state.roster
        .filter((p) => p.present && !g.field.includes(p.id))
        .sort(
          (a, b) =>
            (g.stats[a.id]?.seconds || 0) - (g.stats[b.id]?.seconds || 0),
        );
    if (!bench.length) {
      toast("No resting players.");
      return;
    }
    if (g.finished) {
      toast("Game is finished.");
      return;
    }
    const incoming = bench[0],
      outgoing = [...g.field].sort(
        (a, b) => (g.stats[b]?.seconds || 0) - (g.stats[a]?.seconds || 0),
      )[0];
    if (g.field.length < gameConfig().n) {
      openDialog(
        `<h2>Fill an open spot</h2><p>${esc(playerName(incoming))} has ${fmt(g.stats[incoming.id]?.seconds || 0)} playing time.</p>${btn("Confirm player in", "swap", "primary", `data-in="${incoming.id}"`)}`,
      );
      return;
    }
    const out = state.roster.find((p) => p.id === outgoing);
    openDialog(
      `<h2>Suggested next rotation</h2><p><strong>IN:</strong> ${esc(playerName(incoming))} · ${fmt(g.stats[incoming.id]?.seconds || 0)}</p><p><strong>REST:</strong> ${esc(playerName(out))} · ${fmt(g.stats[outgoing]?.seconds || 0)}</p><p>Least time in, most time resting next. Check the situation and your league’s substitution procedure.</p><p class="small">${rule("subs")}</p>${btn("Confirm substitution", "swap", "primary", `data-in="${incoming.id}" data-out="${outgoing}"`)}`,
    );
  }
  function handleAction(el) {
    const a = el.dataset.action,
      l = state.live,
      id = el.dataset.id;
    const actions = {
      closeDialog,
      confirm: () => {
        closeDialog();
        const f = confirmAction;
        confirmAction = null;
        f?.();
      },
      setNext: () => {
        state.currentPractice = Number(id);
        save();
        toast("Next practice updated.");
      },
      toggleComplete: () => {
        const n = Number(id);
        state.completed = state.completed.includes(n)
          ? state.completed.filter((x) => x !== n)
          : [...state.completed, n];
        save();
        render();
      },
      startPractice: () => startPractice(Number(id)),
      resumeLive: () => navigate("live"),
      pause: () => {
        if (!l || l.water) return;
        l.remaining = remaining();
        l.running = !l.running;
        if (l.running) {
          if (l.remaining <= 0) l.remaining = 60;
          l.deadline = Date.now() + l.remaining * 1000;
        }
        save();
        render();
      },
      previous: () => stepPractice(-1),
      next: () => stepPractice(1),
      skip: () => stepPractice(1),
      addMinute: () => {
        if (!l || l.water) return;
        l.remaining = remaining() + 60;
        if (l.running) l.deadline = Date.now() + l.remaining * 1000;
        save();
        render();
      },
      water: () => {
        if (!l) return;
        l.remaining = remaining();
        l.water = { end: Date.now() + 60000, resume: l.running };
        l.running = false;
        save();
        render();
      },
      waterEnd: () => {
        if (!l?.water) return;
        l.running = l.water.resume && l.remaining > 0;
        l.water = null;
        l.deadline = Date.now() + l.remaining * 1000;
        save();
        render();
      },
      liveDetail: () => {
        const p = PRACTICES[l.practice - 1],
          a = p.activities[l.index],
          d = DRILLS[a.drill];
        openDialog(
          `<h2>${esc(d.name)}</h2><p><strong>Setup:</strong> ${esc(d.setup)}</p><ol>${d.play.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>${a.note ? `<p>${esc(a.note)}</p>` : ""}${d.kind === "restart" ? restartRules() : ""}${roleCard(d)}<p class="space"><strong>Easier:</strong> ${esc(d.easier)}</p><p><strong>Harder:</strong> ${esc(d.harder)}</p><p><strong>Fewer:</strong> ${esc(d.low)}</p><p><strong>More:</strong> ${esc(d.high)}</p><p class="small muted">Practice clock keeps its current state while instructions are open.</p>`,
        );
      },
      resetChecks: () => {
        Object.keys(state.checks)
          .filter((k) => k.startsWith(el.dataset.key + "-"))
          .forEach((k) => delete state.checks[k]);
        save();
        render();
      },
      addPlayer: () => playerForm(),
      editPlayer: () => playerForm(id),
      deletePlayer: () => {
        closeDialog();
        confirmDialog(
          "Remove this player?",
          "Their local playing-time record will also be deleted.",
          () => {
            syncGame();
            state.game.field = state.game.field.filter((x) => x !== id);
            delete state.game.stats[id];
            delete state.game.roles[id];
            state.roster = state.roster.filter((p) => p.id !== id);
            save();
            render();
          },
        );
      },
      attendance: () => {
        syncGame();
        const p = state.roster.find((p) => p.id === id);
        p.present = !p.present;
        if (!p.present) {
          state.game.field = state.game.field.filter((x) => x !== id);
          delete state.game.roles[id];
        }
        save();
        render();
      },
      openRotations: () => {
        gameTab = "rotations";
        state.gameTab = gameTab;
        save();
        navigate("game");
      },
      putIn: () => putIn(id),
      rest: () => {
        syncGame();
        state.game.field = state.game.field.filter((x) => x !== id);
        delete state.game.roles[id];
        save();
        render();
      },
      swap: () => {
        closeDialog();
        swapPlayer(el.dataset.in, el.dataset.out);
      },
      suggest,
      gameClock: () => {
        const g = state.game;
        syncGame();
        if (!g.running) {
          if (state.live?.running) {
            toast("Pause your practice timer first.");
            return;
          }
          if (!gameConfig().valid || g.finished) return;
          if (!g.field.length) {
            toast("Choose an on-field lineup first.");
            return;
          }
          if (
            g.elapsed >=
            (gameConfig().duration * 60) / gameConfig().periods
          ) {
            toast("Period is complete. Choose Next period or Finish game.");
            return;
          }
        }
        g.running = !g.running;
        g.last = Date.now();
        save();
        render();
      },
      nextPeriod: () => {
        syncGame();
        const g = state.game,
          last = g.period >= gameConfig().periods;
        confirmDialog(
          last ? "Finish this game?" : "Move to the next period?",
          last
            ? "Stop the clock and keep the final playing times."
            : "The game clock pauses. Playing-time totals carry forward; the period clock resets.",
          () => {
            syncGame();
            g.running = false;
            if (last) g.finished = true;
            else {
              g.period++;
              g.elapsed = 0;
            }
            save();
            render();
          },
        );
      },
      newGame: () =>
        confirmDialog(
          "Start a new game?",
          "Clear this game’s lineup and playing-time totals. Keep your roster and league settings.",
          () => {
            state.game = freshGame();
            save();
            render();
          },
        ),
      ours: () => {
        rulesTab = "ours";
        render();
      },
      reference: () => {
        rulesTab = "reference";
        render();
      },
      editGame: () =>
        openDialog(
          `<h2>Next game</h2><form id="game-form"><div class="form-grid">${[
            ["date", "Date", "date"],
            ["time", "Time", "time"],
            ["opponent", "Opponent", "text"],
            ["location", "Location", "text"],
          ]
            .map(
              ([k, t, type]) =>
                `<label class="field">${t}<input type="${type}" name="${k}" value="${esc(state.nextGame[k])}" maxlength="120"></label>`,
            )
            .join(
              "",
            )}</div><button type="submit" class="primary space">Save game</button></form>`,
        ),
      editHuddle: () =>
        openDialog(
          `<h2>Pregame huddle</h2><form id="huddle-form"><label class="field">Keep it short and encouraging<textarea name="huddle" maxlength="1000" required>${esc(state.huddle)}</textarea></label><button type="submit" class="primary space">Save huddle</button></form>`,
        ),
      resetAll: () =>
        confirmDialog(
          "Reset all local data?",
          "Permanently remove this device’s roster, rules, progress, and game minutes. This cannot be undone.",
          () => {
            state = defaults();
            storageOK = true;
            save();
            $("#storage-warning").hidden = storageOK;
            navigate("practices");
            toast("Local data reset.");
          },
        ),
    };
    actions[a]?.();
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest("button");
    if (!el) return;
    if (el.dataset.go) {
      if ($("#dialog").open) closeDialog();
      navigate(el.dataset.go);
    } else if (el.dataset.gameTab) {
      gameTab = el.dataset.gameTab;
      state.gameTab = gameTab;
      save();
      render();
    } else if (el.dataset.action) handleAction(el);
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.check) {
      state.checks[t.dataset.check] = t.checked;
      save();
    }
    if (t.id === "hot") {
      state.hot = t.checked;
      save();
      render();
      toast(state.hot ? "Hot day reminders on." : "Hot day reminders off.");
    }
    if (t.id === "coach") {
      state.coach = t.value;
      save();
      render();
    }
    if (t.dataset.role) {
      syncGame();
      state.game.roles[t.dataset.role] = t.value;
      save();
      render();
    }
  });
  document.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target,
      data = Object.fromEntries(new FormData(f));
    if (f.id === "player-form") {
      if (!data.name.trim()) {
        toast("Enter a first name.");
        return;
      }
      const p = {
        name: data.name.trim(),
        number: data.number.trim(),
        initial: data.initial.trim().toUpperCase(),
      };
      if (editingId)
        Object.assign(
          state.roster.find((p) => p.id === editingId),
          p,
        );
      else
        state.roster.push({
          ...p,
          id:
            "p" +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 7),
          present: true,
        });
      save();
      closeDialog();
      render();
      toast("Player saved.");
    }
    if (f.id === "league-form") {
      syncGame();
      const changed = ["players", "goalkeeper", "duration", "periods"].some(
        (k) => data[k] !== String(state.rules[k] || ""),
      );
      const commit = () => {
        state.rules = data;
        if (changed) state.game = freshGame();
        save();
        navigate("rules");
        toast("League rules saved.");
      };
      if (
        changed &&
        (state.game.field.length || Object.keys(state.game.stats).length)
      )
        confirmDialog(
          "Change the game format?",
          "The current lineup and playing-time record must reset for the new format. Your roster stays saved.",
          commit,
        );
      else commit();
    }
    if (f.id === "game-form") {
      state.nextGame = data;
      save();
      closeDialog();
      render();
      toast("Game details saved.");
    }
    if (f.id === "huddle-form") {
      state.huddle = data.huddle.trim();
      save();
      closeDialog();
      render();
      toast("Huddle saved.");
    }
  });
  window.addEventListener("hashchange", () => {
    render();
    window.scrollTo(0, 0);
    $("#main").focus({ preventScroll: true });
  });
  window.addEventListener("pagehide", () => {
    syncGame();
    save();
  });
  document.addEventListener("visibilitychange", () => {
    syncGame();
    settleLive();
    save();
    if (!document.hidden) render();
  });
  // Prevent two tabs from independently counting the same game. Reload changes from the other tab.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        state = JSON.parse(e.newValue);
        render();
      } catch {
        toast("Could not read changes from another tab.");
      }
    }
  });
  setInterval(() => {
    settleLive();
    syncGame();
    const l = state.live;
    if ($("#practice-clock") && l)
      $("#practice-clock").textContent = fmt(remaining());
    if ($("#plan-clock") && l)
      $("#plan-clock").textContent = fmt(planRemaining());
    if ($("#water-clock") && l?.water)
      $("#water-clock").textContent = fmt((l.water.end - Date.now()) / 1000);
    if ($("#game-clock"))
      $("#game-clock").textContent = fmt(state.game.elapsed);
    document
      .querySelectorAll("[data-playtime]")
      .forEach(
        (el) =>
          (el.textContent = fmt(
            state.game.stats[el.dataset.playtime]?.seconds || 0,
          )),
      );
    if (state.game.running) save();
  }, 1000);
  if (
    !window.SINGLE_FILE &&
    "serviceWorker" in navigator &&
    ["https:", "http:"].includes(location.protocol)
  ) {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(async () => {
        const reg = await navigator.serviceWorker.ready;
        const channel = new MessageChannel();
        channel.port1.onmessage = (e) => {
          if (e.data === "CACHE_READY") {
            offlineReady = true;
            const el = $("#offline-status");
            if (el) el.textContent = offlineText();
          }
        };
        (reg.active || navigator.serviceWorker.controller)?.postMessage(
          "CHECK_CACHE",
          [channel.port2],
        );
      })
      .catch(() => {
        offlineError =
          "Offline setup failed. Stay online and reload to try again.";
        const el = $("#offline-status");
        if (el) el.textContent = offlineText();
      });
  } else if (location.protocol !== "file:")
    offlineError = "Offline caching is unavailable in this browser.";
  settleLive();
  syncGame();
  render();
})();
