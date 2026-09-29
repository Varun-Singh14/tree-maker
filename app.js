// ---------- Tree model ----------
let root = null;
let selectedId = null;
let nextId = 1;

function newId() {
  return nextId++;
}

function findNode(id, node = root) {
  if (!node) return null;
  if (node.id === id) return node;
  return findNode(id, node.left) || findNode(id, node.right);
}

function findParent(id, node = root) {
  if (!node) return null;
  if (node.left && node.left.id === id) return node;
  if (node.right && node.right.id === id) return node;
  return findParent(id, node.left) || findParent(id, node.right);
}

function createRoot(value) {
  root = { id: newId(), value, left: null, right: null };
  selectedId = root.id;
}

function addChild(parentId, side, value = "0") {
  const parent = findNode(parentId);
  if (!parent || parent[side]) return;
  const child = { id: newId(), value, left: null, right: null };
  parent[side] = child;
  // keep the parent selected so both children can be added back-to-back
}

function deleteNode(id) {
  if (root && root.id === id) {
    root = null;
    selectedId = null;
    return;
  }
  const parent = findParent(id);
  if (!parent) return;
  if (parent.left && parent.left.id === id) parent.left = null;
  if (parent.right && parent.right.id === id) parent.right = null;
  if (selectedId === id) selectedId = null;
}

function resetTree() {
  root = null;
  selectedId = null;
  nextId = 1;
}

// ---------- Layout (for on-screen canvas) ----------
const LEAF_SPACING = 70;
const LEVEL_HEIGHT = 90;
const MARGIN = 50;
const NODE_R = 24;

function computeLayout() {
  let counter = 0;
  let maxDepth = 0;

  function assign(node, depth) {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    if (!node.left && !node.right) {
      node._x = counter++;
      node._y = depth;
      return;
    }
    if (node.left) assign(node.left, depth + 1);
    if (node.right) assign(node.right, depth + 1);
    const xs = [];
    if (node.left) xs.push(node.left._x);
    if (node.right) xs.push(node.right._x);
    node._x = xs.reduce((a, b) => a + b, 0) / xs.length;
    node._y = depth;
  }

  if (root) assign(root, 0);
  return { leafCount: counter, maxDepth };
}

// ---------- SVG rendering ----------
const svg = document.getElementById("tree-svg");

function renderCanvas() {
  svg.innerHTML = "";

  if (!root) {
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    return;
  }

  const { leafCount, maxDepth } = computeLayout();
  const width = Math.max(leafCount * LEAF_SPACING + MARGIN * 2, 300);
  const height = maxDepth * LEVEL_HEIGHT + MARGIN * 2 + NODE_R;

  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const toPx = (node) => ({
    px: MARGIN + node._x * LEAF_SPACING,
    py: MARGIN + node._y * LEVEL_HEIGHT,
  });

  const linksGroup = document.createElementNS(svg.namespaceURI, "g");
  const nodesGroup = document.createElementNS(svg.namespaceURI, "g");

  // draw links first so nodes sit on top
  (function drawLinks(node) {
    if (!node) return;
    const { px, py } = toPx(node);
    [node.left, node.right].forEach((child) => {
      if (!child) return;
      const cp = toPx(child);
      const line = document.createElementNS(svg.namespaceURI, "line");
      line.setAttribute("x1", px);
      line.setAttribute("y1", py);
      line.setAttribute("x2", cp.px);
      line.setAttribute("y2", cp.py);
      line.setAttribute("class", "tree-link");
      linksGroup.appendChild(line);
    });
    drawLinks(node.left);
    drawLinks(node.right);
  })(root);

  (function drawNodes(node) {
    if (!node) return;
    const { px, py } = toPx(node);
    const g = document.createElementNS(svg.namespaceURI, "g");
    g.setAttribute("class", "node-group" + (node.id === selectedId ? " selected" : ""));
    g.setAttribute("transform", `translate(${px}, ${py})`);

    const circle = document.createElementNS(svg.namespaceURI, "circle");
    circle.setAttribute("r", NODE_R);
    circle.setAttribute("class", "node-circle");

    const text = document.createElementNS(svg.namespaceURI, "text");
    text.setAttribute("class", "node-text");
    text.textContent = node.value;

    g.appendChild(circle);
    g.appendChild(text);
    g.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedId = node.id;
      renderSidebar();
      renderCanvas();
    });

    nodesGroup.appendChild(g);
    drawNodes(node.left);
    drawNodes(node.right);
  })(root);

  svg.appendChild(linksGroup);
  svg.appendChild(nodesGroup);
}

svg.addEventListener("click", () => {
  selectedId = null;
  renderSidebar();
  renderCanvas();
});

// ---------- Sidebar rendering ----------
const sidebarContent = document.getElementById("sidebar-content");

