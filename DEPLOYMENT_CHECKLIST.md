# 🎯 REWARDFLOW DEPLOYMENT: EXACT STEP-BY-STEP EXECUTION

Follow these exact commands in order. Copy/paste each section.

---

## ✅ STEP 1: Push to GitHub (3 minutes)

### 1.1 Create repository on GitHub
```
Go to: https://github.com/new
- Repository name: reward-flow
- Description: Real-time liquidity pool with inter-contract rewards
- Select: Public
- Click: Create repository
```

### 1.2 Push your code
```bash
cd "/home/deep/Desktop/project level 4"

git remote add origin https://github.com/YOUR_USERNAME/reward-flow.git
git branch -M main
git push -u origin main
```

**Expected Output:**
```
Enumerating objects...done
Writing...done
Total 13 (delta 8)...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✅ **Verify:** Go to https://github.com/YOUR_USERNAME/reward-flow - you should see all files

---

## ✅ STEP 2: Deploy Contracts to Sepolia (5 minutes)

### 2.1 Get SepoliaETH (1 min)
```
Go to: https://www.alchemy.com/faucets/sepolia
- Paste your wallet address (from MetaMask)
- Click "Send Me ETH"
- Wait 1 minute
```

### 2.2 Create Infura account (1 min)
```
Go to: https://infura.io
- Sign up free
- Create new project
- Select "Sepolia"
- Copy Project ID (looks like: abc123def456...)
```

### 2.3 Configure deployment
```bash
cd "/home/deep/Desktop/project level 4"

cp contracts/.env.example contracts/.env

# Edit contracts/.env with:
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/[PASTE_PROJECT_ID_HERE] 
# DEPLOYER_PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
# ETHERSCAN_API_KEY=leave_blank_or_get_from_etherscan
```

**Get Private Key from MetaMask:**
- Click MetaMask icon (top right)
- Click account circle
- Select "Account Details"
- Click "Show Private Key"
- Enter password
- Copy (WITHOUT 0x prefix)

### 2.4 Deploy contracts
```bash
npm run -w contracts deploy -- --network sepolia
```

**Expected Output:**
```
✔ Compiled successfully

AdvancedToken deployed: 0x742d35Cc6634C0532925a3b844Bc9e7595f8e5C5
LiquidityPool deployed: 0x8f46D8F5d3d47eCAd2cC3Ea8e49fb5A0F9CC1e7F
MINTER_ROLE granted tx: 0x1234567890abcdef1234567890abcdef...
```

✅ **SAVE THESE 3 LINES** - You'll need them in the next steps!

---

## ✅ STEP 3: Deploy Frontend to Vercel (5 minutes)

### 3.1 Create Vercel account & deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login
# Opens browser - authorize with GitHub

# Deploy from web directory
cd "/home/deep/Desktop/project level 4/web"
vercel

# Answer these prompts:
# "Set up and deploy?" → Yes
# "Which scope?" → Your account
# "Project name?" → reward-flow
# "Link to existing project?" → No
# "Which directory?" → ./
# "Modify vercel.json?" → No
```

**Expected Output:**
```
✓ Production: https://reward-flow-abc123.vercel.app [copied]
✓ Inspect: https://vercel.com/your-team/reward-flow/...
```

✅ **Save this URL** - This is your live app!

### 3.2 Add environment variables to Vercel
```bash
vercel env add
```

Add these (copy/paste one at a time):

**Variable 1:**
```
Name: VITE_RPC_URL
Value: https://sepolia.infura.io/v3/[YOUR_INFURA_PROJECT_ID]
Environments: Production, Preview, Development
```

**Variable 2:**
```
Name: VITE_TOKEN_ADDRESS
Value: 0x742d35Cc6634C0532925a3b844Bc9e7595f8e5C5
Environments: Production, Preview, Development
```

**Variable 3:**
```
Name: VITE_POOL_ADDRESS
Value: 0x8f46D8F5d3d47eCAd2cC3Ea8e49fb5A0F9CC1e7F
Environments: Production, Preview, Development
```

**Variable 4 (Optional):**
```
Name: VITE_SENTRY_DSN
Value: [leave blank or paste Sentry DSN if you have one]
Environments: Production, Preview, Development
```

### 3.3 Redeploy with environment variables
```bash
vercel redeploy
```

**Expected:** Site redeployed in ~1 minute

✅ **Test:** Open https://reward-flow-xxx.vercel.app in your browser

---

## ✅ STEP 4: Test Live Application (2 minutes)

