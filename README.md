<div align="center">


# DMoney API Load Testing with k6

Automated multi-phase performance and load tests for the **DMoney** fintech platform, built with Grafana k6 and k6-reporter.

![k6](https://img.shields.io/badge/k6-v0.40%2B-7D64FF?style=for-the-badge&logo=k6&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Thresholds](https://img.shields.io/badge/Thresholds-Passed-brightgreen?style=for-the-badge)
![Load Test](https://img.shields.io/badge/Test-Load%20%26%20Performance-blue?style=for-the-badge)

</div>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Test Scenarios & Phases](#-test-scenarios--phases)
- [Prerequisites](#-prerequisites)
- [File Structure](#-file-structure)
- [Setup & Execution](#️-setup--execution)
- [Performance Metrics & Results](#-performance-metrics--results)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Author](#-author)

---

## 📌 Project Overview

This project simulates realistic traffic across multi-phase transaction scenarios on the DMoney fintech platform ([https://dmoney.roadtocareer.net](https://dmoney.roadtocareer.net)). It validates **response times**, **system stability**, and **request success rates** under concurrency, without breaching the defined thresholds.

**Roles covered:** Agents · Customers · Merchants
**Transactions covered:** Send Money · Payment · Deposit

---

## 🎯 Test Scenarios & Phases

**Total duration: 2 minutes**

| Phase | Time Window | Virtual Users | Transactions |
|:-----:|:-----------:|:-------------:|--------------|
| 1 | 0s – 30s | 2 VUs | Send Money, Payment |
| 2 | 30s – 60s | 3 VUs | Send Money, Payment, Deposit |
| 3 | 60s – 90s | 4 VUs | Deposit, Payment |
| 4 | 90s – 120s | 4 VUs | Payment (continuous) |

```mermaid
gantt
    title DMoney Load Test Timeline (120s)
    dateFormat  X
    axisFormat  %Ss
    section Phase 1 · 2 VUs
    Send Money + Payment            :0, 30
    section Phase 2 · 3 VUs
    Send Money + Payment + Deposit  :30, 60
    section Phase 3 · 4 VUs
    Deposit + Payment               :60, 90
    section Phase 4 · 4 VUs
    Payment (continuous)            :90, 120
```

---

## 🛠 Prerequisites

Make sure the following tools are installed:

- [k6](https://k6.io/docs/get-started/installation/) **v0.40+**
- [Node.js](https://nodejs.org/) **v18+**

---

## 📂 File Structure

```plaintext
dmoney-k6-test/
├── screenshots/            # Test report screenshots
├── script.js               # Main k6 multi-phase load testing script
├── setup_auth.js           # Token generation via admin OTP verification
├── setup_all.js            # Runs the complete setup flow
├── seed_users.js           # Creates Agents, Customers and Merchants
├── generate_tokens.js      # Generates JWT tokens for all roles
├── fetch_tokens.js         # Fetches and saves tokens to tokens.json
├── activate_and_deposit.js # Activates accounts and adds initial deposit
├── deposit_balance.js      # Deposits balance into accounts
├── recharge_agents.js      # Recharges agent balances
├── recharge_customer.js    # Recharges customer balances
├── balance_fix.js          # Fixes account balances before a run
├── check_balances.js       # Checks current account balances
├── check_status.js         # Checks account/system status
├── users.json              # Credentials and account details
├── tokens.json             # Active JWT Bearer tokens for all roles
└── report.html             # Generated k6-reporter HTML dashboard
```

---

## ⚙️ Setup & Execution

### 1. Authenticate & Prepare Accounts

Generate fresh bearer tokens and initialize account balances:

```bash
k6 run setup_auth.js
```

> **Note:** Make sure the tokens printed in the console output are saved into `tokens.json`.

### 2. Verify System State *(Optional)*

Run a single iteration to confirm all tokens and routes return HTTP `200`/`201`:

```bash
k6 run debug.js
```

### 3. Run the Load Test

Execute the full multi-phase scenario suite:

```bash
k6 run script.js
```

### 4. View the Test Report

Open the generated report in your default browser:

```powershell
Start-Process report.html
```

---

## 📊 Performance Metrics & Results

> Report generated: **2026-10-10 21:27** (k6-reporter v3.0.4)

### Overall Summary

| Metric | Result |
|--------|:------:|
| Total Requests | **391** (3.25 req/s) |
| Total Iterations | **219** (1.82 iter/s) |
| Virtual Users | Min **2** · Max **6** |
| Breached Thresholds | **0** ✅ (Passed) |
| Failed Requests | **12** (3.07%) |
| Checks | **379** passed · **12** failed |
| Data Received / Sent | 0.25 MB / 0.07 MB |

### Response Times (ms)

| Metric | Avg | Min | Med | Max | P(90) | P(95) |
|--------|:---:|:---:|:---:|:---:|:-----:|:-----:|
| `http_req_duration` | 241.76 | 126.37 | 171.16 | 3178.91 | 316.35 | 507.50 |
| `deposit_response_time` | 231.22 | 176.57 | 206.12 | 510.90 | 324.02 | 337.46 |

### Success Rates

| Transaction | Success Rate | Passed | Failed | |
|-------------|:------------:|:------:|:------:|---|
| Send Money | **100.00%** | 71 | 0 | ![100%](https://img.shields.io/badge/100%25-brightgreen?style=flat-square) |
| Payment | **97.72%** | 214 | 5 | ![97.72%](https://img.shields.io/badge/97.72%25-green?style=flat-square) |
| Deposit | **93.07%** | 94 | 7 | ![93.07%](https://img.shields.io/badge/93.07%25-yellowgreen?style=flat-square) |

### Key Observations

- All defined thresholds passed (**0 breached**), even with 12 failed requests overall.
- **Send Money** was fully stable with zero failures.
- **Payment** and **Deposit** showed minor failures (5 and 7 respectively) under concurrent load.
- Median latency of ~171ms and P(95) of ~508ms indicate responsive behavior; the max of ~3.18s points to a few isolated slow requests.

---

## 📸 Screenshots

All test run screenshots are also available here:

### 🔗 [View All Screenshots on Google Drive](https://drive.google.com/https://drive.google.com/drive/folders/https://drive.google.com/drive/folders/1SO5cJpWqUIa51ALeHiXUR9CX5Mg4mpRk?usp=sharing)

---

## 🧰 Tech Stack

<p>
  <img src="https://img.shields.io/badge/Grafana%20k6-7D64FF?style=flat-square&logo=k6&logoColor=white"/>
  <img src="https://img.shields.io/badge/k6--reporter-HTML%20Reports-orange?style=flat-square"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/>
</p>

---

## 👤 Author

**Md. Ebnul Ahsan**
CSE Student, AIUB 

[![GitHub](https://img.shields.io/badge/GitHub-EbnulAhsan-181717?style=flat-square&logo=github)](https://github.com/EbnulAhsan)

---

<div align="center">

⭐ If you found this project useful, consider giving it a star!

</div>
