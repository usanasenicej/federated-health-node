# HealthLedger FL 🧬🔗

> **Decentralized, Privacy-Preserving Machine Learning for Healthcare**

HealthLedger FL is an enterprise-grade, **Polyglot Microservices Architecture** demonstrating the future of medical AI. It combines Federated Learning, Differential Privacy, Blockchain Technology, and specialized microservices in **Rust, Go, Elixir, and Haskell** to train deep neural networks across multiple simulated hospital nodes securely.

All training metadata and inferences are immutably logged to an Ethereum smart contract, creating a fully transparent and verifiable AI audit trail.

---

## 🌟 The Polyglot Architecture

To achieve absolute maximum performance, concurrency, and security, this project assigns specific tasks to the programming languages best suited for them. 

### 1. The Core AI Pipeline
- **ML Aggregation Server (`/ml_server`) - Python/FastAPI/PyTorch**: Orchestrates the Flower federated training rounds and serves predictions via FastAPI.
- **Hospital Nodes (`/ml_clients`) - Python/Opacus**: Simulates local hospital data training. Uses Differential Privacy to inject noise so patient data cannot be reverse-engineered.

### 2. High-Performance Microservices
- **Privacy Enforcer (`/privacy_enforcer`) - Rust 🦀**: A blazing-fast data validation service. It ensures no PII enters the ML pipeline and securely hashes patient IDs using SHA-256 before training.
- **Metrics Gateway (`/metrics_gateway`) - Go 🐹**: A high-throughput API gateway utilizing lightweight Goroutines to handle thousands of incoming telemetry requests from the distributed ML nodes.
- **Realtime Relay (`/realtime_relay`) - Elixir 💧**: Built on the Erlang VM, this fault-tolerant WebSocket server broadcasts live ML training metrics directly to the frontend dashboard.
- **DP Prover (`/dp_prover`) - Haskell ƛ**: A purely functional, academic microservice. It takes the noise multipliers and formally computes mathematical proofs that the Differential Privacy bounds (epsilon/delta) are strictly maintained.

### 3. The Interface & Ledger
- **Dashboard (`/frontend`) - TypeScript/React**: A stunning, next-gen glassmorphism dashboard built with Vite, Tailwind CSS, and Framer Motion to visualize the entire distributed process.
- **Smart Contracts (`/blockchain`) - Solidity**: An Ethereum smart contract (`FederationAudit.sol`) that acts as an immutable ledger for AI decisions.

---

## 🚀 Getting Started

Since this is a massive polyglot architecture, running the entire stack requires Python, Node.js, Rust, Go, Elixir, and Haskell compilers.

For quick local testing of the core AI pipeline and UI:

```bash
# 1. Start the Frontend
cd frontend && npm install && npm run dev

# 2. Start the ML Server
cd ml_server && pip install -r ../requirements.txt && python fl_server.py

# 3. Start the Hospital Clients (Open multiple terminals to simulate hospitals)
cd ml_clients && python client.py
```
*(Check individual microservice folders for instructions on compiling the Rust, Go, Elixir, and Haskell binaries!)*
