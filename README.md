# HealthLedger FL 🧬🔗

> **Decentralized, Privacy-Preserving Machine Learning for Healthcare**

HealthLedger FL is an enterprise-grade, multi-tier architecture demonstrating the future of medical AI. It combines **Federated Learning**, **Differential Privacy**, and **Blockchain Technology** to train deep neural networks across multiple simulated hospital nodes without ever exposing sensitive patient data. 

All training metadata and model inferences are immutably logged to an Ethereum smart contract, creating a fully transparent and verifiable AI audit trail.

---

## 🌟 Architecture & Tech Stack

This project is divided into four main pillars, completely avoiding basic Jupyter notebooks in favor of production-ready microservices:

1. **Frontend Dashboard (`/frontend`)**
   - **Tech:** React (Vite), Tailwind CSS, Framer Motion, Recharts
   - **Role:** A visually stunning, glassmorphism-styled dashboard for doctors. It provides real-time visualizations of federated learning aggregation rounds and a live feed of blockchain audit blocks.
   
2. **Federated Learning Clients (`/ml_clients`)**
   - **Tech:** PyTorch, Flower (`flwr`), Opacus, NumPy
   - **Role:** Simulates hospital nodes. Each node generates its own private cardiovascular dataset and trains a local model. **Opacus** injects mathematical noise (Differential Privacy) to guarantee patient data cannot be reverse-engineered from the model weights.

3. **Aggregation Server & API (`/ml_server`)**
   - **Tech:** PyTorch, FastAPI, Flower Server
   - **Role:** Orchestrates the federated training rounds, aggregating weights from hospital nodes to form a robust global model. The FastAPI server exposes a `/predict` endpoint that handles inference requests and simulates logging the interactions to the blockchain.

4. **Smart Contracts (`/blockchain`)**
   - **Tech:** Solidity, Hardhat
   - **Role:** Contains `FederationAudit.sol`, an Ethereum smart contract that acts as an immutable ledger. It logs the global model's hash and accuracy after every training round, as well as tracking every single prediction request made by doctors.

---

## 🚀 Getting Started

To run this complex decentralized system locally, you will need to run the components simultaneously.

### 1. Install Dependencies

Ensure you have Python 3.8+ and Node.js installed.

```bash
# Install Python ML dependencies
pip install -r requirements.txt

# Install Frontend dependencies
cd frontend
npm install
```

### 2. Start the Frontend Dashboard
Open a terminal and start the Vite development server:
```bash
cd frontend
npm run dev
```
Navigate to `http://localhost:5173` to view the stunning dashboard.

### 3. Start the ML Aggregation Server
Open a new terminal and start the Flower server and FastAPI backend:
```bash
cd ml_server
python fl_server.py
```
*(Note: To run the FastAPI server, you can use `uvicorn api:app --reload --port 8000`)*

### 4. Start the Hospital Nodes (Clients)
Open a new terminal to spin up a simulated hospital node that will connect to the aggregation server and begin federated training:
```bash
cd ml_clients
python client.py
```
*(You can open multiple terminals and run `client.py` in each to simulate multiple hospitals collaborating!)*

---

## 🛡️ Why This Architecture?

Traditional centralized machine learning models require hospitals to pool patient data into a single database, creating massive privacy and security risks. 

**HealthLedger FL** solves this by bringing the *model* to the *data*. Hospitals train the model locally, and only the mathematically-noised model updates (not the data) are sent to the central server. The blockchain integration ensures that no single entity can tamper with the model's history, providing total cryptographic trust in the medical AI's decisions.

---
*Built as a showcase for advanced Agentic Coding and modern AI architectures.*
