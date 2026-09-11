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
  const scheme = String(config.scheme || "http").toLowerCase();
  const proxy = scheme === "socks5"
    ? `SOCKS5 ${config.host}:${port}`
    : `PROXY ${config.host}:${port}`;

  // Route all normal web traffic through the VPS proxy.
  // Keep local/private hostnames direct so Chrome extensions and local services
  // are not accidentally sent through Squid.
  return `function FindProxyForURL(url, host) {
    var h = host.toLowerCase();

    if (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "::1" ||
      isPlainHostName(h) ||
      shExpMatch(h, "10.*") ||
      shExpMatch(h, "192.168.*") ||
      shExpMatch(h, "172.16.*") ||
      shExpMatch(h, "172.17.*") ||
      shExpMatch(h, "172.18.*") ||
      shExpMatch(h, "172.19.*") ||
      shExpMatch(h, "172.2?.*") ||
      shExpMatch(h, "172.3?.*")
    ) {
      return "DIRECT";
    }

    return "${proxy}";
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
      pacScript: {
        data: buildPac(config)
      }
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  applyProxy().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  applyProxy().catch(console.error);
});

chrome.storage.onChanged.addListener(() => {
  applyProxy().catch(console.error);
});

chrome.webRequest.onAuthRequired.addListener(
  async (details) => {
    if (!details.isProxy) return {};

    const config = await getConfig();

    if (!config.enabled || !config.username || !config.password) {
      return {};
    }

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
