// Capturas do app para o canvas "Telas do app" (ishinydex#222).
//
//   BACKUP=<backup.json> OUT=<pasta> node capture.js plan.json [prefixo]
//
// Abre o app servido em BASE (padrão http://127.0.0.1:8765/) no Chromium do
// Playwright, no tamanho do iPhone sem a barra de status (402×812, 2x), com
// o backup no localStorage, e segue as cenas do plano. Só as cenas cujo nome
// começa com [prefixo], se ele vier.
//
// Cada cena: {name, opts?, steps}. opts: data (false = app vazio), dark, en.
// Passos:
//   ["go", rota]          abre a rota (/#rota) e liga a árvore de acessibilidade
//   ["tap", texto, ms?]   toca no elemento cujo rótulo é (ou começa com) texto
//   ["tapAt", x, y, ms?]  toca na posição (quando o rótulo não basta)
//   ["scroll", dy, x?, y?]
//   ["type", texto] ["key", tecla] ["wait", ms]
//   ["view", w, h]        muda o tamanho da janela (tela inteira, -T)
//   ["labels", n?]        lista os rótulos visíveis (para escrever o plano)
//   ["shot", sufixo?]     salva OUT/<nome>[-sufixo].png
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const OUT = process.env.OUT || 'out';
const BACKUP = process.env.BACKUP;

async function open({ data = true, dark = false, en = false } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 402, height: 812 },
    deviceScaleFactor: 2,
    colorScheme: dark ? 'dark' : 'light',
    locale: en ? 'en-US' : 'pt-BR',
    serviceWorkers: 'block',
    hasTouch: true,
  });
  const store = {};
  // A mesma chave do LocalStore no web (shared_preferences: prefixo flutter.).
  if (data) store['flutter.ishinydex.data'] = JSON.stringify(fs.readFileSync(BACKUP, 'utf8'));
  // Só na primeira carga: as rotas seguintes mantêm o que o app gravou.
  await ctx.addInitScript((s) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.clear();
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v);
  }, store);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  return { browser, page };
}

async function go(page, path) {
  await page.goto(BASE + '#' + path);
  await page.waitForSelector('flutter-view, flt-glass-pane', { timeout: 30000 });
  await page.waitForTimeout(2500);
  // O Flutter web só monta a árvore de acessibilidade (os rótulos que o tap
  // procura) depois de um clique no placeholder.
  await page.evaluate(() => document.querySelector('flt-semantics-placeholder')?.click());
  await page.waitForTimeout(500);
}

async function labels(page) {
  return page.evaluate(() => [...document.querySelectorAll('flt-semantics')]
    .map((e) => [e.getAttribute('role'), e.getAttribute('aria-label') || e.textContent.trim().slice(0, 60)])
    .filter(([, l]) => l));
}

// Centro do elemento visível com o rótulo: igual antes de "começa com" e de
// "contém", e a folha (sem filhos) antes do grupo.
async function find(page, text) {
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('flt-semantics')];
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const hit = (f) => els.find((e) => {
      const b = e.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && f(e);
    });
    const leaf = (e) => e.querySelectorAll('flt-semantics').length === 0;
    const label = (e) => norm(e.getAttribute('aria-label'));
    const e = hit((e) => label(e) === t) || hit((e) => leaf(e) && norm(e.innerText) === t)
      || hit((e) => label(e).startsWith(t)) || hit((e) => leaf(e) && norm(e.innerText).startsWith(t))
      || hit((e) => norm(e.innerText).startsWith(t)) || hit((e) => label(e).includes(t));
    if (!e) return null;
    const b = e.getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }, text);
}

async function step(page, scene, [op, ...a]) {
  switch (op) {
    case 'go': return go(page, a[0]);
    case 'tap': {
      const p = await find(page, a[0]);
      if (!p) {
        console.error(JSON.stringify(await labels(page)).slice(0, 3000));
        throw new Error(`não achei "${a[0]}"`);
      }
      await page.touchscreen.tap(p.x, p.y);
      return page.waitForTimeout(a[1] || 2000);
    }
    case 'tapAt':
      await page.touchscreen.tap(a[0], a[1]);
      return page.waitForTimeout(a[2] || 2000);
    case 'scroll':
      await page.mouse.move(a[1] || 200, a[2] || 400);
      await page.mouse.wheel(0, a[0]);
      return page.waitForTimeout(1200);
    case 'type':
      await page.keyboard.type(a[0], { delay: 30 });
      return page.waitForTimeout(1200);
    case 'key':
      await page.keyboard.press(a[0]);
      return page.waitForTimeout(1000);
    case 'wait': return page.waitForTimeout(a[0]);
    case 'view':
      await page.setViewportSize({ width: a[0], height: a[1] });
      return page.waitForTimeout(2000);
    case 'labels':
      return console.log(scene.name, JSON.stringify(await labels(page)).slice(0, a[0] || 4000));
    case 'shot': {
      const file = `${OUT}/${scene.name}${a[0] ? '-' + a[0] : ''}.png`;
      await page.screenshot({ path: file });
      return console.log('ok', file);
    }
    default: throw new Error(`passo desconhecido: ${op}`);
  }
}

(async () => {
  if (!BACKUP) throw new Error('falta BACKUP=<backup.json>');
  const plan = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const only = process.argv[3];
  fs.mkdirSync(OUT, { recursive: true });
  let failed = 0;
  for (const scene of plan) {
    if (only && !scene.name.startsWith(only)) continue;
    const { browser, page } = await open(scene.opts);
    try {
      for (const s of scene.steps) await step(page, scene, s);
    } catch (e) {
      failed++;
      console.error(scene.name, e.message);
    }
    await browser.close();
  }
  if (failed) {
    console.error(`${failed} cena(s) falharam`);
    process.exit(1);
  }
})();
