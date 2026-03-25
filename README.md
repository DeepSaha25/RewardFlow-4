# RewardFlow - Stellar Soroban Liquidity App

RewardFlow is a Stellar Testnet project built with Soroban smart contracts (Rust) and a React frontend.

It demonstrates advanced contract structure with a custom token contract and a pool contract that performs inter-contract token transfers.

## Live Demo

- App: https://reward-flow-eta.vercel.app
- Network: Stellar Testnet

## Submission Evidence

### Mobile Responsive View

![Mobile UI](mobileUi.png)

### CI/CD Pipeline

![CI/CD Pipeline](cicdSS.png)

### Application UI

![App UI](rewardflowUI.png)

## Contract Overview

Contracts are in Rust and compiled to WASM for Soroban.

- Token contract: contracts/token/src/lib.rs
- Pool contract: contracts/pool/src/lib.rs

### Inter-contract pattern used

The pool contract uses the Soroban token client to call token transfer during stake/unstake flows:

- stake: transfer user -> pool contract
- unstake: transfer pool contract -> user

This is an inter-contract call pattern on Stellar Soroban.

## Build Artifacts

After build, expected WASM outputs:

```bash
contracts/pool/target/wasm32-unknown-unknown/release/*.wasm
contracts/token/target/wasm32-unknown-unknown/release/*.wasm
```

## Tech Stack

- Smart contracts: Rust + Soroban SDK
- Frontend: React + TypeScript + Vite
- Wallet: Freighter
- CI/CD: GitHub Actions
- Monitoring: Sentry (optional)

## CI/CD

Workflow file:

- .github/workflows/ci.yml

Jobs include:

- Soroban contract build (pool + token)
- Frontend type check, lint, and build
- Integration verification job

## Local Setup

### Prerequisites

- Node.js 18+
- Rust stable
- wasm32 target
- Stellar/Soroban CLI
- Freighter wallet (for wallet-based flows)

### Install

```bash
npm ci
```

### Build contracts

```bash
cd contracts/pool
cargo build --release --target wasm32-unknown-unknown

cd ../token
cargo build --release --target wasm32-unknown-unknown
```

### Frontend env

Create web/.env with:

```env
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_TOKEN_ADDRESS=CYOUR_TOKEN_CONTRACT_ID
VITE_POOL_ADDRESS=CYOUR_POOL_CONTRACT_ID
VITE_SENTRY_DSN=
```

### Run frontend

```bash
npm run -w web dev
```

## Submission Checklist Status

- [x] Public GitHub repository
- [x] Stellar smart contracts (Rust/Soroban)
- [x] Custom token contract present
- [x] Pool contract present
- [x] CI/CD workflow configured
- [x] Mobile responsive UI
- [x] 8+ meaningful commits
- [x] Live demo link in README
- [x] Mobile screenshot in README
- [x] CI/CD screenshot in README

## Required Proof To Fill Before Final Submission

Add the real values below after deployment and transaction execution.

- Token contract ID: PENDING
- Pool contract ID: PENDING
- Deployment tx hash (token): PENDING
- Deployment tx hash (pool): PENDING
- Inter-contract call tx hash (stake/unstake): PENDING

Reviewer link format:

```text
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>
https://stellar.expert/explorer/testnet/tx/<TX_HASH>
```

## Notes

- This repository is Stellar-only for contract implementation.
- Legacy Solidity/Hardhat artifacts are removed from active project files.

## Author

Deep Saha - https://github.com/DeepSaha25

