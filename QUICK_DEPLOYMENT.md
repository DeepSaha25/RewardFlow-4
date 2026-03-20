# ⚡ Quick Start: RewardFlow Vercel Deployment

## 🚀 5-Minute Quick Start

### Phase 1: GitHub (2 min)
```bash
cd "/home/deep/Desktop/project level 4"
git remote add origin https://github.com/YOUR_USERNAME/reward-flow.git
git branch -M main
git push -u origin main
```

Result: ✅ Code on GitHub

---

### Phase 2: Vercel (1 min)
1. Go https://vercel.com/new
2. Select your `reward-flow` repo
3. Set Root Directory: `./web`
4. Click Deploy

Result: ✅ Site live at `https://reward-flow-xxx.vercel.app`

---

### Phase 3: Deploy Contracts (2+ min)
```bash
# Get SepoliaETH from https://www.alchemy.com/faucets/sepolia

cp contracts/.env.example contracts/.env
# Edit with: DEPLOYER_PRIVATE_KEY, SEPOLIA_RPC_URL

npm run -w contracts deploy -- --network sepolia
# Save output:
# - Token address: 0x...
# - Pool address: 0x...
# - MINTER_ROLE tx: 0x...
```

Result: ✅ Contracts deployed

---

### Phase 4: Update Vercel Env Vars (1 min)
1. Vercel Settings → Environment Variables
2. Update:
   - `VITE_TOKEN_ADDRESS` = Token address from Phase 3
   - `VITE_POOL_ADDRESS` = Pool address from Phase 3
3. Click Redeploy

Result: ✅ App connected to contracts

---

### Phase 5: Submit (1 min)
1. Update README with live URL & addresses
2. Take mobile screenshot (F12 → device icon)
3. Take CI/CD screenshot (GitHub → Actions)
4. Push to GitHub
5. Submit!

Result: ✅ SUBMITTED! 🎉

---

## 📋 Phase 3 Details: Contract Deployment

### Get SepoliaETH (1 min)
```
https://www.alchemy.com/faucets/sepolia
→ Paste your wallet address
→ Request ETH
→ Wait 1 minute
```

### Configure Deployment (1 min)
```bash
cp contracts/.env.example contracts/.env
```

Edit `contracts/.env`:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
DEPLOYER_PRIVATE_KEY=your_private_key_from_metamask_no_0x
ETHERSCAN_API_KEY=optional
```

**Get Infura Key:**
1. Go https://infura.io
2. Sign up free
3. Create new Sepolia project
4. Copy PROJECT ID

### Deploy (1 min)
```bash
npm run -w contracts deploy -- --network sepolia
```

**Output Example:**
```
AdvancedToken deployed: 0x742d35Cc6634C0532925a3b844Bc9e7595f8e5C5
LiquidityPool deployed: 0x8f46D8F5d3d47eCAd2cC3Ea8e49fb5A0F9CC1e7F
MINTER_ROLE granted tx: 0x1234567890abcdef...

✅ DEPLOYMENT COMPLETE!
```

**Save these 3 lines! You'll need them for Vercel & submission.**

---

## 🔗 Links You'll Need

| Step | What You Need | Where to Get |
|---|---|---|
| GitHub | Create public repo | https://github.com/new |
| Vercel | Deploy site | https://vercel.com/new |
| Infura | RPC URL | https://infura.io |
| Faucet | SepoliaETH | https://www.alchemy.com/faucets/sepolia |

---

## ✅ Final Verification

After deployment, check:

```bash
# 1. GitHub - verify push worked
git log --oneline | head -1
# Should show your latest commit

# 2. Vercel - test live site loads
# Open: https://reward-flow-xxx.vercel.app
# Should see the dashboard

# 3. MetaMask - test connection
# Click "Connect Wallet" on live site
# Should connect successfully

# 4. Mobile - test responsiveness
# F12 → Toggle device → iPhone 12
# Should show single column layout

# 5. Events - test contract interaction
# Enter amount → Click Deposit
# Should show in event feed
```

---

## 🎯 You're Ready!

Everything is prepared. Just follow the 5 phases above in order.

**Estimated total time:** 10-15 minutes

Let's go! 🚀

---

**Questions?** See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for detailed troubleshooting.
