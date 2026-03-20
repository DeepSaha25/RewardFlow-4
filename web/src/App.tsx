import { useCallback, useEffect, useMemo, useState } from "react";
import * as Sentry from "@sentry/react";
import { BrowserProvider, Contract, JsonRpcProvider, formatEther, parseEther } from "ethers";
import "./App.css";
import { POOL_ABI, TOKEN_ABI, poolAddress, rpcUrl, tokenAddress } from "./contracts";

type FeedEvent = {
  id: string;
  title: string;
  details: string;
  timestamp: string;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      on: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
    };
  }
}

function App() {
  const [wallet, setWallet] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [totalStaked, setTotalStaked] = useState<string>("0");
  const [rewardRate, setRewardRate] = useState<string>("0");
  const [amount, setAmount] = useState<string>("10");
  const [tokenSymbol, setTokenSymbol] = useState<string>("TOKEN");
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [status, setStatus] = useState<string>("Waiting for wallet connection");

  const isConfigured = useMemo(() => Boolean(tokenAddress && poolAddress), []);
  const readonlyProvider = useMemo(() => new JsonRpcProvider(rpcUrl), []);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found");
        return;
      }
      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(account);
      setStatus("Wallet connected");
    } catch (error) {
      Sentry.captureException(error);
      setStatus("Wallet connection failed");
    }
  }

  const refreshState = useCallback(async (account?: string) => {
    if (!isConfigured) {
      setStatus("Set VITE_TOKEN_ADDRESS and VITE_POOL_ADDRESS");
      return;
    }

    try {
      const token = new Contract(tokenAddress, TOKEN_ABI, readonlyProvider);
      const pool = new Contract(poolAddress, POOL_ABI, readonlyProvider);
      const activeAccount = account || wallet;

      const [symbol, total, rate] = await Promise.all([
        token.symbol(),
        pool.totalStaked(),
        pool.rewardRateBps(),
      ]);

      setTokenSymbol(symbol);
      setTotalStaked(formatEther(total));
      setRewardRate(rate.toString());

      if (activeAccount) {
        const [bal, stake] = await Promise.all([
          token.balanceOf(activeAccount),
          pool.stakeOf(activeAccount),
        ]);
        setTokenBalance(formatEther(bal));
        setStakedBalance(formatEther(stake));
      }
    } catch (error) {
      Sentry.captureException(error);
      setStatus("Failed to refresh contract state");
    }
  }, [isConfigured, readonlyProvider, wallet]);

  async function deposit() {
    if (!window.ethereum || !wallet || !isConfigured) {
      setStatus("Connect wallet and configure contracts first");
      return;
    }

    try {
      setStatus("Submitting deposit transaction...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const token = new Contract(tokenAddress, TOKEN_ABI, signer);
      const pool = new Contract(poolAddress, POOL_ABI, signer);
      const parsed = parseEther(amount);

      const approveTx = await token.approve(poolAddress, parsed);
      await approveTx.wait();

      const depositTx = await pool.deposit(parsed);
      await depositTx.wait();

      setStatus("Deposit complete");
      await refreshState();
    } catch (error) {
      Sentry.captureException(error);
      setStatus("Deposit failed");
    }
  }

  async function withdraw() {
    if (!window.ethereum || !wallet || !isConfigured) {
      setStatus("Connect wallet and configure contracts first");
      return;
    }

    try {
      setStatus("Submitting withdrawal transaction...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const pool = new Contract(poolAddress, POOL_ABI, signer);
      const tx = await pool.withdraw(parseEther(amount));
      await tx.wait();

      setStatus("Withdrawal complete");
      await refreshState();
    } catch (error) {
      Sentry.captureException(error);
      setStatus("Withdrawal failed");
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshState();
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, [refreshState]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const pool = new Contract(poolAddress, POOL_ABI, readonlyProvider);

    const onDeposit = (user: string, value: bigint) => {
      setFeed((prev) => [
        {
          id: `d-${Date.now()}`,
          title: "Deposit",
          details: `${user.slice(0, 6)}...${user.slice(-4)} deposited ${formatEther(value)} ${tokenSymbol}`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 12));
      void refreshState();
    };

    const onWithdraw = (user: string, value: bigint, reward: bigint) => {
      setFeed((prev) => [
        {
          id: `w-${Date.now()}`,
          title: "Withdraw",
          details: `${user.slice(0, 6)}...${user.slice(-4)} withdrew ${formatEther(value)} ${tokenSymbol} and earned ${formatEther(reward)}`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ].slice(0, 12));
      void refreshState();
    };

    pool.on("Deposited", onDeposit);
    pool.on("Withdrawn", onWithdraw);

    return () => {
      pool.off("Deposited", onDeposit);
      pool.off("Withdrawn", onWithdraw);
    };
  }, [isConfigured, readonlyProvider, refreshState, tokenSymbol]);

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Level 4 • Production Ready</p>
        <h1>Advanced Pool Console</h1>
        <p className="subtitle">
          Inter-contract liquidity mechanics with live event streaming, wallet-driven actions, and production telemetry.
        </p>
        <div className="header-actions">
          <button onClick={connectWallet}>Connect Wallet</button>
          <button className="ghost" onClick={() => refreshState()}>
            Refresh
          </button>
        </div>
        <p className="status">{status}</p>
      </header>

      <section className="grid">
        <article className="panel metrics">
          <h2>Pool Snapshot</h2>
          <div className="metric-row"><span>Total Staked</span><strong>{Number(totalStaked).toFixed(4)} {tokenSymbol}</strong></div>
          <div className="metric-row"><span>Reward Rate</span><strong>{rewardRate} bps</strong></div>
          <div className="metric-row"><span>Your Wallet</span><strong>{wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Not connected"}</strong></div>
          <div className="metric-row"><span>Your Token Balance</span><strong>{Number(tokenBalance).toFixed(4)} {tokenSymbol}</strong></div>
          <div className="metric-row"><span>Your Staked Balance</span><strong>{Number(stakedBalance).toFixed(4)} {tokenSymbol}</strong></div>
        </article>

        <article className="panel action-panel">
          <h2>Liquidity Actions</h2>
          <label htmlFor="amount">Amount ({tokenSymbol})</label>
          <input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div className="action-row">
            <button onClick={deposit}>Approve + Deposit</button>
            <button className="ghost" onClick={withdraw}>Withdraw</button>
          </div>
          <p className="hint">Contracts: {isConfigured ? "configured" : "missing env vars"}</p>
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

export default App;
