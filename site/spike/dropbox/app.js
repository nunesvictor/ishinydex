// Protótipo da etapa 0 (ishinydex#53). Responde três perguntas:
//  1. O login do Dropbox (OAuth com PKCE, sem app secret) volta para o app
//     instalado na Tela de Início do iPhone/iPad, ou cai no Safari?
//  2. O envio condicional pela `rev` (base do sync) funciona do navegador?
//  3. Como o iOS separa e guarda o armazenamento (Safari x app instalado)?
'use strict';

const KEY = 'spike.appKey';
const REFRESH = 'spike.refreshToken';
const VERIFIER = 'spike.verifier';
const STATE = 'spike.state';
const STARTED_IN = 'spike.startedIn';
const CREATED_IN = 'spike.createdIn';
const FILE = '/spike.json';
// Sem endereço fixo: o retorno do login é esta mesma página.
const redirectUri = location.origin + location.pathname;

const lines = { env: [], storage: [], dropbox: [] };

function add(list, kind, text) {
  lines[list].push(`${kind === 'ok' ? '✓' : kind === 'bad' ? '✗' : '•'} ${text}`);
  const li = document.createElement('li');
  li.className = kind;
  li.textContent = text;
  document.getElementById(list).append(li);
}

function mode() {
  const standalone =
    matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  return standalone ? 'app instalado (standalone)' : 'navegador';
}

// ---- 1. Ambiente ----

function showEnv() {
  add('env', 'info', `Modo: ${mode()}`);
  add('env', isSecureContext ? 'ok' : 'bad', `HTTPS (contexto seguro): ${isSecureContext}`);
  add('env', crypto.subtle ? 'ok' : 'bad', `WebCrypto (necessário ao PKCE): ${!!crypto.subtle}`);
  add('env', 'info', `Navegador: ${navigator.userAgent}`);
}

// ---- 2. Armazenamento ----

