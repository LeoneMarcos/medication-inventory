<p align="center">
  <img src="./public/medication-inventory-mark.webp" alt="Medication Inventory logo" width="160" />
</p>

<h1 align="center">Medication Inventory</h1>

<p align="center">
  A focused inventory workspace for medication stock, batches, expiration dates, and movement control.
</p>

<p align="center">
  <a href="https://inventory.leonemarcos.com/">
    <img src="https://img.shields.io/badge/Demo-Live-brightgreen?style=flat-square" alt="Live Demo" />
  </a>
  <a href="https://github.com/LeoneMarcos/medication-inventory/actions/workflows/ci.yml">
    <img src="https://github.com/LeoneMarcos/medication-inventory/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-Apache%202.0-green?style=flat-square" alt="Apache 2.0 License" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.9" />
  <img src="https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3.4" />
  <img src="https://img.shields.io/badge/Vitest-3-6e9f18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest 3" />
</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#showcase">Showcase</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#quick-start">Quick Start</a>
</p>

---

## Overview

**Medication Inventory** is a responsive medication stock-control application built with React and TypeScript. It centralizes medication records, batch information, expiration dates, minimum stock levels, and inventory movements in a clear browser-based workspace.

Inventory data remains available locally in the browser, allowing the application to work without a dedicated backend.

### Highlights

- **Medication records** — Track medication name, batch, manufacturer, expiration date, stock, and minimum stock.
- **Stock movements** — Add or remove defined quantities while preventing negative inventory.
- **Inventory status** — Identify healthy, low-stock, expiring-soon, and expired records.
- **Fast search** — Find records by medication name, batch, or manufacturer.

---

## Showcase

The short showcase video covers the main inventory flow and interface.

[Watch the current showcase video](https://raw.githubusercontent.com/LeoneMarcos/medication-inventory/main/showcase-assets/medication-inventory-showcase.mp4)

---

## Features

- Add and edit medication records.
- Register batch, manufacturer, expiration date, stock, and minimum stock information.
- Add or remove a defined number of units while preventing negative inventory.
- Classify records as healthy, low stock, expiring soon, or expired.
- Review dashboard metrics for inventory health.
- Search by medication name, batch, or manufacturer.
- Keep inventory data locally in the browser.
- Responsive interface for desktop and mobile use.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| UI | Lucide React |
| Build | Vite |
| Testing | Vitest |
| Linting | ESLint |
| CI | GitHub Actions |

## Quick Start

### Prerequisites

- Node.js and npm

### 1. Clone the repository

```bash
git clone https://github.com/LeoneMarcos/medication-inventory.git
cd medication-inventory
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open the localhost URL printed by Vite.

## Testing

```bash
npm run lint
npm test -- --run
npm run build
```

The automated checks cover deterministic inventory rules, linting, and production build validation. The **Publish Showcase** GitHub Actions workflow regenerates the canonical showcase video on demand; the stable video URL is reused by the project README, profile, and portfolio.

## License

This project is licensed under the **Apache License 2.0**. See [`LICENSE`](LICENSE) for details.
