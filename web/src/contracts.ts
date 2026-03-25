/**
 * @deprecated This file is deprecated - use stellar-contracts.ts instead
 * 
 * Migration notes:
 * - Old contract config imports have been replaced with stellar-contracts.ts
 * - All contract interactions now use Stellar SDK
 * - See stellar-contracts.ts, stellar-wallet.ts, and stellar-rpc.ts
 */

// Exported for backward compatibility - use stellar-contracts.ts instead
export const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS as string;
export const poolAddress = import.meta.env.VITE_POOL_ADDRESS as string;
export const rpcUrl = import.meta.env.VITE_STELLAR_RPC_URL as string;