function idb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('spike', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbOp(db, method, ...args) {
  return new Promise((resolve, reject) => {
    const store = db
      .transaction('kv', method === 'get' ? 'readonly' : 'readwrite')
      .objectStore('kv');
    const req = store[method](...args);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function showStorage() {
  if (!localStorage.getItem(CREATED_IN)) localStorage.setItem(CREATED_IN, mode());
  add('storage', 'info', `Este armazenamento nasceu no: ${localStorage.getItem(CREATED_IN)}`);
  try {
    const db = await idb();
    const now = new Date().toISOString();
    const visits = (await idbOp(db, 'get', 'visits')) || { count: 0, first: now };
    visits.count += 1;
    const last = visits.last;
    visits.last = now;
    await idbOp(db, 'put', visits, 'visits');
    add('storage', 'ok', `IndexedDB: ${visits.count}ª abertura; primeira em ${visits.first}`);
    if (last) add('storage', 'info', `Abertura anterior: ${last}`);
  } catch (e) {
    add('storage', 'bad', `IndexedDB falhou: ${e}`);
  }
  if (navigator.storage?.persisted) {
    let persisted = await navigator.storage.persisted();
    // O Firefox pergunta ao usuário; sem resposta em 3 s, segue sem.
    if (!persisted && navigator.storage.persist) {
      const timeout = new Promise((resolve) => setTimeout(() => resolve('sem resposta'), 3000));
      persisted = await Promise.race([navigator.storage.persist(), timeout]);
    }
    add('storage', persisted === true ? 'ok' : 'info', `Armazenamento persistente: ${persisted}`);
    const { usage, quota } = await navigator.storage.estimate();
    add('storage', 'info', `Uso: ${(usage / 1024).toFixed(0)} KB de ${(quota / 1048576).toFixed(0)} MB`);
  } else {
    add('storage', 'info', 'navigator.storage indisponível');
  }
}

// ---- 3. Dropbox ----

function b64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function appKey() {
  return document.getElementById('key').value.trim() || localStorage.getItem(KEY) || '';
}

async function connect() {
  const key = appKey();
  if (!key) return add('dropbox', 'bad', 'Informe a app key.');
  localStorage.setItem(KEY, key);
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const state = b64url(crypto.getRandomValues(new Uint8Array(16)));
  localStorage.setItem(VERIFIER, verifier);
  localStorage.setItem(STATE, state);
  localStorage.setItem(STARTED_IN, mode());
  location.href =
    'https://www.dropbox.com/oauth2/authorize?' +
    new URLSearchParams({
      client_id: key,
      response_type: 'code',
      code_challenge: b64url(new Uint8Array(digest)),
      code_challenge_method: 'S256',
      token_access_type: 'offline',
      redirect_uri: redirectUri,
      state,
    });
}

async function tokenRequest(params) {
  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams(params),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${body.error_description || body.error || ''}`);
  return body;
}

/** Volta do login (?code=...): troca o código pelo refresh token. */
async function finishLogin() {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const error = params.get('error');
  if (!code && !error) return;
  history.replaceState(null, '', redirectUri);
  if (error) return add('dropbox', 'bad', `Login recusado: ${error}`);

  const started = localStorage.getItem(STARTED_IN);
  add('dropbox', 'info', `Login iniciado no: ${started || '(desconhecido)'}; voltou no: ${mode()}`);
  const verifier = localStorage.getItem(VERIFIER);
  if (!verifier) {
    return add(
      'dropbox',
      'bad',
      'O login voltou num armazenamento que não tem o verificador do PKCE: ' +
        'provavelmente abriu no Safari, e não no app instalado.',
    );
  }
  if (params.get('state') !== localStorage.getItem(STATE)) {
    return add('dropbox', 'bad', 'O "state" não confere: login ignorado.');
  }
  try {
    const body = await tokenRequest({
      code,
      grant_type: 'authorization_code',
      code_verifier: verifier,
      client_id: localStorage.getItem(KEY),
      redirect_uri: redirectUri,
    });
    localStorage.removeItem(VERIFIER);
    if (body.refresh_token) localStorage.setItem(REFRESH, body.refresh_token);
    add('dropbox', 'ok', `Login concluído (conta ${body.account_id}); refresh token: ${!!body.refresh_token}`);
  } catch (e) {
    add('dropbox', 'bad', `Troca do código falhou: ${e.message}`);
  }
}

async function accessToken() {
  const refresh = localStorage.getItem(REFRESH);
  if (!refresh) throw new Error('não conectado');
  const body = await tokenRequest({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: localStorage.getItem(KEY),
  });
  return body.access_token;
}

async function api(token, endpoint, args) {
  const res = await fetch(`https://api.dropboxapi.com/2/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function upload(token, content, rev) {
  const mode = rev ? { '.tag': 'update', update: rev } : { '.tag': 'add' };
  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({ path: FILE, mode, autorename: false, mute: true }),
    },
    body: JSON.stringify(content),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function download(token) {
  const res = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Dropbox-API-Arg': JSON.stringify({ path: FILE }),
    },
  });
  return { status: res.status, body: res.ok ? await res.json() : null };
}

async function testSync() {
  try {
    const t0 = performance.now();
    const token = await accessToken();
    add('dropbox', 'ok', `Refresh token renovou o acesso (${(performance.now() - t0).toFixed(0)} ms)`);

    const meta = await api(token, 'files/get_metadata', { path: FILE });
    const rev = meta.status === 200 ? meta.body.rev : null;
    let previous = { count: 0 };
    if (rev) {
      const file = await download(token);
      if (file.status === 200) previous = file.body;
      add('dropbox', file.status === 200 ? 'ok' : 'bad', `Download: ${file.status}, contador ${previous.count}`);
    } else {
      add('dropbox', 'info', 'Arquivo ainda não existe na pasta do app');
    }

    const content = { count: previous.count + 1, device: mode(), at: new Date().toISOString() };
    const up = await upload(token, content, rev);
    add('dropbox', up.status === 200 ? 'ok' : 'bad', `Envio condicional (rev ${rev || 'nova'}): ${up.status}`);

    if (up.status === 200 && rev) {
      // A rev antiga não vale mais: o Dropbox tem de recusar (conflito).
      const stale = await upload(token, { ...content, stale: true }, rev);
      add(
        'dropbox',
        stale.status === 409 ? 'ok' : 'bad',
        `Envio com rev desatualizada recusado: ${stale.status === 409} (${stale.status})`,
      );
    }
  } catch (e) {
    add('dropbox', 'bad', `Sync falhou: ${e.message}`);
  }
}

function logout() {
  [REFRESH, VERIFIER, STATE, STARTED_IN].forEach((k) => localStorage.removeItem(k));
  add('dropbox', 'info', 'Login esquecido neste armazenamento.');
}

// ---- 4. Relatório ----

async function copyReport() {
  const text = [
    `Teste Dropbox (ishinydex#53) · ${new Date().toISOString()}`,
    '',
    '[Ambiente]', ...lines.env,
    '', '[Armazenamento]', ...lines.storage,
    '', '[Dropbox]', ...lines.dropbox,
  ].join('\n');
  const area = document.getElementById('report');
  area.value = text;
  area.hidden = false;
  try {
    await navigator.clipboard.writeText(text);
    document.getElementById('copy').textContent = 'Copiado!';
  } catch {
    area.select();
  }
}

document.getElementById('key').value = localStorage.getItem(KEY) || '';
document.getElementById('connect').onclick = connect;
document.getElementById('sync').onclick = testSync;
document.getElementById('logout').onclick = logout;
document.getElementById('copy').onclick = copyReport;

showEnv();
showStorage();
finishLogin().then(() => {
  if (localStorage.getItem(REFRESH) && !new URLSearchParams(location.search).get('code')) {
    add('dropbox', 'info', 'Já conectado neste armazenamento: toque em "Testar sync".');
  }
});
