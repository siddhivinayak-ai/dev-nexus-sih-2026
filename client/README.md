# 🛡️ DevNexus — Procurement Intelligence & Cartel Detection Platform

**Branch:** `devnexus-light-ui-v0.2`  
**Author:** Siddhivinayak Waghmode

---

## 📌 Overview

**DevNexus** is an enterprise-grade, light-themed SaaS platform for procurement security and cartel detection. Built for government procurement officers and the Competition Commission Audit Bureau, it provides real-time fraud interception before public tender payouts are authorized.

---

## 🎨 Design Architecture (Light Theme SaaS)

- **Color Palette**: Off-white SaaS canvas (`#f4f5f8`), crisp white card containers (`#ffffff`), slate typography (`#0f172a`), Sky Blue accents (`#3b82f6`), and warning indicators (`#f97316` / `#ef4444`).
- **Top Navigation Bar**: Top pill navigation bar (`Overview`, `Scanned Tenders`, `Engine 1 BOQ`, `Engine 2 RAG`, `CCI Reports`).
- **Multi-Layer Layout**:
  - **Left Hero Card**: Sky Blue gradient banner with 3D security motifs and savings metrics.
  - **Metric Cards with Radial Arc Gauges**: DBSCAN anomaly index (82%) and layout similarity match (71%) with SVG semi-circle progress gauges.
  - **Category Risk Spread Chart**: Interactive department risk breakdown chart.
  - **Bottom Performance Row**: Velocity metrics and workforce output trackers.

---

## 🚀 Key Features

1. **Homescreen & Auditor Authentication**:
   - Clean light SaaS hero section with primary/secondary actions.
   - Light authentication modal with pre-filled auditor credentials (`auditor@devnexus.io` / `admin123`).

2. **Tender Verification Portal**:
   - Filterable table for risk statuses (`FLAGGED_CCI`, `UNDER_INVESTIGATION`, `CLEAN`).

3. **High-Density BOQ Table (Engine 1)**:
   - Excel-like line-by-line price breakdown grid across bidders.
   - Hover popovers displaying exact pricing formula breakdown snippets.

4. **Split-Screen PDF Viewer & Layout RAG (Engine 2)**:
   - Left side proposal reader with highlighted matching clauses (`[HIGHLIGHT-WARRANTY]`).
   - Right side pairwise RAG similarity metrics cards with click-to-highlight navigation.

5. **Side-by-Side Version Diff Visualizer**:
   - Red strikethrough (`diff-deletion`) and green highlight (`diff-addition`) for text comparisons.

6. **Collusive Entity Topology Graph**:
   - Interactive Canvas node-link graph mapping shared directors, gateway IPs, PDF metadata, and kickback leaks.

7. **DevNexus Compliance Copilot**:
   - Contextual AI chat drawer with page citation badges.

8. **CCI Compliance Audit Package**:
   - Formal audit document with one-click PDF printing (`window.print()`).

---

## 🔧 Setup & Development

```bash
cd client
npm install
npm run dev
```

Dev Server: `http://localhost:5173`
