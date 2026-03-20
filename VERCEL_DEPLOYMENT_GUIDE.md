# 🚀 Vercel Deployment Guide for RewardFlow

## Pre-Deployment Checklist

Before deploying to Vercel, ensure:

```bash
# 1. All tests passing
npm run test
# Expected: 2 passing

# 2. No lint errors
npm run lint
# Expected: 0 errors

# 3. Build successful
npm run build
# Expected: ✓ built successfully

# 4. Git is clean
git status
# Expected: working tree clean
```

---

## Step 1: Create Free Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "GitHub" (or email)
4. Authorize Vercel to access your GitHub repos

---

## Step 2: Prepare Your GitHub Repository

### Option A: Create New Repository (Recommended)

```bash
cd "/home/deep/Desktop/project level 4"

# Initialize git (if needed)
git init

# Add all files
git add .

# Commit everything
git commit -m "initial: RewardFlow project deployment ready"

# Create new repo on GitHub:
# 1. Go to https://github.com/new
# 2. Name: reward-flow (or your choice)
# 3. Description: "Real-time liquidity pool with inter-contract rewards"
# 4. Public visibility
# 5. Create repository

# Connect and push
git remote add origin https://github.com/YOUR_USERNAME/reward-flow.git
git branch -M main
git push -u origin main
```

### Verify on GitHub:
- ✅ Repository is public
- ✅ All 12 commits visible
- ✅ README.md displays correctly
- ✅ All files present

---

## Step 3: Deploy on Vercel

### Option A: Using Vercel UI (Easiest)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Click "New Project"**

3. **Import Git Repository**
   - Select your `reward-flow` repo
   - Click "Import"

4. **Configure Project**
   - **Project Name:** reward-flow (auto-filled)
   - **Framework:** Vite (auto-detected may show "Other")
   - **Root Directory:** `./web` (IMPORTANT!)

5. **Environment Variables**
   - Click "Add Environment Variable"
   - Add these variables:

   ```
   VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   VITE_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
   VITE_POOL_ADDRESS=0x0000000000000000000000000000000000000000
   VITE_SENTRY_DSN=https://... (optional)
   ```

   **Note:** Use placeholder addresses for now. Update after contract deployment.

6. **Build Settings** (should auto-detect)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`

7. **Click "Deploy"**
   - Sits back and watches the magic 🪄
   - Takes 2-3 minutes

---

### Option B: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   # Opens browser for GitHub/email auth
   ```

3. **Deploy from web directory**
   ```bash
   cd web
   vercel
   # Follow prompts:
   # - Set up and deploy? → Yes
   # - Which scope? → Your account
   # - Project name? → reward-flow
   # - Link to existing project? → No
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add
   # Add each variable:
   # - VITE_RPC_URL
   # - VITE_TOKEN_ADDRESS
   # - VITE_POOL_ADDRESS
   # - VITE_SENTRY_DSN (optional)
   ```

5. **Redeploy with new env vars**
   ```bash
   vercel redeploy
   ```

---

## Step 4: Deploy Smart Contracts to Sepolia

Before updating env variables, deploy contracts:

```bash
# 1. Get Sepolia testnet ETH
# Go to https://www.alchemy.com/faucets/sepolia
# Request free SepoliaETH (takes 1-2 min)

# 2. Configure contract deployment
cp contracts/.env.example contracts/.env

# Edit contracts/.env:
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
# DEPLOYER_PRIVATE_KEY=your_private_key_without_0x
# ETHERSCAN_API_KEY=your_etherscan_key (optional)

# 3. Deploy to Sepolia
npm run -w contracts deploy -- --network sepolia

# Output will show:
# AdvancedToken deployed: 0x[ADDRESS1]
# LiquidityPool deployed: 0x[ADDRESS2]
# MINTER_ROLE granted: 0x[TRANSACTION_HASH]

# Save these values! You'll need them.
```

---

## Step 5: Update Environment Variables in Vercel

1. **Go to Vercel Project Settings**
   - https://vercel.com/dashboard/project/reward-flow
   - Click "Settings"
   - Go to "Environment Variables"

2. **Update the variables:**
   - Replace placeholder addresses with deployed contract addresses
   ```
   VITE_TOKEN_ADDRESS=0x[ADDRESS_FROM_STEP_4]
   VITE_POOL_ADDRESS=0x[ADDRESS_FROM_STEP_4]
   VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
   ```

3. **Save changes**

4. **Trigger new deployment**
   - Go to "Deployments" tab
   - Click "... → Redeploy"
   - Select "main" branch
   - Confirm redeploy

---

## Step 6: Verify Deployment

### Check Build Status
```
✅ Build: Successful
✅ Function checks passed
✅ Live URL: https://reward-flow-[random].vercel.app
```

