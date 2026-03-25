// Stellar Soroban Contract Interfaces and Configuration

export interface TokenContractInterface {
  balanceOf: (account: string) => Promise<bigint>;
  symbol: () => Promise<string>;
  decimals: () => Promise<number>;
  approve: (spender: string, amount: bigint) => Promise<string>;
  transfer: (from: string, to: string, amount: bigint) => Promise<void>;
  mint: (to: string, amount: bigint) => Promise<void>;
}

export interface PoolContractInterface {
  deposit: (user: string, amount: bigint) => Promise<string>;
  withdraw: (user: string, amount: bigint) => Promise<string>;
  rewardRateBps: () => Promise<number>;
  stakeOf: (user: string) => Promise<bigint>;
  totalStaked: () => Promise<bigint>;
}

// Contract addresses (Stellar testnet - these will be replaced after deployment)
export const tokenAddress = (import.meta.env.VITE_TOKEN_ADDRESS as string) || 
  "CBQGMT42EW4V3NKUOEJQPLZPXMNJLZRFQ5GVO7M5LJQUMZDLCZZJ4QAA";

export const poolAddress = (import.meta.env.VITE_POOL_ADDRESS as string) || 
  "GDZST3XVCDTUJ76ZAV2HA72KYQJD5SNM3FCXE7AYDJWKEVQKM5H46NYB";

// Stellar network configuration
export const stellarNetwork = {
  passphrase: (import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE as string) || 
    "Test SDF Network ; September 2015",
  rpcUrl: (import.meta.env.VITE_STELLAR_RPC_URL as string) || 
    "https://soroban-testnet.stellar.org",
  friendbotUrl: "https://friendbot.stellar.org",
};

export const isConfigured = !!(tokenAddress && poolAddress);
