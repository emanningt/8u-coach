/* Run from repo: npm install --no-save playwright; npx playwright install chromium;
   python3 -m http.server 8000, then BASE_URL=http://127.0.0.1:8000/ node tests/smoke.cjs */
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "playwright")
    : "playwright",
);
const base = process.env.BASE_URL || "http://127.0.0.1:8000/8u-coach/";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const reports = [];
  const pass = (s) => {
    reports.push(s);
    console.log("PASS", s);
  };
  const click = async (action) =>
    page.locator(`[data-action="${action}"]`).first().click();
  const nav = async (hash) => {
    await page.evaluate((h) => (location.hash = h), hash);
    await page.waitForTimeout(60);
  };
  const get = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("8u-coach-v1")));
  const jump = async (ms) => {
    await page.evaluate((ms) => {
      window.__offset = (window.__offset || 0) + ms;
      document.dispatchEvent(new Event("visibilitychange"));
    }, ms);
  };
  await page.addInitScript(() => {
    const now = Date.now.bind(Date);
    window.__offset = 0;
    Date.now = () => now() + window.__offset;
  });
  await page.goto(base);
  await page.waitForSelector("h1");
  assert.equal(await page.locator(".practice-card").count(), 0);
  await page.screenshot({
    path: "test-results/today-mobile.png",
    fullPage: true,
  });
  const content = await page.evaluate(() => ({
    practices: PRACTICES.length,
    drills: Object.keys(DRILLS).length,
    totals: PRACTICES.map((p) =>
      p.activities.reduce((s, a) => s + a.minutes, 0),
    ),
    missing: Object.values(DRILLS).filter(
      (d) =>
        ![
          "name",
          "players",
          "objective",
          "equipment",
          "setup",
          "grid",
          "play",
          "cues",
          "success",
          "mistakes",
          "assistant",
          "easier",
          "harder",
          "low",
          "high",
        ].every((k) => d[k]?.length),
    ).length,
  }));
  assert.equal(content.practices, 12);
  assert.equal(content.drills, 41);
  assert(content.totals.every((x) => x === 60));
  assert.equal(content.missing, 0);
  pass("12 sixty-minute practices and 41 complete drills");
  for (const hash of [
    "today",
    "practices",
    "game",
    "team",
    "rules",
    "league",
    "tools",
    "safety",
    "settings",
    "practice/1",
    "drill/1/0",
  ]) {
    await nav(hash);
    assert(await page.locator("h1").count());
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Overflow on ${hash}`,
    );
  }
  for (let p = 1; p <= 12; p++)
    for (let a = 0; a < 6; a++) {
      await nav(`drill/${p}/${a}`);
      assert.equal(await page.locator("svg.pitch").count(), 1);
    }
  pass(
    "All main screens and 72 activity routes render without mobile overflow",
  );
  await nav("today");
  await page.locator("#hot").check();
  assert((await get()).hot);
  await page.reload();
  assert(await page.locator("#hot").isChecked());
  pass("Hot day mode persists");
  await click("startPractice");
  await page.waitForSelector("#practice-clock");
  assert(!(await page.locator("#nav").isVisible()));
  assert.equal(await page.locator("#practice-clock").innerText(), "05:00");
  await jump(60000);
  let l = (await get()).live;
  assert(l.deadline - Date.now() < 300000);
  await click("pause");
  let rem = (await get()).live.remaining;
  assert(rem > 238 && rem <= 240);
  await jump(60000);
  assert.equal((await get()).live.remaining, rem);
  await click("addMinute");
  assert.equal((await get()).live.remaining, rem + 60);
  await click("pause");
  await click("water");
  assert(!(await get()).live.running);
  const waterRem = (await get()).live.remaining;
  await jump(90000);
  assert.equal((await get()).live.remaining, waterRem);
  await click("waterEnd");
  assert((await get()).live.running);
  await click("next");
  assert.equal((await get()).live.index, 1);
  await click("previous");
  assert.equal((await get()).live.index, 0);
  await click("skip");
  assert.equal((await get()).live.index, 1);
  await click("pause");
  await page.reload();
  assert.equal((await get()).live.index, 1);
  assert(!(await get()).live.running);
  await page.screenshot({
    path: "test-results/live-mobile.png",
    fullPage: true,
  });
  await click("pause");
  await jump(11 * 60000);
  assert.equal((await get()).live.remaining, 0);
  assert(!(await get()).live.running);
  pass(
    "Practice pause, resume, next, previous, skip, +1 minute, water, expiry, refresh persistence",
  );
  await nav("league");
  await page.locator('[name="name"]').fill("Test League");
  await page.locator('[name="players"]').fill("4");
  await page.locator('[name="goalkeeper"]').selectOption("No");
  await page.locator('[name="duration"]').fill("40");
  await page.locator('[name="periods"]').selectOption("4");
  await page
    .locator('[name="subs"]')
    .fill("At stoppage with referee permission");
  await page.locator('[name="minimum"]').fill("Half the game");
  await page.locator('[name="touchline"]').fill("Dribble in");
  await page.getByRole("button", { name: "Save league rules" }).click();
  await page.reload();
  assert.equal((await get()).rules.players, "4");
  await nav("drill/11/1");
  assert((await page.locator("main").innerText()).includes("Dribble in"));
  assert(
    (await page.locator("main").innerText()).includes("CONFIRM WITH LEAGUE"),
  );
  pass(
    "League rules persist, unconfirmed rules stay blank, practice 11 reads local restarts",
  );
  await nav("team");
  for (let i = 1; i <= 6; i++) {
    await click("addPlayer");
    await page.locator('#player-form [name="name"]').fill("Player " + i);
    await page.locator('#player-form [name="number"]').fill(String(i));
    await page
      .getByRole("button", { name: "Save player", exact: true })
      .click();
  }
  assert.equal((await get()).roster.length, 6);
  await page.reload();
  assert.equal((await get()).roster.length, 6);
  await click("openRotations");
  await page.waitForSelector('[data-action="putIn"]');
  for (let i = 0; i < 4; i++) await click("putIn");
  assert.equal((await get()).game.field.length, 4);
  await click("gameClock");
  assert((await get()).game.running);
  await jump(120000);
  let s = await get();
  assert(
    s.game.field.every(
      (id) => s.game.stats[id].seconds >= 120 && s.game.stats[id].seconds < 123,
    ),
  );
  assert(s.game.field.every((id) => s.game.stats[id].periods.includes(1)));
  await click("suggest");
  assert.equal((await get()).game.field.join(","), s.game.field.join(","));
  await page.locator('#dialog [data-action="swap"]').click();
  let sub = await get();
  assert.notEqual(sub.game.field.join(","), s.game.field.join(","));
  await jump(60000);
  await click("gameClock");
  let paused = await get();
  assert(!paused.game.running);
  const offId = s.game.field.find((id) => !sub.game.field.includes(id));
  assert(paused.game.stats[offId].seconds < 125);
  const inId = sub.game.field.find((id) => !s.game.field.includes(id));
  assert(
    paused.game.stats[inId].seconds >= 60 &&
      paused.game.stats[inId].seconds < 63,
  );
  await jump(60000);
  assert.equal(
    (await get()).game.stats[inId].seconds,
    paused.game.stats[inId].seconds,
  );
  await page.reload();
  assert.equal((await get()).game.field.length, 4);
  await click("nextPeriod");
  await page.locator('#dialog [data-action="confirm"]').click();
  assert.equal((await get()).game.period, 2);
  assert.equal((await get()).game.elapsed, 0);
  await click("gameClock");
  await jump(60 * 60000);
  let capped = await get();
  assert.equal(capped.game.elapsed, 600);
  assert(!capped.game.running);
  assert(
    capped.game.field.every((id) => capped.game.stats[id].periods.includes(2)),
  );
  pass(
    "Roster persistence; lineup, confirmed suggestion, substitutions, approximate minutes, periods, lock-time cap",
  );
  await page.screenshot({
    path: "test-results/rotations-mobile.png",
    fullPage: true,
  });
  for (const t of [
    "arrival",
    "warm-up",
    "lineup",
    "rotations",
    "coaching",
    "halftime",
    "postgame",
  ]) {
    await page.locator(`[data-game-tab="${t}"]`).click();
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Game overflow ${t}`,
    );
  }
  pass("All seven game-day stages");
  await nav("team");
  await page.locator('[data-action="attendance"]').first().click();
  assert.equal((await get()).roster[0].present, false);
  await page.locator('[data-action="editPlayer"]').first().click();
  await page
    .locator('#player-form [name="name"]')
    .fill("<script>alert(1)</script>");
  await page.getByRole("button", { name: "Save player", exact: true }).click();
  assert(
    (await page.locator("main").innerText()).includes(
      "<script>alert(1)</script>",
    ),
  );
  assert.equal(await page.locator("main script").count(), 0);
  pass("Attendance changes and safe text rendering");
  await nav("settings");
  await page.locator("#coach").selectOption("assistant");
  await page.reload();
  assert.equal((await get()).coach, "assistant");
  await nav("live");
  await click("addMinute");
  assert.equal(await page.locator(".role.emphasized").count(), 1);
  pass("Assistant coach preference and live emphasis");
  await nav("settings");
  await page.waitForFunction(
    () =>
      document
        .querySelector("#offline-status")
        .textContent.includes("Offline ready"),
    {},
    { timeout: 15000 },
  );
  const manifest = await page.evaluate(async () => {
    const m = await (await fetch("./manifest.json")).json();
    return { start: m.start_url, icons: m.icons.length, scope: m.scope };
  });
  assert.equal(manifest.start, "./");
  assert.equal(manifest.icons, 2);
  assert.equal(manifest.scope, "./");
  await context.setOffline(true);
  await page.reload();
  await nav("practices");
  assert.equal(await page.locator(".practice-card").count(), 12);
  await nav("drill/12/5");
  assert((await page.locator("h1").innerText()).includes("Water"));
  await context.setOffline(false);
  pass(
    "Service worker, full offline reload/content, manifest, GitHub project-subpath URLs",
  );
  await page.setViewportSize({ width: 320, height: 720 });
  for (const hash of ["today", "practices", "team", "game", "league", "live"]) {
    await nav(hash);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `320px overflow ${hash}`,
    );
  }
  pass("320px and 390px phone layouts");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await nav("today");
  await page.screenshot({
    path: "test-results/today-desktop.png",
    fullPage: true,
  });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  pass("Desktop layout");
  assert.deepEqual(errors, []);
  pass("No JavaScript page errors");
  fs.writeFileSync(
    "test-results/results.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        browser: "Chromium",
        passed: reports,
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