function renderSidebar() {
  sidebarContent.innerHTML = "";

  if (!root) {
    sidebarContent.innerHTML = `
      <h3>Create Root Node</h3>
      <p class="hint">Start by giving the root node a value, e.g. <em>fib(5)</em>.</p>
      <label for="root-input">Root value</label>
      <input type="text" id="root-input" placeholder="e.g. fib(5)" value="fib(5)">
      <div class="btn-row">
        <button id="create-root-btn">Create Root</button>
      </div>
    `;
    document.getElementById("create-root-btn").addEventListener("click", () => {
      const val = document.getElementById("root-input").value.trim() || "node";
      createRoot(val);
      renderSidebar();
      renderCanvas();
    });
    return;
  }

  const node = selectedId ? findNode(selectedId) : null;

  if (!node) {
    sidebarContent.innerHTML = `
      <h3>No node selected</h3>
      <p class="hint">Click a node in the canvas to edit its value or add children.</p>
    `;
    return;
  }

  sidebarContent.innerHTML = `
    <h3>Selected Node</h3>
    <label for="value-input">Value</label>
    <input type="text" id="value-input" value="${escapeHtml(node.value)}">
    <div class="btn-row">
      <button id="add-left-btn" ${node.left ? "disabled" : ""}>Add Left Child</button>
      <button id="add-right-btn" ${node.right ? "disabled" : ""}>Add Right Child</button>
    </div>
    <div class="btn-row">
      <button id="delete-node-btn" class="danger">Delete Node</button>
      <button id="deselect-btn">Deselect</button>
    </div>
  `;

  document.getElementById("value-input").addEventListener("input", (e) => {
    node.value = e.target.value;
    renderCanvas();
  });

  document.getElementById("add-left-btn").addEventListener("click", () => {
    addChild(node.id, "left");
    renderSidebar();
    renderCanvas();
  });

  document.getElementById("add-right-btn").addEventListener("click", () => {
    addChild(node.id, "right");
    renderSidebar();
    renderCanvas();
  });

  document.getElementById("delete-node-btn").addEventListener("click", () => {
    if (confirm("Delete this node and its entire subtree?")) {
      deleteNode(node.id);
      renderSidebar();
      renderCanvas();
    }
  });

  document.getElementById("deselect-btn").addEventListener("click", () => {
    selectedId = null;
    renderSidebar();
    renderCanvas();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Reset ----------
document.getElementById("reset-btn").addEventListener("click", () => {
  if (!root || confirm("Clear the entire tree?")) {
    resetTree();
    renderSidebar();
    renderCanvas();
    document.getElementById("ascii-output").textContent = "";
  }
});

// ---------- ASCII art export ----------
// Classic binary-tree pretty printer: returns { lines, width, height, middle }
function display(node) {
  if (!node) return { lines: [], width: 0, height: 0, middle: 0 };

  const line = String(node.value);
  const width = line.length;

  if (!node.left && !node.right) {
    return { lines: [line], width, height: 1, middle: Math.floor(width / 2) };
  }

  if (!node.right) {
    const { lines, width: n, height: p, middle: x } = display(node.left);
    const s = " ".repeat(x + 1) + "_".repeat(n - x - 1) + line;
    const second = " ".repeat(x) + "/" + " ".repeat(n - x - 1 + width);
    const shifted = lines.map((l) => l + " ".repeat(width));
    return {
      lines: [s, second, ...shifted],
      width: n + width,
      height: p + 2,
      middle: n + Math.floor(width / 2),
    };
  }

  if (!node.left) {
    const { lines, width: n, height: p, middle: x } = display(node.right);
    const s = line + "_".repeat(x) + " ".repeat(n - x);
    const second = " ".repeat(width + x) + "\\" + " ".repeat(n - x - 1);
    const shifted = lines.map((l) => " ".repeat(width) + l);
    return {
      lines: [s, second, ...shifted],
      width: n + width,
      height: p + 2,
      middle: Math.floor(width / 2),
    };
  }

  const left = display(node.left);
  const right = display(node.right);
  const n = left.width, p = left.height, x = left.middle;
  const m = right.width, q = right.height, y = right.middle;

  const s = " ".repeat(x + 1) + "_".repeat(n - x - 1) + line + "_".repeat(y) + " ".repeat(m - y);
  const second =
    " ".repeat(x) + "/" + " ".repeat(n - x - 1 + width + y) + "\\" + " ".repeat(m - y - 1);

  let leftLines = left.lines.slice();
  let rightLines = right.lines.slice();
  if (p < q) {
    for (let i = 0; i < q - p; i++) leftLines.push(" ".repeat(n));
  } else if (q < p) {
    for (let i = 0; i < p - q; i++) rightLines.push(" ".repeat(m));
  }

  const merged = [];
  const rows = Math.max(leftLines.length, rightLines.length);
  for (let i = 0; i < rows; i++) {
    const l = leftLines[i] ?? " ".repeat(n);
    const r = rightLines[i] ?? " ".repeat(m);
    merged.push(l + " ".repeat(width) + r);
  }

  return {
    lines: [s, second, ...merged],
    width: n + m + width,
    height: Math.max(p, q) + 2,
    middle: n + Math.floor(width / 2),
  };
}

function treeToAscii() {
  if (!root) return "";
  return display(root)
    .lines.map((l) => l.replace(/\s+$/g, ""))
    .join("\n");
}

document.getElementById("generate-btn").addEventListener("click", () => {
  document.getElementById("ascii-output").textContent = root
    ? treeToAscii()
    : "Tree is empty. Create a root node first.";
});

document.getElementById("copy-btn").addEventListener("click", async () => {
  const text = document.getElementById("ascii-output").textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById("copy-btn");
    const original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = original), 1200);
  } catch {
    alert("Copy failed. Select the text manually.");
  }
});

// ---------- Init ----------
renderSidebar();
renderCanvas();
