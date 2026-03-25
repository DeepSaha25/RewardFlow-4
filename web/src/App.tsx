import { useCallback, useEffect, useMemo, useState } from "react";
import * as Sentry from "@sentry/react";
import * as StellarSDK from "@stellar/js-stellar-sdk";
import "./App.css";
import { tokenAddress, poolAddress, isConfigured, stellarNetwork } from "./stellar-contracts";
import { connectWallet, isWalletAvailable, onWalletChange } from "./stellar-wallet";
import { formatAmount, parseAmount, getAccountDetails } from "./stellar-rpc";

type FeedEvent = {
  id: string;
  title: string;
  details: string;
  timestamp: string;
};

function App() {
  const [wallet, setWallet] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [totalStaked, setTotalStaked] = useState<string>("0");
  const [rewardRate, setRewardRate] = useState<string>("0");
  const [amount, setAmount] = useState<string>("10");
  const [status, setStatus] = useState<string>("Ready");
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [tokenSymbol, setTokenSymbol] = useState<string>("L4ST");
  const [isLoading, setIsLoading] = useState(false);

  const sorobanRpc = useMemo(
    () => new StellarSDK.SorobanRpc.Server(stellarNetwork.rpcUrl),
    []
  );

  const connectToWallet = useCallback(async () => {
    try {
      setStatus("Connecting wallet...");
      const result = await connectWallet();

      if (!result.success) {
        setStatus(result.error || "Failed to connect wallet");
        return;
      }

      setWallet(result.publicKey || "");
      setStatus("Wallet connected!");
      await refreshState(result.publicKey);
    } catch (error) {
      Sentry.captureException(error);
      setStatus("Wallet connection failed");
    }
  }, []);

  const refreshState = useCallback(
    async (account?: string) => {
      if (!isConfigured) {
        setStatus("Set VITE_TOKEN_ADDRESS and VITE_POOL_ADDRESS");
        return;
      }

      try {
        const activeAccount = account || wallet;
        const server = sorobanRpc;

        // Get token symbol and decimals (hardcoded for now - L4ST, 7 decimals)
        setTokenSymbol("L4ST");

        // Get pool state - total staked and reward rate
        // Note: In real implementation, this would properly query contract storage
        setRewardRate("1000"); // 10% reward rate in basis points

        if (activeAccount) {
          // Get account balances from Stellar ledger
          const account = await getAccountDetails(activeAccount);
          setTokenBalance("0"); // Would query token balance properly

          // Get staked balance (would query pool contract)
          setStakedBalance("0");
        }

        setStatus("Ready");
      } catch (error) {
        Sentry.captureException(error);
        setStatus("Failed to refresh contract state");
      }
    },
    [isConfigured, sorobanRpc, wallet]
  );

  async function setupContractInteraction() {
    try {
      if (!wallet || !isConfigured) {
        setStatus("Connect wallet and configure contracts first");
        return;
      }

      const account = await getAccountDetails(wallet);
      return {
        sorobanRpc,
        account,
        wallet,
      };
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async function deposit() {
    if (!wallet || !isConfigured) {
      setStatus("Connect wallet and configure contracts first");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Building deposit transaction...");
      const setup = await setupContractInteraction();

      // Parse amount from user input
      const parsedAmount = parseAmount(amount);

      // Build the approval transaction
      // First: Transfer tokens from user to pool
      // In Soroban, we'd invoke: token.transfer(user, pool, amount)
      // Then: pool.deposit(user, amount)

      // For now, this is a placeholder - actual implementation requires:
      // 1. Building proper XDR operations
      // 2. Signing with wallet
      // 3. Submitting to network

      setStatus("Deposit initiated - contract deployment needed");
      setIsLoading(false);
      await refreshState();
    } catch (error) {
      Sentry.captureException(error);
      setStatus("Deposit failed");
      setIsLoading(false);
    }
  }

  async function withdraw() {
    if (!wallet || !isConfigured) {
      setStatus("Connect wallet and configure contracts first");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Building withdrawal transaction...");
      const setup = await setupContractInteraction();

      // Parse amount from user input
      const parsedAmount = parseAmount(amount);

      // Invoke pool.withdraw(user, amount)
      // This will trigger:
      // 1. Transfer staked tokens back
      // 2. Mint reward tokens
      // 3. Emit event

      // Placeholder - actual implementation requires XDR building and signing

      setStatus("Withdrawal initiated - contract deployment needed");
      setIsLoading(false);
      await refreshState();
    } catch (error) {
      Sentry.captureException(error);
      setStatus("Withdrawal failed");
      setIsLoading(false);
    }
  }

  // Re-poll for events every 5 seconds
  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const pollEvents = async () => {
      try {
        // In real implementation:
        // 1. Query contract for recent transactions
        // 2. Decode events from transaction results
        // 3. Add new events to feed

        // For now, mock event polling
      } catch (error) {
        console.error("Error polling events:", error);
      }
    };

    const intervalId = setInterval(pollEvents, 5000);
    return () => clearInterval(intervalId);
  }, [isConfigured, tokenSymbol]);

  // Listen for wallet changes
  useEffect(() => {
    if (!isWalletAvailable()) {
      setStatus("Freighter wallet not detected");
      return;
    }

    const unsubscribe = onWalletChange((publicKey) => {
      if (publicKey) {
        setWallet(publicKey);
        void refreshState(publicKey);
      } else {
        setWallet("");
      }
    });

    // Connect to wallet on mount if available
    void connectToWallet();

    return unsubscribe;
    return unsubscribe;
  }, [connectToWallet, refreshState]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshState();
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, [refreshState]);

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>🌊 RewardFlow</h1>
        <p className="subtitle">Liquidity Staking with Real-Time Rewards</p>
        <p className="subtitle-small">Powered by Stellar Soroban</p>

        <div className="header-actions">
          {!wallet ? (
            <button onClick={connectToWallet} disabled={isLoading || !isWalletAvailable()}>
              {isWalletAvailable() ? "Connect Freighter" : "Freighter Not Found"}
            </button>
          ) : (
            <>
              <button disabled>{wallet.slice(0, 6)}...{wallet.slice(-4)}</button>
              <button className="ghost" onClick={() => setWallet("")}>
                Disconnect
              </button>
            </>
          )}
          <button className="ghost" onClick={() => refreshState()} disabled={isLoading}>
            Refresh
          </button>
        </div>
        <p className="status">{status}</p>
      </header>

      <section className="grid">
        <article className="panel metrics">
          <h2>Pool Snapshot</h2>
          <div className="metric-row">
            <span>Total Staked</span>
            <strong>{Number(totalStaked).toFixed(4)} {tokenSymbol}</strong>
          </div>
          <div className="metric-row">
            <span>Reward Rate</span>
            <strong>{parseInt(rewardRate) / 100}%</strong>
          </div>
          <div className="metric-row">
            <span>Your Wallet</span>
            <strong>{wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Not connected"}</strong>
          </div>
          <div className="metric-row">
            <span>Your Token Balance</span>
            <strong>{Number(tokenBalance).toFixed(4)} {tokenSymbol}</strong>
          </div>
          <div className="metric-row">
            <span>Your Staked Balance</span>
            <strong>{Number(stakedBalance).toFixed(4)} {tokenSymbol}</strong>
          </div>
        </article>

        <article className="panel action-panel">
          <h2>Liquidity Actions</h2>
          <label htmlFor="amount">Amount ({tokenSymbol})</label>
          <input
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading || !wallet}
          />
          <div className="action-row">
            <button onClick={deposit} disabled={isLoading || !wallet || !isConfigured}>
              Approve + Deposit
            </button>
            <button
              className="ghost"
              onClick={withdraw}
              disabled={isLoading || !wallet || !isConfigured}
            >
              Withdraw
            </button>
          </div>
          <p className="hint">
            Network: Stellar Testnet | Contracts: {isConfigured ? "configured" : "missing env vars"}
          </p>
        </article>

        <article className="panel event-panel">
          <h2>Live Event Feed</h2>
          <p className="hint">Streaming Deposited and Withdrawn events in real time.</p>
          <ul>
            {feed.length === 0 ? (
              <li className="empty">No events yet. Trigger a deposit or withdrawal.</li>
            ) : (
              feed.map((event) => (
                <li key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.details}</p>
                  </div>
                  <time>{event.timestamp}</time>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default Sentry.withProfiler(App);
