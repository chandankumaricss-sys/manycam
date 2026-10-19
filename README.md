# ManyCam Enterprise Control Center

> **Enterprise Windows Virtual Camera Administration, Fleet Management, Silent Deployment & Telemetry Platform**  
> *Client Context:* Augment — Senior Windows Application Developer (Virtual Camera)  
> *Status:* Production Demo Prototype • Fully Functional Local Architecture  
> *Brand Reference:* Independently developed ManyCam-inspired enterprise demonstration

---

## Executive Summary

The **ManyCam Enterprise Control Center** is a production-grade, enterprise SaaS administration dashboard engineered to demonstrate how IT administrators manage, configure, deploy, and troubleshoot thousands of Windows computers running a virtual camera desktop application.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM with SQLite**, the application manages a realistic deterministic fleet of **2,486 Windows endpoints** across 12 enterprise organizations. Every visible interactive element functions against persisted database records.

---

## Brand Architecture & Visual Design

- **Application Background:** Pure White (`#FFFFFF`)
- **Sidebar Background:** Pure White (`#FFFFFF`), fixed 248px width, collapsible
- **Top Navigation Background:** Pure White (`#FFFFFF`), sticky with breadcrumbs and Ctrl+K command menu
- **Brand Identity:** Primary Blue (`#0796E5`), Deep Blue (`#0878BF`), Cyan (`#22B8F0`), Success Green (`#10B981`), Warning Amber (`#F59E0B`), Critical Red (`#EF4444`)
- **Typography:** Modern clean enterprise font hierarchy optimized for 1920×1080 Full-HD presentation recording without horizontal overflow

---

## The Exactly 7 Primary Modules

| # | Module | Route | Key Capabilities |
|---|---|---|---|
| **1** | **Overview** | `/overview` | 6 executive KPI cards (2,486 devices, 2,312 online, 2,274 healthy cameras, 98.4% success, 94.7% compliance, 18 alerts), Fleet Health status breakdown, Windows OS distribution donut, installation/update trends, recent activity feed, and quick actions. |
| **2** | **Device Fleet** | `/devices` | Enterprise endpoint inventory with multi-column sorting, pagination, filtering (OS, health, channel, org, compliance), multi-select batch actions, CSV export, device enrollment modal, and a comprehensive **7-tab device drawer** (General, Camera Studio, Deployment, Updates, Security, Diagnostics, Activity). |
| **3** | **Virtual Camera** | `/camera` | 3-column studio layout: Input source switcher (SMPTE bars, calibration crosshairs, green screen, presentation, local webcam), 16:9 canvas live video preview with shader adjustments (brightness, contrast, saturation, zoom, blur), PNG snapshot download, persistent preset saving/restoration, ADMX policy editor, and clickable Windows Media Foundation architecture diagram. |
| **4** | **Deployment Center** | `/deployments` | Application package registry (MSI, MSIX, WiX-MSI, Burn Bootstrapper), 8-step publish package wizard, 6-step deployment wizard, deterministic simulation runner with live installer event journal, silent command copy buttons, enterprise integration cards (Intune, MECM, GPO, AVD), and exit code troubleshooting (0, 1603, 1618, 3010). |
| **5** | **Updates & Releases** | `/updates` | 5-ring staged rollout progression (QA 1% → Pilot 5% → Early Adopters 20% → Broad 65% → GA 100%), automated safety gates with auto-pause triggers, release authoring wizard, and an **11-step in-place upgrade & rollback simulation engine**. |
| **6** | **Security & Compliance** | `/security` | Authenticode code signing records (DigiCert EV, Microsoft WHQL), certificate lifecycle monitoring, Windows security controls (UAC, SmartScreen, AppLocker, WDAC UMCI), Endpoint Security / EDR compatibility matrix (Defender, CrowdStrike, SentinelOne), RBAC permissions matrix, and immutable audit trail with CSV export. |
| **7** | **Diagnostics & Analytics** | `/diagnostics` | Health telemetry monitoring, full-text searchable event log explorer (2,000+ events), MSI exit code lookup, **interactive 9-step automated camera diagnostic runner**, 13-stage Windows CI/CD pipeline center (GitHub Actions & Azure DevOps), and enterprise report generator with CSV downloads. |

*Global Settings (`/settings`) is accessible via the top-right header and bottom sidebar without adding an 8th primary module.*

---

## Technical Deep-Dive: Windows Virtual Camera Engineering

### 1. Windows Media Foundation (IMFVirtualCamera) Driver Architecture
On modern Windows 10 (21H2+) and Windows 11 (22H2/23H2/24H2), virtual camera devices are implemented in user space via the Media Foundation `IMFVirtualCamera` API (`MFVirtualCameraType_SoftwareCameraSource`). This decouples video capture from kernel-mode driver space, preventing blue screen (BSOD) system crashes.