### 4.1 Connect wallet
1. Open your Vercel URL: https://reward-flow-xxx.vercel.app
2. Make sure MetaMask is set to **Sepolia network**
3. Click **"Connect Wallet"** button
4. Click **"Connect"** in MetaMask popup
5. Verify wallet address appears in the app

### 4.2 Test mobile responsive
1. Press **F12** to open developer tools
2. Click phone icon (top left of DevTools)
3. Select **iPhone 12** from dropdown
4. Verify:
   - ✅ Single column layout
   - ✅ Buttons are large and clickable
   - ✅ No horizontal scrolling
   - ✅ Text is readable

### 4.3 Take screenshots (for submission)

**Screenshot 1: Mobile view**
1. Keep DevTools open with iPhone 12
2. Right-click → "Take screenshot"
3. Save as `mobile-screenshot.png`

**Screenshot 2: CI/CD status**
1. Go to https://github.com/YOUR_USERNAME/reward-flow
2. Click **"Actions"** tab
3. Click latest workflow
4. Right-click → "Take screenshot"
5. Save as `ci-pipeline-status.png`

---

## ✅ STEP 5: Complete Submission (2 minutes)

### 5.1 Update README with deployment info
```bash
cd "/home/deep/Desktop/project level 4"

# Edit README.md and find this section:
# "Fill this section before submitting:"
# Add these values:
```

**Add to README:**
```markdown
## 🌍 Live Demo
- **Live URL:** https://reward-flow-abc123.vercel.app

## 📋 Deployment Details

### Smart Contracts (Sepolia Testnet)
- **AdvancedToken Address:** 0x742d35Cc6634C0532925a3b844Bc9e7595f8e5C5
- **LiquidityPool Address:** 0x8f46D8F5d3d47eCAd2cC3Ea8e49fb5A0F9CC1e7F
- **MINTER_ROLE Grant TX:** 0x1234567890abcdef...

## 📸 Submission Evidence
- **Mobile Responsive Screenshot:** ✅ [Included in repo]
- **CI/CD Pipeline Status:** ✅ [GitHub Actions showing passed]
```

### 5.2 Commit and push
```bash
cd "/home/deep/Desktop/project level 4"

git add README.md
git commit -m "docs: add deployment details and live URL"
git push origin main
```

### 5.3 Submit!
1. Copy your GitHub URL: https://github.com/YOUR_USERNAME/reward-flow
2. Go to submission form
3. Paste the URL
4. Verify:
   - ✅ Repository is public
   - ✅ 13 commits visible
   - ✅ README has all details
   - ✅ Screenshots included
   - ✅ Live URL works

**SUBMIT!** 🎉

---

## 🔍 Quick Verification Checklist

Before submitting, run:

```bash
cd "/home/deep/Desktop/project level 4"

# 1. Verify git status is clean
git status
# Expected: "working tree clean"

# 2. Verify all commits
git log --oneline | head -5
# Expected: 13+ commits

# 3. Test build locally
npm run test
npm run lint  
npm run build
# Expected: all passing ✓
```

---

## 🆘 Troubleshooting

### **"Can't push to GitHub"**
```bash
# Make sure origin is set correctly:
git remote -v
# Should show: origin https://github.com/YOUR_USERNAME/reward-flow.git

# If not, update it:
git remote set-url origin https://github.com/YOUR_USERNAME/reward-flow.git
```

### **"Contract deployment failed"**
```
Check:
1. Did you get SepoliaETH? (Check MetaMask - should have balance)
2. Is SEPOLIA_RPC_URL correct? (Copy PROJECT_ID from Infura exactly)
3. Is DEPLOYER_PRIVATE_KEY correct? (No 0x prefix, from MetaMask)
```

### **"Vercel deploy failed"**
```
Check:
1. Is web directory set to ./web in vercel.json?
2. Did you run from /web directory?
3. Try: vercel redeploy
```

### **"App won't load"**
```
Check:
1. MetaMask on Sepolia? (Top right of MetaMask)
2. Environment variables set? (Vercel Settings → Environment Variables)
3. Contract addresses correct? (Should start with 0x)
4. Fresh reload? (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
```

---

## ✅ You're All Set!

All commands are above in order.  
Just copy/paste each section and follow the prompts.

**Questions?** 
- See VERCEL_DEPLOYMENT_GUIDE.md for detailed explanations
- See QUICK_DEPLOYMENT.md for 5-minute overview

**Time estimate:** 15 minutes ⏱️

Let's deploy! 🚀
