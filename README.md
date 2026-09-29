# DSA Tree Maker

A small, dependency-free web app for building binary trees (e.g. recursion trees like `fib(n)`) and exporting them as ASCII art you can paste into notes, docs, or chat.

## Features

- Click a node to select it, then add a left/right child, edit its value, or delete it (with its subtree).
- Visual tree rendered live as an SVG canvas.
- **Generate** produces an ASCII-art rendering of the tree (slashes/underscores connecting parent and child nodes), and **Copy** puts it on the clipboard.
- Light/dark theme toggle (top right) — remembers your choice in `localStorage`, otherwise follows your OS setting.
- No backend, no build step, no data persistence of the tree itself — refreshing the page clears it.

## Running locally

Just open `index.html` in a browser, or serve the folder statically:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure (sidebar, canvas, export panel) |
| `style.css` | Styling, incl. light/dark theme variables |
| `app.js` | Tree data model, SVG rendering, ASCII export |
| `theme.js` | Light/dark theme toggle logic |
| `netlify.toml` | Netlify publish config for deployment |

## Deploying

This is a static site — see `netlify.toml` for the Netlify publish config. Deploy via [Netlify Drop](https://app.netlify.com/drop), the Netlify CLI, or a git-connected Netlify site (base/publish directory: `treemaker`).
