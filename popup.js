const DEFAULTS = {
  enabled: false,
  host: "153.75.95.18",
  port: 3128,
  scheme: "http",
  username: "aiproxy",
  password: ""
};

const $ = (id) => document.getElementById(id);

function msg(text, className = "") {
  $("message").textContent = text;
  $("message").className = className;
}

async function load() {
  const config = { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };

  $("host").value = config.host;
  $("port").value = config.port;
  $("scheme").value = config.scheme;
  $("username").value = config.username;
  $("password").value = config.password;
  $("enabled").checked = Boolean(config.enabled);
}

async function save() {
  const config = {
    enabled: $("enabled").checked,
    host: $("host").value.trim(),
    port: Number($("port").value),
    scheme: $("scheme").value,
    username: $("username").value.trim(),
    password: $("password").value
  };

  if (!config.host) throw new Error("Enter VPS host/IP.");
  if (!config.port) throw new Error("Enter proxy port.");
  if (!config.username) throw new Error("Enter proxy username.");
  if (!config.password) throw new Error("Enter proxy password.");

  await chrome.storage.local.set(config);
  return config;
}

$("save").onclick = async () => {
  try {
    await save();
    msg("Settings saved.", "success");
  } catch (error) {
    msg(error.message, "error");
  }
};

$("test").onclick = async () => {
  try {
    $("test").disabled = true;
    msg("Testing Google AI Studio…");
    await save();

    const response = await fetch("https://aistudio.google.com/", {
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    msg("Connection successful.", "success");
  } catch (error) {
    msg(`Connection failed: ${error.message}`, "error");
  } finally {
    $("test").disabled = false;
  }
};

load().catch((error) => msg(error.message, "error"));
