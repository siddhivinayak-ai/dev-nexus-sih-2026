# 🛡️ BidShield AI — Client Dashboard (React + Vite + Tailwind CSS)

### Smart India Hackathon 2026 | Team Dev Nexus
**Branch:** `siddhivinayak-frontend-version0.1`  
**Lead & Author:** Siddhivinayak Waghmode

---

## 📌 Overview

The **BidShield AI Frontend** is a dark-themed, modern, high-density procurement fraud supervision dashboard built for government auditors and the Competition Commission of India (CCI). It interfaces directly with our dual backend engines:

1. **Engine 1: Statistical Anomaly Detection (DBSCAN + PyTorch)** — Visualizing bid timing offsets, pricing distributions, and high-density Bill of Quantities (BOQ) margin schedules.
2. **Engine 2: Layout-Aware RAG (Document Intelligence)** — Split-screen PDF text inspection, font fingerprint matching, watermark scanning, and side-by-side text diffing.

---

## 🎨 Key Interface Features & Design Concepts

### 1. 🌐 Landing Homescreen & Mock Auditor Verification
- **Sleek Hero Section**: Charcoal/slate background with radial dotted pattern grid, glowing blue accents, and core feature highlight cards.
- **Mock Login & Registration Modals**: Pre-filled credentials (`auditor@gem.gov.in` / `admin123`) for instant authentication and demonstration.

### 2. 📊 Executive Audit Dashboard
- **Aggregate KPI Stats**: Real-time counter cards for scanned tenders, detected cartels, estimated public savings (₹ Cr), and pending auditor alerts.
- **Interactive Recharts**: Area charts for monthly cartel detection trends and savings, plus bar charts for tender distribution.
- **Searchable Tenders Portal**: Filter tenders by risk status (`FLAGGED_CCI`, `UNDER_INVESTIGATION`, `CLEAN`).

### 3. 📊 High-Density BOQ Tables with Confidence Scores (Engine 1)
- **Excel-like Item Grid**: Line-by-line price breakdowns across bidders (TechNova, Digital Infra, CompuWorld).
- **Color-Coded Confidence Badges**: Green for independent pricing (>90%), Yellow/Red for cover-bidding ratios (<20%).
- **Inline Hover Popovers**: Hover over any table cell to trigger a source snippet popover detailing exact pricing formula variances.

### 4. 🗺️ Split-Screen PDF & Layout RAG Viewer (Engine 2)
- **Left Column**: Interactive proposal PDF text reader with line-by-line highlight markers for matching clauses and watermarks.
- **Right Column**: Pairwise RAG similarity scores (text similarity, layout match, font fingerprints, boilerplate overlaps).
- **Click-to-Highlight**: Clicking any flagged section card in the similarity panel instantly scrolls to and highlights that paragraph in the PDF text reader.

### 5. 🗂️ Version Control & Change Diffing Visualizer
- **Side-by-Side Red/Green Diffing**: Visual comparison of proposal texts or tender revisions.
- **Color Coding**: Deletions in red strikethrough (`diff-deletion`) and additions in green highlight (`diff-addition`).

### 6. 🕸️ Collusive Entity Network Topology Graph
- **Canvas-Based Node-Link Graph**: Interactive network map visualizing shared directors (e.g. Rajesh Waghmode), submission IP addresses (192.168.4.112), PDF author metadata (`siddhivinayak.w`), and leaked subcontract payouts.

### 7. 💬 Contextual Compliance Copilot Chat Drawer
- **Persistent Side Drawer**: Floating chat assistant capable of answering tender queries ("Compare terms", "Check IP address match").
- **Page Citation Badges**: Clickable citation badges linked to page numbers that navigate straight to the relevant PDF section.

### 8. 📄 CCI Compliance Report & Evidence Package
- **Print-Ready Layout**: Printable report document with official CCI headers, mathematical risk indices, itemized bid breakdowns, and audit directive banners.
- **One-Click Print/Export**: Triggers native browser print dialog (`window.print()`).

---

## 🔧 Tech Stack

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS v4 + PostCSS (@tailwindcss/postcss)
- **Icons**: Lucide React (`lucide-react`)
- **Charts & Graphs**: Recharts (`recharts`)
- **Animations**: Framer Motion (`framer-motion`) + Glassmorphism CSS
- **API Client**: Axios/Fetch with automatic mock fallback (`/src/services/api.js`)

---

## 🚀 Running Locally

```bash
# Navigate to client directory
cd client

# Install dependencies (if not already done)
npm install

# Start Vite local development server
npm run dev
```

The application will be accessible at: `http://localhost:5173`
