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

## Live Contract Deployments (Stellar Testnet)

- **Token Contract ID**: `CCC5SUL34JLNNXGXHBKLMF2LGA35U3EF74RDEOTZ3ZD3VDE5PDR7J7L5`
- **Pool Contract ID**: `CB6EAJINTG4O4LJYTDRYMX76MC3CX4ZDZUX5MWGXHI5INS2UI66P3QUH`
- **Deployment tx hash (token)**: `6a85b24685d790c2078eec650de5f2f0bbf4010d7b3cec59a1a57425abf465bb`
- **Deployment tx hash (pool)**: `e4471c06d819c6e86a641004cb59469baabffb58a2bb11db0d0560633142f604`
- **Inter-contract call tx hash (stake)**: `baeedaac47a12df4ac723a6432ea99a55698361439a104b32df3651a612414e7`

Reviewer links:
- [Token Contract Explorer](https://stellar.expert/explorer/testnet/contract/CCC5SUL34JLNNXGXHBKLMF2LGA35U3EF74RDEOTZ3ZD3VDE5PDR7J7L5)
- [Pool Contract Explorer](https://stellar.expert/explorer/testnet/contract/CB6EAJINTG4O4LJYTDRYMX76MC3CX4ZDZUX5MWGXHI5INS2UI66P3QUH)

## Author

Deep Saha - https://github.com/DeepSaha25

