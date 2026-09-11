# Proxy Diagnostics

1. Load/reload the unpacked extension from `chrome://extensions`.
2. Open the extension popup.
3. Confirm Host `153.75.95.18`, Port `3128`, Scheme `http`, Username `aiproxy`.
4. Enter the Squid password and enable the proxy.
5. Open `https://api.ipify.org` in a normal Chrome tab. The result should be `153.75.95.18`.
6. If the exit IP is correct but Google AI Studio still shows its available-regions page, the browser proxy is working and the remaining issue is Google/AI Studio access or region detection, not the Squid connection.

Chrome's `proxy` extension API controls the browser proxy configuration, so this extension uses that API for the routing layer.
