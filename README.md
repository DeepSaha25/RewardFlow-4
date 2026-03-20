# Advanced Contract Patterns + Production Readiness

Production-ready dApp implementing inter-contract calls, custom token and liquidity pool mechanics, real-time event streaming, CI/CD, mobile responsive UI, and error tracking.

## Features

- Inter-contract calls:
  - `LiquidityPool.withdraw` calls `AdvancedToken.mint` to pay reward tokens.
  - `LiquidityPool.deposit` and `withdraw` call ERC20 `transferFrom` and `transfer`.
- Custom token + pool:
  - `AdvancedToken` (ERC20 + burnable + permit + role-based mint/pause).
  - `LiquidityPool` (stake, withdraw, dynamic reward rate).
- Real-time event streaming:
  - Frontend subscribes to `Deposited` and `Withdrawn` events and updates a live feed.
- Production readiness:
  - GitHub Actions CI pipeline for lint, tests, and builds.
  - Sentry integration for frontend error tracking.
  - Mobile responsive layout.

## Project Structure

- `contracts/` Hardhat project with Solidity contracts, deploy script, and tests.
- `web/` React + Vite TypeScript frontend.
- `.github/workflows/ci.yml` CI/CD pipeline.

## Local Setup

### 1) Install dependencies

```bash
npm ci
```

### 2) Configure environment variables

Contracts env:

```bash
cp contracts/.env.example contracts/.env
```

Frontend env:

```bash
cp web/.env.example web/.env
```

Set your deployed addresses in `web/.env`:

- `VITE_TOKEN_ADDRESS`
- `VITE_POOL_ADDRESS`

### 3) Run contract tests

```bash
npm run test
```

### 4) Build all packages

```bash
npm run build
```

### 5) Start frontend

```bash
npm run -w web dev
```

## Deploy Contracts

Run local deployment:

```bash
npm run -w contracts deploy
```

For public network deployment (example: Sepolia), set `contracts/.env` first and run with a configured Hardhat network command.

## CI/CD

Pipeline file: `.github/workflows/ci.yml`

Checks executed on push/pull_request to `main`:

- Frontend lint
- Smart contract tests
- Workspace build

## Required Submission Data

Fill this section before submitting:

- Live demo link: `ADD_LINK_HERE`
- Mobile responsive screenshot: `ADD_SCREENSHOT_PATH_OR_URL`
- CI/CD badge or screenshot: `ADD_BADGE_OR_SCREENSHOT`
- Contract addresses:
  - `AdvancedToken`: `ADD_ADDRESS`
  - `LiquidityPool`: `ADD_ADDRESS`
- Transaction hash for inter-contract role grant (`MINTER_ROLE -> LiquidityPool`): `ADD_TX_HASH`
- Token or pool address (if custom deployed): `ADD_ADDRESS`

## Commit Guidance (8+ meaningful commits)

Recommended commit slices:

1. Scaffold monorepo and workspaces
2. Add Hardhat config and dependencies
3. Implement `AdvancedToken`
4. Implement `LiquidityPool` inter-contract mechanics
5. Add deploy script and contract tests
6. Build responsive frontend UI
7. Add real-time event stream + wallet actions
8. Add CI workflow + docs + env templates

## Notes

- The app is functional after you deploy contracts and set frontend env variables.
- Sentry is optional in local dev; set `VITE_SENTRY_DSN` to enable production monitoring.
