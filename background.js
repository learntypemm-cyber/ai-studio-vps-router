const DEFAULTS = {
  enabled: false,
  host: "153.75.95.18",
  port: 3128,
  scheme: "http",
  username: "aiproxy",
  password: ""
};

async function getConfig() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
}

function buildPac(config) {
  const port = Number(config.port) || 3128;
  const proxy = `${config.scheme === "socks5" ? "SOCKS5" : "PROXY"} ${config.host}:${port}`;

  return `function FindProxyForURL(url, host) {
    var h = host.toLowerCase();
    if (
      h === "aistudio.google.com" ||
      h === "generativelanguage.googleapis.com" ||
      h === "googleapis.com" ||
      dnsDomainIs(h, ".googleapis.com") ||
      h === "google.dev" ||
      dnsDomainIs(h, ".google.dev")
    ) {
      return "${proxy}";
    }
    return "DIRECT";
  }`;
}

async function applyProxy() {
  const config = await getConfig();

  if (!config.enabled || !config.host || !config.port) {
    await chrome.proxy.settings.clear({ scope: "regular" });
    return;
  }

  await chrome.proxy.settings.set({
    scope: "regular",
    value: {
      mode: "pac_script",
      pacScript: { data: buildPac(config) }
    }
  });
}

chrome.runtime.onInstalled.addListener(() => applyProxy().catch(console.error));
chrome.runtime.onStartup.addListener(() => applyProxy().catch(console.error));
chrome.storage.onChanged.addListener(() => applyProxy().catch(console.error));

chrome.webRequest.onAuthRequired.addListener(
  async (details) => {
    if (!details.isProxy) return {};

    const config = await getConfig();
    if (!config.enabled || !config.username || !config.password) return {};

    return {
      authCredentials: {
        username: config.username,
        password: config.password
      }
    };
  },
  { urls: ["<all_urls>"] },
  ["asyncBlocking"]
);

applyProxy().catch(console.error);
