'use strict';

const CDP = process.env.SHIKE_CDP_URL || 'http://127.0.0.1:9251';
const APP = process.env.SHIKE_APP_URL || 'http://127.0.0.1:8765/';
const EXPECTED_VERSION = process.env.SHIKE_EXPECTED_VERSION;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function assert(value, message) {
  if (!value) throw new Error(message);
}

class Client {
  constructor(url) {
    this.url = url;
    this.id = 0;
    this.pending = new Map();
  }
  async open() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const item = this.pending.get(message.id);
      this.pending.delete(message.id);
      message.error ? item.reject(new Error(message.error.message)) : item.resolve(message.result || {});
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`${method} timeout`));
      }, 60000).unref();
    });
  }
  async evaluate(expression) {
    const reply = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (reply.exceptionDetails) {
      const detail = reply.exceptionDetails.exception && reply.exceptionDetails.exception.description;
      throw new Error(detail || reply.exceptionDetails.text);
    }
    return reply.result && reply.result.value;
  }
}

async function main() {
  assert(EXPECTED_VERSION, 'SHIKE_EXPECTED_VERSION is required');
  const targets = await fetch(`${CDP}/json`).then((response) => response.json());
  const target = targets.find((item) => item.type === 'page');
  assert(target, 'CDP page target missing');
  const client = new Client(target.webSocketDebuggerUrl);
  await client.open();
  await client.send('Runtime.enable');
  await client.send('Page.enable');
  await client.send('Network.enable');
  await client.send('Network.clearBrowserCache');
  await client.send('Storage.clearDataForOrigin', { origin: new URL(APP).origin, storageTypes: 'all' });
  await client.send('Page.navigate', { url: APP });

  let ready = false;
  for (let attempt = 0; attempt < 100 && !ready; attempt += 1) {
    await sleep(200);
    ready = await client.evaluate(`typeof ShikeRetrievalEngine==='object'&&typeof ShikeAgent==='object'&&typeof ShikeWatchCenter==='undefined'`);
  }
  assert(ready, 'network runtime modules did not load');

  const result = await client.evaluate(`(async()=>{
    ShikeRetrievalCache.clear();
    const before=(window.records||[]).length;
    const providers=ShikeRetrievalEngine.providers();
    const local=ShikeRetrievalEngine.classify('打开日历');
    const knowledge=ShikeRetrievalEngine.classify('GitHub 上有哪些 PWA 开源项目？');
    let github=await ShikeRetrievalEngine.search('GitHub 上有哪些 PWA 开源项目？',{classification:knowledge,timeout:9000});
    if(!github.ok){
      await new Promise((resolve)=>setTimeout(resolve,800));
      github=await ShikeRetrievalEngine.search('GitHub 上有哪些 PWA 开源项目？',{classification:knowledge,timeout:9000});
    }
    const weatherClass=ShikeRetrievalEngine.classify('北京现在天气怎么样？');
    const weather=await ShikeRetrievalEngine.search('北京现在天气怎么样？',{classification:weatherClass,timeout:9000});
    ShikeAgent.clearContext();
    const agent=await ShikeAgent.handle('GitHub 上有哪些 PWA 开源项目？');
    return {
      version:APP_VERSION,
      providers,
      local,
      knowledge,
      github:{ok:github.ok,count:github.sources.length,source:github.sources[0]||null,fallbacks:github.fallbackLinks},
      weather:{ok:weather.ok,count:weather.sources.length,source:weather.sources[0]||null},
      agent:{retrieval:agent.retrieval,count:(agent.sources||[]).length},
      watchRemoved:typeof ShikeWatchCenter==='undefined',
      before,
      after:(window.records||[]).length
    };
  })()`);

  assert(result.version === EXPECTED_VERSION, `version mismatch: ${result.version}`);
  assert(['wikipedia', 'wikidata', 'github', 'stackexchange', 'open-meteo'].every((id) => result.providers.includes(id)), 'provider registry incomplete');
  assert(result.local.kind === 'local', 'local operation classification failed');
  assert(result.knowledge.kind === 'network' && result.knowledge.domain === 'github', 'knowledge classification failed');
  assert(result.github.ok && result.github.count > 0, 'GitHub retrieval returned no public result');
  assert(result.github.source && result.github.source.url && result.github.source.title && result.github.source.fetchedAt, 'unified source schema incomplete');
  assert(result.github.fallbacks.length === 3, 'search fallback links missing');
  assert(result.weather.ok && result.weather.source && /Open-Meteo/.test(result.weather.source.source), 'Open-Meteo retrieval or attribution failed');
  assert(result.agent.retrieval && result.agent.count > 0, 'Agent did not route knowledge query to retrieval');
  assert(result.before === result.after, 'knowledge query modified local records');
  assert(result.watchRemoved, 'Watch Center module is still active');
  client.ws.close();
  console.log(`Network CDP acceptance passed: GitHub=${result.github.count}, weather=${result.weather.count}`);
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
