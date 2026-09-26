const fs = require("fs"),
  path = require("path"),
  assert = require("assert/strict");
const { chromium } = require(
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
    ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, "playwright")
    : "playwright",
);
(async () => {
  const b = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const p = await c.newPage(),
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("file://" + path.resolve("8U-Coach.html"));
  assert.equal(await p.locator("h1").innerText(), "Let’s get them playing.");
  assert.equal(
    await p.locator('script[src],link[rel="stylesheet"]').count(),
    0,
  );
  await p.locator('[data-action="startPractice"]').click();
  await p.waitForSelector("#practice-clock");
  assert(!(await p.locator("#nav").isVisible()));
  for (let i = 0; i < 5; i++) await p.locator('[data-action="next"]').click();
  await p.locator('[data-action="next"]').click();
  await p.locator('#dialog [data-action="confirm"]').click();
  assert.equal(
    await p.evaluate(
      () => JSON.parse(localStorage.getItem("8u-coach-v1")).completed[0],
    ),
    1,
  );
  await p.reload();
  assert.equal(
    await p.evaluate(
      () => JSON.parse(localStorage.getItem("8u-coach-v1")).currentPractice,
    ),
    2,
  );
  console.log(
    "PASS standalone file opens without assets/network; practice finish and progress persist",
  );
  await p.goto(process.env.BASE_URL || "http://127.0.0.1:8000/8u-coach/");
  await p.screenshot({ path: "test-results/today-mobile.png", fullPage: true });
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.screenshot({
    path: "test-results/today-desktop.png",
    fullPage: true,
  });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.locator('[data-action="startPractice"]').click();
  await p.locator('[data-action="pause"]').click();
  await p.screenshot({ path: "test-results/live-mobile.png", fullPage: true });
  const fixture = await p.evaluate(() => {
    let s = JSON.parse(localStorage.getItem("8u-coach-v1"));
    s.rules = { players: "4", goalkeeper: "No", duration: "40", periods: "4" };
    s.gameTab = "rotations";
    s.roster = Array.from({ length: 6 }, (_, i) => ({
      id: "test" + i,
      name: "Player " + (i + 1),
      number: String(i + 1),
      initial: "",
      present: true,
    }));
    s.game.field = s.roster.slice(0, 4).map((p) => p.id);
    s.game.roles = {
      test0: "Front",
      test1: "Left",
      test2: "Right",
      test3: "Back",
    };
    return s;
  });
  await p.addInitScript(
    (s) => localStorage.setItem("8u-coach-v1", JSON.stringify(s)),
    fixture,
  );
  await p.goto(
    (process.env.BASE_URL || "http://127.0.0.1:8000/8u-coach/") + "#game",
  );
  await p.reload();
  await p.waitForSelector(".player-info");
  const widths = await p
    .locator(".player-info")
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
  assert(
    widths.length === 6 && widths.every((x) => x > 90),
    JSON.stringify(widths),
  );
  await p.screenshot({
    path: "test-results/rotations-mobile.png",
    fullPage: true,
  });
  await p.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  assert(
    await p.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "200% text overflow",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS final live navigation, readable roster rows, 200% text, no JS errors",
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
