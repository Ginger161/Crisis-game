/* Tap test: every icon, object and person in the house, tapped like a finger on a phone.
   Run:  node tests/taps.js        (needs Google Chrome installed; starts its own server and its own empty browser profile)

   The bug it guards: the house opens things as the finger touches down. The tap that ends that same touch used to land on what had just
   opened, and close it (the junk wheel vanished unless you held it), or pick whichever choice opened under the finger.
   For every target and every tap length it checks:
     1. whatever opened is still open after the finger lifts, and is the same thing (nothing was picked, nothing closed);
     2. a normal tap after that still works (a tap on the backdrop closes a wheel). */
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs'); const os = require('os');
const ROOT = path.join(__dirname, '..');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));
const PORT = 3191, DBG = 9391;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  if (!CHROME) { console.log('Chrome not found.'); process.exit(2); }
  const srv = spawn(process.execPath, [path.join(ROOT, 'server.js')], { env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore' });
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'crisis-taps-'));
  const ch = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${DBG}`, `--user-data-dir=${prof}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  const done = (code) => { try { ch.kill(); srv.kill(); fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} process.exit(code); };
  let ws; for (let i = 0; i < 60; i++) { try { const t = await (await fetch(`http://127.0.0.1:${DBG}/json`)).json(); const pg = t.find((x) => x.type === 'page'); if (pg) { ws = pg.webSocketDebuggerUrl; break; } } catch (e) {} await sleep(250); }
  const sock = new WebSocket(ws); await new Promise((r) => (sock.onopen = r));
  let id = 0; const pend = {}; const errs = []; sock.onmessage = (m) => { const d = JSON.parse(m.data); if (d.method === 'Runtime.exceptionThrown') errs.push((d.params.exceptionDetails.exception || {}).description || d.params.exceptionDetails.text); if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; } };
  const cmd = (method, params) => new Promise((r) => { const i = ++id; pend[i] = r; sock.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async (expr) => { const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true }); return r.result && r.result.result ? r.result.result.value : null; };
  await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2, mobile: true });   /* a Galaxy Note 20 */
  await cmd('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await cmd('Page.navigate', { url: `http://localhost:${PORT}/` }); await sleep(3000);
  await ev(`document.querySelector('[data-a="new"]').click(), 1`); await sleep(2000);
  await ev(`(document.querySelector('.idgo')||{click(){}}).click(), 1`); await sleep(900);
  await ev(`(document.querySelector('#modal [data-m]')||{click(){}}).click(), 1`); await sleep(900);
  await ev(`window.__crisis.G.speed = 0, 1`);   /* hold the clock so nothing else happens between taps */

  /* what is open right now: a card (its title and its text), the wheel (its title), the menu, or nothing */
  const STATE = `(() => { const w = document.getElementById('wheel'); if (w && !w.classList.contains('hidden')) return 'wheel:' + ((w.querySelector('b')||{}).textContent||'');
    const m = document.getElementById('modal'); if (m && !m.classList.contains('hidden') && m.querySelector('.box')) return 'card:' + ((m.querySelector('h3')||{}).textContent||'') + '|' + ((m.querySelector('.story')||{}).textContent||'').slice(0, 60);
    const mn = document.getElementById('menu'); if (mn && !mn.classList.contains('hidden')) return 'menu'; return 'none'; })()`;
  const closeAll = `(() => { try { const c = window.__crisis; if (window.Crisis.Wheel) window.Crisis.Wheel.close(); c.Q.length = 0; if (c.modalOpen) c.nextModal(); window.__crisis.G.speed = 0; } catch (e) {} return 1; })()`;
  const targets = await ev(`(() => { const out = []; const seen = new Set();
    document.querySelectorAll('.house .hchip[data-st], .house [data-st], .house [data-p]').forEach((el) => { const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 70 || r.top > innerHeight * .62) return;
      const key = (el.getAttribute('data-st') ? 'st:' + el.getAttribute('data-st') : 'p:' + el.getAttribute('data-p')) + (el.classList.contains('hchip') ? ':chip' : '');
      if (seen.has(key)) return; seen.add(key); out.push({ key, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }); });
    return out; })()`);
  console.log(`${targets.length} things to tap in the house`);
  let fails = 0, opened = 0;
  const touch = async (x, y, ms) => { await cmd('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await sleep(ms); await cmd('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  for (const t of targets) {
    for (const ms of [60, 150, 400]) {
      await ev(closeAll); await sleep(250);
      await cmd('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: t.x, y: t.y }] }); await sleep(Math.min(ms, 40));
      const atDown = await ev(STATE); await sleep(Math.max(0, ms - 40));
      await cmd('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(600);
      const after = await ev(STATE);
      if (atDown !== 'none') opened++;
      if (atDown !== 'none' && after !== atDown) { fails++; console.log(`FAIL  ${t.key}, ${ms}ms tap: opened "${atDown.slice(0, 50)}" but after the finger lifted: "${after.slice(0, 50)}"`); }
      /* the guard must not eat the next, deliberate tap: a tap on the wheel's background (above its sheet on a phone) still closes it */
      if (ms === 60 && after.startsWith('wheel:')) {
        const bg = await ev(`(() => { const w = document.getElementById('wheel'); const sh = w.querySelector('.wsheet,.wgrid,.wring,.wcenter'); const top = sh ? sh.getBoundingClientRect().top : innerHeight; for (let y = Math.round(top) - 30; y > 60; y -= 40) { const e = document.elementFromPoint(206, y); if (e === w) return { x: 206, y }; } return null; })()`);
        if (bg) { await touch(bg.x, bg.y, 60); await sleep(500); const again = await ev(STATE); if (again.startsWith('wheel:')) { fails++; console.log(`FAIL  ${t.key}: a second tap on the background did not close the wheel`); } }
      }
    }
  }
  await ev(closeAll);
  console.log(`${opened} taps opened something`);
  if (errs.length) { fails++; console.log('page errors:\n' + errs.slice(0, 5).join('\n')); }
  console.log(fails ? `${fails} FAILED` : 'all passed');
  sock.close(); done(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
