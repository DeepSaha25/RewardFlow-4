// Stellar Wallet Integration with Freighter

import * as FreighterAPI from "@stellar/freighter-api";

export interface ConnectWalletResult {
  success: boolean;
  publicKey?: string;
  error?: string;
}

/// Connect to Freighter wallet
export async function connectWallet(): Promise<ConnectWalletResult> {
  try {
    // Check if Freighter is installed
    if (!FreighterAPI.isConnected()) {
      return {
        success: false,
        error: "Freighter wallet not detected. Please install Freighter extension.",
      };
    }

    // Request user approval
    const response: any = await FreighterAPI.requestAccess();
    const publicKey = response.address || response;
    
    if (!publicKey) {
      return {
        success: false,
        error: "Failed to get public key from Freighter",
      };
    }

    return {
      success: true,
      publicKey,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error connecting wallet",
    };
  }
}

/// Sign a transaction with Freighter
export async function signTransaction(transactionXDR: string): Promise<string | null> {
  try {
    const signed = await FreighterAPI.signTransaction(transactionXDR, {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
    return signed;
  } catch (error) {
    console.error("Failed to sign transaction:", error);
    return null;
  }
}

/// Get public key from connected wallet
export async function getPublicKey(): Promise<string | null> {
  try {
    const response: any = await FreighterAPI.getAddress();
    return response.address || response;
  } catch (error) {
    console.error("Failed to get public key:", error);
    return null;
  }
}

/// Check if wallet is installed
export function isWalletAvailable(): boolean {
  try {
    return FreighterAPI.isConnected();
  } catch {
    return false;
  }
}

/// Subscribe to wallet changes
export function onWalletChange(callback: (publicKey: string | null) => void): () => void {
  // Freighter API doesn't have built-in change listener, so we poll
  let lastKey: string | null = null;
  const intervalId = setInterval(async () => {
    try {
      const response: any = await FreighterAPI.getAddress();
      const currentKey = response.address || response;
      if (currentKey !== lastKey) {
        lastKey = currentKey;
        callback(currentKey);
      }
    } catch (error) {
      console.error("Error polling wallet:", error);
    }
  }, 2000);

  return () => clearInterval(intervalId);
}