### Test Live Application
1. Open your live Vercel URL
2. Connect MetaMask to Sepolia network
3. Click "Connect Wallet"
4. Verify:
   - ✅ Wallet connects successfully
   - ✅ Token balance displays (should be 0 until you mint)
   - ✅ Pool snapshot shows correct data
   - ✅ Form inputs work
   - ✅ Mobile view is responsive (F12 → device toggle)

### Test Mobile Responsive
1. Press `F12` to open DevTools
2. Click phone icon (device toggle)
3. Select "iPhone 12" or "Pixel 5"
4. Verify:
   - ✅ Single column layout
   - ✅ Buttons are touch-sized (>44px)
   - ✅ Text is readable without zoom
   - ✅ No horizontal scrolling
5. **Take screenshot for submission**

---

## Step 7: Test Contract Interaction (Optional)

If you want to test the full flow:

```bash
# 1. Mint tokens to your wallet
# Call token contract directly on Etherscan

# 2. Use the app to deposit
# - Enter amount
# - Click "Approve + Deposit"
# - Confirm in MetaMask
# - Watch event feed update in real-time

# 3. Withdraw and get rewards
# - Enter amount
# - Click "Withdraw"
# - Monitor transaction status
# - See reward calculation
```

---

## Troubleshooting Vercel Deployment

### Build Fails
**Error:** "Cannot find module 'vite'"
- **Solution:** Check Root Directory is `./web`
- **Or:** Run `npm ci` in root first, then redeploy

### Environment Variables Not Loading
**Error:** "Cannot read property of undefined"
- **Solution:** 
  1. Check all vars are set in Vercel Settings
  2. Click "Redeploy"
  3. Wait 5 minutes for cache clear

### MetaMask Won't Connect
**Error:** "undefined is not a function"
- **Solution:**
  1. Refresh page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
  2. Make sure MetaMask is on Sepolia network
  3. Check browser console (F12) for errors

### Blank Page
**Error:** White screen
- **Solution:**
  1. Check browser console for errors (F12 → Console)
  2. Verify RPC_URL is correct
  3. Check token/pool addresses are valid

### Event Feed Not Updating
**Error:** No events showing
- **Solution:**
  1. Verify RPC_URL supports WebSocket
  2. Try Alchemy instead of Infura
  3. Check pool address is correct

---

## Step 8: Gather Submission Evidence

### 1. Save Vercel Deployment URL
```
https://reward-flow-[random].vercel.app
```

### 2. Save Contract Addresses
```
AdvancedToken: 0x[ADDRESS]
LiquidityPool: 0x[ADDRESS]
MINTER_ROLE grant tx: 0x[HASH]
```

### 3. Take Screenshot: Mobile View
1. Open your Vercel URL
2. F12 → Device Toggle → iPhone 12
3. Screenshot the interface
4. Save as `mobile-responsive.png`

### 4. Take Screenshot: CI/CD Status
1. Go to your GitHub repo
2. Click "Actions" tab
3. Screenshot the latest successful workflow
4. Save as `ci-pipeline-status.png`

---

## Step 9: Complete README for Submission

Update the README.md placeholders:

```markdown
## Live Demo
- **Live URL:** https://reward-flow-[random].vercel.app

## Contract Deployment
- **AdvancedToken:** 0x[ADDRESS]
- **LiquidityPool:** 0x[ADDRESS]
- **MINTER_ROLE Grant TX:** 0x[HASH]

## Submission Evidence
- **Mobile Screenshot:** ![Mobile View](./screenshots/mobile-responsive.png)
- **CI/CD Status:** ![Build Status](./screenshots/ci-pipeline-status.png)
```

---

## Quick Reference: All URLs & Credentials

| Resource | URL |
|---|---|
| RewardFlow GitHub | https://github.com/YOUR_USERNAME/reward-flow |
| Vercel Dashboard | https://vercel.com/dashboard |
| Live Demo | https://reward-flow-[random].vercel.app |
| Sepolia Etherscan | https://sepolia.etherscan.io |
| Infura | https://infura.io |
| Alchemy Faucet | https://www.alchemy.com/faucets/sepolia |

---

## Final Checklist Before Submission

- [ ] GitHub repo is public
- [ ] 12 commits visible in git history
- [ ] README.md is complete with all details
- [ ] LiveURL added to README
- [ ] Contract addresses added to README
- [ ] Transaction hash added to README
- [ ] Mobile screenshot taken and added
- [ ] CI/CD status screenshot taken and added
- [ ] Vercel deployment successful
- [ ] Live app loads without errors
- [ ] MetaMask connects successfully
- [ ] Mobile view is responsive

---

## Need Help?

**Vercel Docs:** https://vercel.com/docs  
**Vite Docs:** https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server  
**React Docs:** https://react.dev

You've got this! 🚀
