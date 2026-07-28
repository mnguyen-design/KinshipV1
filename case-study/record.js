/* Records looped case-study clips of the Kinship prototype.
 * Each clip starts and ends on an identical neutral frame (cursor faded out),
 * so the encoded MP4 loops seamlessly. */
const { chromium } = require('playwright');
const path = require('path');

const OUT = '/root/kinship/video-raw';
const PAGE = 'file:///root/kinship/kinship-prototype.html';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function setup(clipName) {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--enable-features=OverlayScrollbar', '--font-render-hinting=none']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: path.join(OUT, clipName), size: { width: 1920, height: 1080 } }
  });
  const page = await context.newPage();
  await page.goto(PAGE);
  await page.waitForTimeout(900); // fonts settle (local fonts via fontconfig)

  // Soft cursor dot that follows the real mouse; pulses on click.
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.id = '__cur';
    d.style.cssText = 'position:fixed;left:-60px;top:-60px;width:22px;height:22px;border-radius:50%;' +
      'background:rgba(42,31,20,0.32);border:1.5px solid rgba(255,252,245,0.95);' +
      'box-shadow:0 1px 5px rgba(0,0,0,0.28);pointer-events:none;z-index:2147483647;' +
      'transform:translate(-50%,-50%);opacity:0;transition:opacity .45s ease';
    document.body.appendChild(d);
    document.addEventListener('mousemove', e => {
      d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px';
    }, true);
    document.addEventListener('mousedown', () => {
      d.animate([
        { transform: 'translate(-50%,-50%) scale(1)', boxShadow: '0 0 0 0 rgba(191,90,53,0.45)' },
        { transform: 'translate(-50%,-50%) scale(0.72)', boxShadow: '0 0 0 10px rgba(191,90,53,0)' },
        { transform: 'translate(-50%,-50%) scale(1)' }
      ], { duration: 320, easing: 'ease-out' });
    }, true);
    window.__cur = d;
  });
  return { browser, context, page };
}

const cursor = (page, on) => page.evaluate(v => { window.__cur.style.opacity = v ? '1' : '0'; }, on);

/* Timed, eased mouse glide — page.mouse.move({steps}) has no timing of its own. */
let mx = 0, my = 0;
async function glide(page, x, y, ms) {
  const steps = Math.max(8, Math.round(ms / 16));
  const x0 = mx, y0 = my;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
    await page.mouse.move(x0 + (x - x0) * e, y0 + (y - y0) * e);
    await sleep(ms / steps);
  }
  mx = x; my = y;
}

async function clickAt(page, x, y, ms = 500) {
  await glide(page, x, y, ms);
  await sleep(140);
  await page.mouse.down(); await sleep(90); await page.mouse.up();
  await sleep(180);
}

async function clickEl(page, selector, ms = 550) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error('not found: ' + selector);
  await clickAt(page, box.x + box.width / 2, box.y + box.height / 2, ms);
}

async function smoothWheel(page, totalDelta, ms) {
  const ticks = Math.max(10, Math.round(ms / 40));
  for (let i = 0; i < ticks; i++) {
    await page.mouse.wheel(0, totalDelta / ticks);
    await sleep(ms / ticks);
  }
}

/* ── Clip 1: tree zoom + pan ─────────────────────────────────────────── */
async function treeClip() {
  const { browser, context, page } = await setup('tree');
  await page.evaluate(() => {
    loadDemo();
    STATE.demoBarDismissed = true;
    STATE.route = 'tree';
    render();
  });
  await sleep(400);

  await sleep(1200);                       // neutral hold (loop start)
  const box = await page.locator('.treebox').boundingBox();
  const cx = box.x + box.width * 0.42, cy = box.y + box.height * 0.38; // grandparents area
  mx = cx - 300; my = cy + 260;            // cursor enters from lower left
  await page.mouse.move(mx, my);
  await cursor(page, true);
  await sleep(500);

  await glide(page, cx, cy, 900);          // drift to anchor point
  await sleep(250);
  await smoothWheel(page, -440, 2400);     // zoom in ≈2.6× anchored at cursor
  await sleep(600);

  // Drag-pan across the family, two strokes
  await page.mouse.down(); await sleep(120);
  await glide(page, cx - 520, cy + 40, 1500);
  await page.mouse.up(); await sleep(420);
  await page.mouse.down(); await sleep(120);
  await glide(page, cx - 900, cy - 130, 1400);
  await page.mouse.up(); await sleep(650);

  // Back to Fit for a clean loop point
  const fit = await page.locator('.zoombar button.fit').boundingBox();
  await clickAt(page, fit.x + fit.width / 2, fit.y + fit.height / 2, 800);
  await sleep(400);
  // Park the pointer somewhere hover-free so the end frame matches the start
  await glide(page, 600, 1062, 450);
  await page.evaluate(() => window.getSelection().removeAllRanges());
  await cursor(page, false);
  await sleep(1500);                       // neutral hold (loop end)

  await context.close(); await browser.close();
}

/* ── Clip 2: connect two people ──────────────────────────────────────── */
async function connectClip() {
  const { browser, context, page } = await setup('connect');
  await page.evaluate(() => {
    loadDemo();
    STATE.demoBarDismissed = true;
    STATE.route = 'ask';
    STATE.askPanel = 'connect';
    render();
  });
  await sleep(400);

  await sleep(1200);                       // neutral hold (loop start)
  mx = 300; my = 900;
  await page.mouse.move(mx, my);
  await cursor(page, true);
  await sleep(450);

  // Person A: Lien (Mom)
  await clickEl(page, '#pickerA', 700);
  await page.keyboard.type('Lien', { delay: 120 });
  await sleep(500);
  await clickEl(page, 'button[data-act="pick-person"][data-id="ma"]', 550);
  await sleep(550);

  // Person B: Gek-Seng (paternal grandfather)
  await clickEl(page, '#pickerB', 650);
  await page.keyboard.type('Gek', { delay: 120 });
  await sleep(500);
  await clickEl(page, 'button[data-act="pick-person"][data-id="pa-gong"]', 550);
  await sleep(600);

  await clickEl(page, 'button[data-act="show-connection"]', 650);
  await sleep(900);

  // Hover the two result cards so the viewer's eye follows
  async function tryBox(sel) {
    try { return await page.locator(sel).first().boundingBox({ timeout: 2500 }); }
    catch (e) { return null; }
  }
  const c1 = (await tryBox('span.han:text("爸")')) || (await tryBox('text=Relationship chain'));
  if (c1) { await glide(page, c1.x + 60, c1.y + 30, 900); await sleep(1700); }
  // Scroll the results column to bring the second card fully into view
  await smoothWheel(page, 260, 900);
  await sleep(400);
  const c2 = (await tryBox('span.han:text("媳婦")')) || (await tryBox('text=Sin-pu'));
  if (c2) { await glide(page, c2.x + 60, c2.y + 30, 800); await sleep(1600); }
  else await sleep(1200);

  // Reset → identical neutral frame
  await clickEl(page, 'button[data-act="reset-connection"]', 800);
  await sleep(400);
  // Park the pointer somewhere hover-free so the end frame matches the start
  await glide(page, 700, 1062, 500);
  await page.evaluate(() => window.getSelection().removeAllRanges());
  await cursor(page, false);
  await sleep(1500);                       // neutral hold (loop end)

  await context.close(); await browser.close();
}

(async () => {
  const which = process.argv[2] || 'both';
  if (which === 'tree' || which === 'both') { console.log('recording tree…'); await treeClip(); }
  if (which === 'connect' || which === 'both') { console.log('recording connect…'); await connectClip(); }
  console.log('done');
})();