### 2. Silent Enterprise Installation & Elevation Boundaries
- **MSI Packaging:** Machine-wide installation requires elevation:
  ```cmd
  msiexec /i "ManyCamEnterprise-3.8.2-x64.msi" /qn /norestart ALLUSERS=1 /L*v "%ProgramData%\ManyCam\install.log"
  ```
- **Custom Actions:** `VirtualCamRegisterServer` registers COM InprocServer32 CLSIDs in `HKLM\SOFTWARE\Classes\CLSID`. Lack of administrative token produces exit code **1603**.
- **Automated Repair:**
  ```cmd
  msiexec /fa {MANYCAM-PRODUCT-CODE} /qn /L*v "repair.log"
  ```
- **Clean Uninstall:**
  ```cmd
  msiexec /x {MANYCAM-PRODUCT-CODE} /qn /norestart
  ```

### 3. Exit Code Glossary
- **`0 (ERROR_SUCCESS)`**: Action completed successfully.
- **`1603 (ERROR_INSTALL_FAILURE)`**: Fatal error. Occurs if custom action fails to write to HKLM or AppLocker blocks DLL execution.
- **`1618 (ERROR_INSTALL_ALREADY_RUNNING)`**: Another installation mutex is active. Handled by update agent with exponential backoff.
- **`3010 (ERROR_SUCCESS_REBOOT_REQUIRED)`**: Installation succeeded; reboot required to complete driver filter binding.

---

## Quick Start & Local Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or 10.x

### Installation
```bash
# Clone or navigate to the project directory
cd "virtual cam manycam"

# Install dependencies
npm install

# Generate Prisma Client & Initialize Database
npx prisma generate
npx prisma db push

# Seed deterministic dataset (2,486 devices, rollouts, policies)
node prisma/seed.js

# Build production bundle
npm run build

# Start production server on port 3002 (or default 3000)
npx next start -p 3002
```
Open **`http://localhost:3002`** in your browser.

---

## Automated Test Suite

A complete automated integration test suite is included in `tests/platform.test.js`:
```bash
node tests/platform.test.js
```
**Test Coverage (21 Test Suites):**
- Deterministic seeded metrics verification (2,486 devices, 2,312 online, 2,274 healthy cameras)
- Devices API pagination, search, and filtering
- Device enrollment (POST /api/devices)
- Agent check-in and simulated `msiexec /fa` repair
- Device clean removal (DELETE /api/devices/[id])
- Camera Presets saving and loading
- Camera Policies ADMX rules
- Deployments simulation launch & deterministic progression
- Staged Rollout pause, resume, safety gate tripping, and rollback
- Security Authenticode certificates and EDR matrix
- Diagnostics 2,000+ event log query
- CI/CD 13-stage Windows runner pipeline
- Audit Trail immutable correlation records
- HTML status verification for all 7 primary module routes and settings

---

## Demo Roles & Walkthrough Tour

### Demo Roles Switcher
Accessible via the top-right user avatar:
- **Super Admin (Olivia Chen):** Full uninhibited administrative control across all fleet endpoints and releases.
- **IT Administrator:** Fleet inventory management, ADMX policy sync, and telemetry inspection.
- **Deployment Operator:** Trigger package deployments, advance rollout rings, and retry failed nodes.
- **Security Auditor:** Inspect Authenticode signatures, WDAC rules, and export audit trails.
- **Read-Only Viewer:** View-only access to KPIs, charts, and device data.

### 12 Guided Walkthrough Scenarios
Click **"Demo Tour"** in the top header to launch the interactive walkthrough:
1. Fleet Overview & Enterprise Health
2. Inspect Device Fleet & Camera Configuration
3. Virtual Camera Studio & Saved Presets
4. Package Registry & MSI Packaging Configuration
5. Targeted Deployment to Pilot Ring
6. Deployment Job Diagnostics & Node Troubleshooting
7. Create and Author an Application Release
8. Staged Rollout Across Progressive Rings
9. Automated Safety Gate Tripping & Pause
10. Simulated In-Place Rollback Execution
11. Code Signing & Windows Security Posture
12. CI/CD Windows Pipeline & Compliance Reporting

---

## Simulation Limitations & Disclosure

- **Independent Demonstration:** This console is an independently developed enterprise administration demonstration designed around the ManyCam visual identity for a Senior Windows Application Developer evaluation.
- **Simulated Hardware:** Virtual camera preview uses HTML5 Canvas and browser media APIs to simulate driver rendering. It does not modify physical Windows kernel drivers.
- **Simulated Enterprise Connectors:** Integrations with Microsoft Intune, MECM, Azure Virtual Desktop, and GitHub Actions operate locally using seeded telemetry.

---

## License & Credits
Developed with Next.js, Prisma, and Tailwind CSS.
ManyCam logo and brand identity referenced under fair demonstration context.
