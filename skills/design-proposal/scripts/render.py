"""Render .excalidraw files to .svg and .png with the real Excalidraw library.

Usage: uv run --with playwright python render.py a.excalidraw [b.excalidraw ...]
Writes a.svg and a.png next to each input, and rewrites the .excalidraw file
with measured text sizes so it opens cleanly in excalidraw.com.
Needs network access (loads @excalidraw/excalidraw from esm.sh).
Set CHROME=/path/to/chrome-or-headless_shell if Playwright's browser isn't installed
(look under ~/.cache/ms-playwright/).
"""
import json, os, sys
from playwright.sync_api import sync_playwright

V = "0.18.0"
JS = """async (scene) => {
  window.EXCALIDRAW_ASSET_PATH = "https://cdn.jsdelivr.net/npm/@excalidraw/excalidraw@%s/dist/prod/";
  const X = await import("https://esm.sh/@excalidraw/excalidraw@%s?deps=react@18.3.1,react-dom@18.3.1");
  const els = X.restoreElements(scene.elements, null, {refreshDimensions: true, repairBindings: true});
  const svg = await X.exportToSvg({elements: els, appState: {exportBackground: true, viewBackgroundColor: "#ffffff", exportPadding: 30}, files: {}});
  document.body.innerHTML = ""; document.body.style.margin = "0"; document.body.appendChild(svg);
  await document.fonts.ready;
  return {svg: svg.outerHTML, els};
}""" % (V, V)

with sync_playwright() as p:
    exe = os.environ.get("CHROME")
    b = p.chromium.launch(**({"executable_path": exe} if exe else {}))
    pg = b.new_page(device_scale_factor=1.5, viewport={"width": 1800, "height": 1000})
    pg.goto("about:blank")
    for f in sys.argv[1:]:
        scene = json.load(open(f))
        res = pg.evaluate(JS, scene)
        scene["elements"] = res["els"]
        json.dump(scene, open(f, "w"), indent=1)
        open(f.replace(".excalidraw", ".svg"), "w").write(res["svg"])
        pg.wait_for_timeout(500)
        pg.locator("svg").first.screenshot(path=f.replace(".excalidraw", ".png"))
        print("rendered", f)
    b.close()
