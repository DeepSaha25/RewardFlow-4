# Stellar Soroban Deployment Guide

## Prerequisites

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup target add wasm32-unknown-unknown
```

Verify:
```bash
rustc --version
cargo --version
```

### 2. Install Stellar CLI

```bash
# Download latest release for your OS from:
# https://github.com/stellar/rs-soroban-cli/releases

# Or use curl (Linux/macOS):
curl https://github.com/stellar/rs-soroban-cli/releases/download/v21.0.0/soroban-cli-21.0.0-x86_64-unknown-linux-gnu.tar.gz | tar xz

# Add to PATH
export PATH=$PATH:$(pwd)
soroban --version
```

### 3. Set Up Stellar Account

```bash
# Create a test account (if you don't have one)
# Use: https://stellar.org/lumens/testnet-laboratory

# Set environment
export STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
export SOROBAN_RPC_HOST="https://soroban-testnet.stellar.org"
```

---

## Step 1: Build Contracts

```bash
cd contracts

# Build with optimizations
cargo build --release --target wasm32-unknown-unknown

# Verify build
ls -la target/wasm32-unknown-unknown/release/*.wasm
```

Expected output:
```
target/wasm32-unknown-unknown/release/reward_flow_stellar_token.wasm
target/wasm32-unknown-unknown/release/reward_flow_stellar_pool.wasm
```

---

## Step 2: Deploy Token Contract

```bash
# Optimize WASM (optional but recommended)
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/reward_flow_stellar_token.wasm

# Deploy
TOKEN_WASM="target/wasm32-unknown-unknown/release/reward_flow_stellar_token.wasm"
soroban contract deploy \
  --wasm $TOKEN_WASM \
  --source YOUR_ACCOUNT_SECRET_KEY \
  --network testnet

# Save the contract address (starts with C...)
# Example: CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4
```

---

## Step 3: Initialize Token

```bash
TOKEN_ADDRESS="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
ADMIN_ADDRESS="GXXXXXXXXXXXXXXXXXXXXX"  # Your Stellar account

soroban contract invoke \
  --id $TOKEN_ADDRESS \
  --source YOUR_ACCOUNT_SECRET_KEY \
  --network testnet \
  -- \
  init \
  --admin $ADMIN_ADDRESS
```

---

## Step 4: Deploy Pool Contract

```bash
POOL_WASM="target/wasm32-unknown-unknown/release/reward_flow_stellar_pool.wasm"
soroban contract deploy \
  --wasm $POOL_WASM \
  --source YOUR_ACCOUNT_SECRET_KEY \
  --network testnet

# Save the contract address (starts with C...)
# Example: CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 5: Initialize Pool

```bash
POOL_ADDRESS="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TOKEN_ADDRESS="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
ADMIN_ADDRESS="GXXXXXXXXXXXXXXXXXXXXX"
REWARD_RATE="1000"  # 10% in basis points

soroban contract invoke \
  --id $POOL_ADDRESS \
  --source YOUR_ACCOUNT_SECRET_KEY \
  --network testnet \
  -- \
  init \
  --token-address $TOKEN_ADDRESS \
  --owner $ADMIN_ADDRESS \
  --initial-reward-rate-bps $REWARD_RATE
```

---

## Step 6: Grant MINTER_ROLE to Pool

```bash
TOKEN_ADDRESS="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4"
POOL_ADDRESS="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

soroban contract invoke \
  --id $TOKEN_ADDRESS \
  --source YOUR_ACCOUNT_SECRET_KEY \
  --network testnet \
  -- \
  grant_minter \
  --to $POOL_ADDRESS
```

---

## Step 7: Update .env

Create `.env` file in the project root:

```env
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

VITE_TOKEN_ADDRESS=CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4
VITE_POOL_ADDRESS=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Step 8: Deploy Frontend

```bash
# Install dependencies
npm ci

# Build
npm run -w web build

# Deploy to Vercel (optional)
vercel deploy --prod
```

---

## Testing on Frontend

### 1. Connect Wallet

- Install [Freighter](https://freighter.app) extension
- Create account on Stellar Testnet
- Fund account via [Friendbot](https://friendbot.stellar.org)

### 2. Test Deposit

```
1. Open http://localhost:5173 (or deployed URL)
2. Click "Connect Freighter"
3. Enter amount (e.g., "10")
4. Click "Approve + Deposit"
5. Sign transaction in Freighter
6. Wait for confirmation
```

### 3. Test Withdrawal

```
1. Click "Withdraw" with same amount
2. Sign transaction
3. Verify rewards were minted
```

---

## Verification

### Check Contract on Stellar Expert

```
https://stellar.expert/explorer/testnet/contract/CXXXXXX
```

### Query Contract State

```bash
soroban contract read \
  --id $TOKEN_ADDRESS \
  --network testnet
```

### Monitor Transactions

```bash
soroban transaction fetch TRANSACTION_HASH --network testnet
```

---

## Troubleshooting

### Issue: `soroban: command not found`

**Solution:** Add Stellar CLI to PATH
```bash
export PATH=$PATH:/path/to/soroban
soroban --version
```

### Issue: `Not enough XLM for fees`

**Solution:** Fund account via Friendbot
```
https://friendbot.stellar.org/?addr=GXXXXXX
```

### Issue: `Contract initialization failed`

**Solution:** Ensure admin address is valid
```bash
# Verify account exists
soroban account view GXXXXXX --network testnet
```

### Issue: `WASM compile error`

**Solution:** Update Rust toolchain
```bash
rustup update
rustup target add wasm32-unknown-unknown -t stable
```

---

## Post-Deployment

### 1. Update Documentation

- [ ] Update README with contract addresses
- [ ] Add deployment transaction hashes
- [ ] Document any custom initialization

### 2. Monitor Frontenda

- [ ] Test all UI functions
- [ ] Verify event streaming
- [ ] Check mobile responsiveness

### 3. Backup Keys

- [ ] Save admin private key safely
- [ ] Document deployment steps
- [ ] Archive contract source code

---

## Contracts Reference

### Token Contract

**Functions:**
- `init(admin: Address)` - Initialize token
- `mint(to: Address, amount: i128)` - Mint tokens (MINTER_ROLE)
- `transfer(from: Address, to: Address, amount: i128)` - Transfer tokens
- `balance_of(account: Address)` → i128 - Get balance
- `approve(from: Address, spender: Address, amount: i128)` - Approve spending
- `allowance(from: Address, spender: Address)` → i128 - Get allowance
- `pause()` - Pause transfers (PAUSER_ROLE)
- `unpause()` - Resume transfers (PAUSER_ROLE)

### Pool Contract

**Functions:**
- `init(token: Address, owner: Address, reward_rate_bps: u32)` - Initialize pool
- `deposit(user: Address, amount: i128)` - Deposit tokens
- `withdraw(user: Address, amount: i128)` - Withdraw and earn rewards
- `stake_of(user: Address)` → i128 - Get user's staked amount
- `total_staked()` → i128 - Get total staked
- `reward_rate_bps()` → u32 - Get reward rate
- `set_reward_rate_bps(rate: u32)` - Update rate (owner only)

**Events:**
- `Deposited(user, amount, timestamp)` - Emitted on deposit
- `Withdrawn(user, amount, reward, timestamp)` - Emitted on withdraw
- `RewardRateUpdated(rate, timestamp)` - Emitted on rate change

---

## Files for Reference

- Contract code: `contracts/src/`
- Frontend config: `web/src/stellar-contracts.ts`
- Wallet integration: `web/src/stellar-wallet.ts`
- RPC utilities: `web/src/stellar-rpc.ts`
- CI/CD: `.github/workflows/ci.yml`
