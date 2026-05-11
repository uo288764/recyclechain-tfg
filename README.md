# RecycleChain

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=uo288764_recyclechain-tfg&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=uo288764_recyclechain-tfg)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=uo288764_recyclechain-tfg&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=uo288764_recyclechain-tfg)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=uo288764_recyclechain-tfg&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=uo288764_recyclechain-tfg)

Blockchain-based recycling incentive platform. Users earn ERC-20 tokens (RCT) for recycling at registered stations. Built as a Final Degree Project (TFG) at the Universidad de Oviedo.

## Stack

- **Smart contract** — Solidity ERC-20 on Polygon Amoy testnet, deployed with Hardhat
- **Backend** — Spring Boot 4 + PostgreSQL 15 + JWT + Spring Security
- **Frontend** — React 18 + Vite + TailwindCSS + ethers.js + MetaMask

## Getting started

### Prerequisites

- Node.js 18+
- Java 21
- Docker
- WSL2 (Windows) or Linux/macOS
- MetaMask browser extension

### Run in development

Copy the environment template and fill in the values:

```bash
cp frontend/.env.example frontend/.env
```

Start all services with a single command from the repo root:

```bash
make dev
```

This will start PostgreSQL (Docker), wait for it to be ready, start the Spring Boot backend, wait for it to be ready, and finally start the React frontend.

| Service    | URL                   |
|------------|-----------------------|
| Frontend   | http://localhost:5173 |
| Backend    | http://localhost:8080 |
| PostgreSQL | localhost:5432        |

To stop PostgreSQL:

```bash
make stop
```

To stop the backend: `kill $(lsof -ti:8080)`

## Project structure

```
recyclechain-tfg/
├── contracts/        # Solidity smart contract + Hardhat config
├── backend/          # Spring Boot application
│   └── docker-compose.yml
├── frontend/         # React application
│   ├── src/
│   │   ├── config/   # Network constants (network.js)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── .env.example
└── Makefile
```

## Environment variables

All frontend network configuration lives in `frontend/.env` (not committed). Copy `frontend/.env.example` and fill in:

| Variable | Description |
|---|---|
| `VITE_CONTRACT_ADDRESS` | Deployed RecyclingRewards contract address |
| `VITE_OPERATOR_ADDRESS` | Operator wallet address |
| `VITE_AMOY_CHAIN_ID` | Polygon Amoy chain ID (0x13882) |
| `VITE_RPC_PRIMARY` | Primary RPC endpoint |
| `VITE_RPC_SECONDARY` | Secondary RPC endpoint |
| `VITE_RPC_FALLBACK` | Fallback RPC endpoint |

## Contract

- **Network** — Polygon Amoy testnet
- **Token** — RecycleToken (RCT), ERC-20
- **Address** — `0x662fEf246bd13DCfeD3f9F82A0efbea1586daA77`

## License

Academic project — Universidad de Oviedo, Escuela de Ingeniería Informática.
