#!/usr/bin/env node
// stdio -> HTTP bridge for SCM's MCP server.
//
// MCP clients (Claude Code, Codex, ...) spawn a process and talk JSON-RPC over
// stdin/stdout. SCM's server is HTTP, inside the running Electron app, because the tools
// need the app's browser and task queue. This relays between the two: read a line from
// stdin, POST it to /mcp, write the reply to stdout.
//
// Register with Claude Code:
//   claude mcp add scm -- npx -y seo-content-machine-mcp
// or install the Claude Code plugin in this repository, which runs this file directly.
//
// Env:
//   SCM_API_URL   base url of the SCM API server (default http://localhost:8008)
//   SCM_API_KEY   sent as "Authorization: Bearer <key>" when the app has a key set
//
// If SCM is closed, the client still connects with no tools, and the tools appear when SCM
// starts. Tool calls made while SCM is closed answer with an error saying to start it.

import {createInterface} from 'node:readline';

const BASE = (process.env.SCM_API_URL || 'http://localhost:8008').replace(/\/+$/, '');
const ENDPOINT = BASE + '/mcp';
const API_KEY = process.env.SCM_API_KEY || '';

// stderr, never stdout: stdout is the JSON-RPC channel and any stray byte corrupts it.
const log = message => process.stderr.write(`[scm-mcp] ${message}\n`);

const rpcError = (id, code, message) => JSON.stringify({jsonrpc: '2.0', id: id ?? null, error: {code, message}});
const rpcResult = (id, result) => JSON.stringify({jsonrpc: '2.0', id, result});
const send = message => process.stdout.write(message + '\n');

const post = body => fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    ...(API_KEY ? {authorization: `Bearer ${API_KEY}`} : {})
  },
  body
});

const isRefused = error => /ECONNREFUSED|fetch failed/i.test(String(error?.message || error));

// Clients connect once at startup and drop a server whose handshake fails, so a user who
// opens Claude Code before SCM would never get the tools. Instead the bridge answers the
// handshake itself, lists no tools, and tells the client to list again once SCM is up.
const OFFLINE_INIT = {protocolVersion: '2024-11-05', capabilities: {tools: {listChanged: true}}, serverInfo: {name: 'scm', version: '1.0.0'}};
const POLL_MS = 5000;
let poll = null;

function waitForApp() {
  if (poll) return;
  log(`SCM is not running; the tools appear once it starts`);
  poll = setInterval(async () => {
    try {
      await post(JSON.stringify({jsonrpc: '2.0', method: 'notifications/initialized'}));
    } catch {
      return;
    }
    clearInterval(poll);
    poll = null;
    log('SCM is up');
    send(JSON.stringify({jsonrpc: '2.0', method: 'notifications/tools/list_changed'}));
  }, POLL_MS);
  poll.unref();
}

function withListChanged(text) {
  try {
    const reply = JSON.parse(text);
    if (reply.result?.capabilities) reply.result.capabilities.tools = {...reply.result.capabilities.tools, listChanged: true};
    return JSON.stringify(reply);
  } catch {
    return text;
  }
}

async function forward(line) {
  let parsed;
  try {
    parsed = JSON.parse(line);
  } catch {
    return rpcError(null, -32700, 'parse error');
  }

  // Notifications (no id) get no reply, same as the HTTP route.
  const id = Array.isArray(parsed) ? null : parsed.id;
  const method = Array.isArray(parsed) ? null : parsed.method;
  const isNotification = !Array.isArray(parsed) && (id === undefined || id === null);

  try {
    const res = await post(line);

    // 202 is the server acknowledging a notification with no body.
    if (res.status === 202) return null;

    const text = (await res.text()).trim();
    if (!res.ok && !text.startsWith('{')) {
      return isNotification ? null : rpcError(id, -32603, `SCM API returned HTTP ${res.status}`);
    }
    return method === 'initialize' ? withListChanged(text) : text || null;
  } catch (error) {
    if (isRefused(error) && method === 'initialize') return rpcResult(id, OFFLINE_INIT);
    if (isRefused(error) && method === 'tools/list') {
      waitForApp();
      return rpcResult(id, {tools: []});
    }
    // "fetch failed" tells the model nothing it can act on, so name the likely cause.
    const message = isRefused(error)
      ? `Cannot reach SCM at ${BASE}. Start SEO Content Machine, or set SCM_API_URL if it is on another port.`
      : String(error?.message || error);
    log(message);
    return isNotification ? null : rpcError(id, -32603, message);
  }
}

log(`relaying stdio to ${ENDPOINT}`);

// One JSON-RPC message per line. Messages are handled in order: a client may pipeline
// requests, and reordering replies would break clients that match on arrival.
const rl = createInterface({input: process.stdin, crlfDelay: Infinity});
let chain = Promise.resolve();

rl.on('line', line => {
  const trimmed = line.trim();
  if (!trimmed) return;
  chain = chain.then(async () => {
    const reply = await forward(trimmed);
    if (reply) send(reply);
  });
});

// Drain before exiting: stdin closing does not mean the in-flight requests are done, and
// exiting here would swallow their replies.
rl.on('close', () => {
  chain.then(() => process.exit(0));
});
